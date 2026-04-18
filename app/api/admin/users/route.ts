import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ACCESS_TOKEN_COOKIE, getAuthContextFromToken } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "teacher"])
});

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const auth = await getAuthContextFromToken(token);

  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "Supabase server config missing" },
      { status: 503 }
    );
  }

  const [{ data: userPage, error: usersError }, { data: roles, error: rolesError }] = await Promise.all([
    supabase.auth.admin.listUsers({ page: 1, perPage: 500 }),
    supabase.from("user_roles").select("user_id, role")
  ]);

  if (usersError || rolesError) {
    return NextResponse.json(
      {
        success: false,
        error: usersError?.message ?? rolesError?.message ?? "Failed to load users"
      },
      { status: 500 }
    );
  }

  const roleMap = new Map((roles ?? []).map((entry) => [entry.user_id, entry.role]));

  const users = userPage.users.map((user) => ({
    id: user.id,
    email: user.email ?? "",
    role: roleMap.get(user.id) === "admin" ? "admin" : "teacher",
    createdAt: user.created_at
  }));

  return NextResponse.json({ success: true, data: users });
}

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const auth = await getAuthContextFromToken(token);

  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "Supabase server config missing" },
      { status: 503 }
    );
  }

  const parsed = updateRoleSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid payload",
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const { userId, role } = parsed.data;

  const { error } = await supabase.from("user_roles").upsert(
    {
      user_id: userId,
      role,
      assigned_by: auth.user.id,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
