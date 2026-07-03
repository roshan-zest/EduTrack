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

async function resolveAccess(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  userId: string,
  email: string
): Promise<{ approved: boolean; role: AppRole }> {
  const isBootstrapAdmin = parseBootstrapAdminEmails().includes(email.toLowerCase());

  let roleResult;
  let requestResult;
  try {
    // ponytail: one parallel round trip replaces the old 3-5 sequential auth queries
    [roleResult, requestResult] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
      supabase
        .from("access_requests")
        .select("status, desired_role")
        .or(`user_id.eq.${userId},email.eq.${email}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ]);
  } catch {
    return { approved: isBootstrapAdmin, role: isBootstrapAdmin ? "admin" : "teacher" };
  }

  const request = requestResult.error ? null : requestResult.data;
  const approved = isBootstrapAdmin || request?.status === "approved";
  if (!approved) {
    return { approved: false, role: "teacher" };
  }

  const storedRole = roleResult.error ? null : roleResult.data?.role;
  const role: AppRole =
    storedRole === "admin" || isBootstrapAdmin || (!storedRole && request?.desired_role === "admin")
      ? "admin"
      : "teacher";

  // Self-heal a missing role row once (legacy accounts, bootstrap admins) —
  // never rewrite it on every request
  if (!storedRole && !roleResult.error) {
    await supabase.from("user_roles").upsert({ user_id: userId, role }, { onConflict: "user_id" });
  }

  return { approved: true, role };
}

export async function getAuthContextFromToken(token: string | undefined): Promise<AuthContext | null> {
  if (!token) {
    return null;
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] | null = null;

  try {
    const authResult = await supabase.auth.getUser(token);
    if (authResult.error || !authResult.data.user) {
      return null;
    }

    user = authResult.data.user;
  } catch {
    return null;
  }

  if (!user) {
    return null;
  }

  const email = user.email ?? "";
  if (!email) {
    return null;
  }

  const { approved, role } = await resolveAccess(supabase, user.id, email);
  if (!approved) {
    return null;
  }

  const metadata = user.user_metadata as Record<string, unknown> | null;
  const profileName =
    typeof metadata?.full_name === "string"
      ? metadata.full_name
      : typeof metadata?.name === "string"
        ? metadata.name
        : formatNameFromEmail(email);

  return {
    user: {
      id: user.id,
      email,
      name: profileName,
      phone: typeof metadata?.phone === "string" ? metadata.phone : undefined,
      department: typeof metadata?.department === "string" ? metadata.department : undefined,
      designation: typeof metadata?.designation === "string" ? metadata.designation : undefined,
      bio: typeof metadata?.bio === "string" ? metadata.bio : undefined,
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at ?? undefined
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
