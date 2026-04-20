import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AppRole = "admin" | "teacher";

export const ACCESS_TOKEN_COOKIE = "edutrack-access-token";
export const REFRESH_TOKEN_COOKIE = "edutrack-refresh-token";

export type AuthContext = {
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    department?: string;
    designation?: string;
    bio?: string;
    createdAt?: string;
    lastSignInAt?: string;
  };
  role: AppRole;
};

async function hasApprovedAccess(userId: string, email: string): Promise<boolean> {
  const bootstrapEmails = parseBootstrapAdminEmails();
  if (bootstrapEmails.includes(email.toLowerCase())) {
    return true;
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return false;
  }

  const { data, error } = await supabase
    .from("access_requests")
    .select("status")
    .or(`user_id.eq.${userId},email.eq.${email}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!error && data?.status === "approved") {
    return true;
  }

  return false;
}

function formatNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "";
  const normalized = localPart.replace(/[._-]+/g, " ").trim();
  if (!normalized) {
    return "EduTrack User";
  }

  return normalized
    .split(" ")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function parseBootstrapAdminEmails() {
  const rawValue = process.env.INITIAL_ADMIN_EMAILS ?? process.env.INITIAL_ADMIN_EMAIL ?? "";

  return rawValue
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

async function resolveRole(userId: string, email: string): Promise<AppRole> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return "admin";
  }

  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
  if (!error && data?.role === "admin") {
    return "admin";
  }

  const bootstrapEmails = parseBootstrapAdminEmails();
  if (bootstrapEmails.includes(email.toLowerCase())) {
    await supabase.from("user_roles").upsert(
      {
        user_id: userId,
        role: "admin"
      },
      { onConflict: "user_id" }
    );

    return "admin";
  }

  const requestedRoleResult = await supabase
    .from("access_requests")
    .select("desired_role, status")
    .or(`user_id.eq.${userId},email.eq.${email}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!requestedRoleResult.error && requestedRoleResult.data?.status === "approved") {
    const fallbackRole: AppRole = requestedRoleResult.data.desired_role === "admin" ? "admin" : "teacher";

    await supabase.from("user_roles").upsert(
      {
        user_id: userId,
        role: fallbackRole
      },
      { onConflict: "user_id" }
    );

    return fallbackRole;
  }

  return "teacher";
}

export async function getAuthContextFromToken(token: string | undefined): Promise<AuthContext | null> {
  if (!token) {
    return null;
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  const email = data.user.email ?? "";
  if (!email) {
    return null;
  }

  const approved = await hasApprovedAccess(data.user.id, email);
  if (!approved) {
    return null;
  }

  const role = await resolveRole(data.user.id, email);
  const metadata = data.user.user_metadata as Record<string, unknown> | null;
  const profileName =
    typeof metadata?.full_name === "string"
      ? metadata.full_name
      : typeof metadata?.name === "string"
        ? metadata.name
        : formatNameFromEmail(email);

  return {
    user: {
      id: data.user.id,
      email,
      name: profileName,
      phone: typeof metadata?.phone === "string" ? metadata.phone : undefined,
      department: typeof metadata?.department === "string" ? metadata.department : undefined,
      designation: typeof metadata?.designation === "string" ? metadata.designation : undefined,
      bio: typeof metadata?.bio === "string" ? metadata.bio : undefined,
      createdAt: data.user.created_at,
      lastSignInAt: data.user.last_sign_in_at ?? undefined
    },
    role
  };
}

export async function getAuthContextFromCookies(): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  return getAuthContextFromToken(token);
}

export async function requireAdminPage() {
  const auth = await getAuthContextFromCookies();
  if (!auth || auth.role !== "admin") {
    redirect("/signin?next=/admin");
  }

  return auth;
}

export async function requireAuthPage(nextPath = "/") {
  const auth = await getAuthContextFromCookies();
  if (!auth) {
    redirect(`/signin?next=${encodeURIComponent(nextPath)}`);
  }

  return auth;
}
