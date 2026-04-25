import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ACCESS_TOKEN_COOKIE, getAuthContextFromToken } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const updateTeacherSchema = z.object({
  currentEmail: z.string().email(),
  email: z.string().email(),
  name: z.string().trim().min(1),
  password: z.string().trim().min(1),
  department: z.string().trim().min(1),
  role: z.enum(["admin", "teacher"]).default("teacher")
});

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const auth = await getAuthContextFromToken(token);

  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const parsed = updateTeacherSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase server config missing" }, { status: 503 });
  }

  const currentEmail = parsed.data.currentEmail.trim().toLowerCase();
  const email = parsed.data.email.trim().toLowerCase();
  const name = parsed.data.name;
  const password = parsed.data.password;
  const department = parsed.data.department;
  const role = parsed.data.role;

  const usersResult = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersResult.error) {
    return NextResponse.json({ success: false, error: usersResult.error.message }, { status: 500 });
  }

  const existingUser = usersResult.data.users.find((user) => {
    const candidate = (user.email ?? "").toLowerCase();
    return candidate === currentEmail || candidate === email;
  });

  let userId = existingUser?.id;

  if (existingUser) {
    const existingMetadata = (existingUser.user_metadata as Record<string, unknown> | null) ?? {};
    const updateUserResult = await supabase.auth.admin.updateUserById(existingUser.id, {
      email,
      password,
      email_confirm: true,
      user_metadata: {
        ...existingMetadata,
        full_name: name,
        department,
        login_password: password
      }
    });

    if (updateUserResult.error) {
      return NextResponse.json({ success: false, error: updateUserResult.error.message }, { status: 500 });
    }
  } else {
    const createUserResult = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        department,
        login_password: password
      }
    });

    if (createUserResult.error || !createUserResult.data.user) {
      return NextResponse.json({ success: false, error: createUserResult.error?.message ?? "Unable to create user" }, { status: 500 });
    }

    userId = createUserResult.data.user.id;
  }

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unable to resolve user id" }, { status: 500 });
  }

  const roleResult = await supabase.from("user_roles").upsert(
    {
      user_id: userId,
      role,
      assigned_by: auth.user.id,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id" }
  );

  if (roleResult.error) {
    return NextResponse.json({ success: false, error: roleResult.error.message }, { status: 500 });
  }

  const accessRequestUpsert = await supabase
    .from("access_requests")
    .upsert(
      {
        email,
        user_id: userId,
        access_code: password,
        desired_role: role,
        status: "approved",
        approved_by: auth.user.id,
        approved_at: new Date().toISOString(),
        rejected_by: null,
        rejected_at: null,
        updated_at: new Date().toISOString()
      },
      { onConflict: "email" }
    )
    .select("email, access_code, status")
    .maybeSingle();

  if (accessRequestUpsert.error) {
    return NextResponse.json({ success: false, error: accessRequestUpsert.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: accessRequestUpsert.data });
}