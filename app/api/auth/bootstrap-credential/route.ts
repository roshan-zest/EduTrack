import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { teachers } from "@/lib/mock-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const credentialSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase server config missing" }, { status: 503 });
  }

  const parsed = credentialSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const password = parsed.data.password;

  const [accessRequestResult, usersResult] = await Promise.all([
    supabase
      .from("access_requests")
      .select("id, status, access_code, desired_role, user_id")
      .eq("email", email)
      .maybeSingle(),
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  ]);

  if (usersResult.error) {
    return NextResponse.json({ success: false, error: usersResult.error.message }, { status: 500 });
  }

  const approvedRequest = accessRequestResult.data?.status === "approved" ? accessRequestResult.data : null;
  const matchedRosterTeacher = teachers.find((teacher) => teacher.email.toLowerCase() === email && teacher.password === password);
  const matchedAccessCode = approvedRequest?.access_code === password ? approvedRequest : null;
  const matchedUser = usersResult.data.users.find((user) => (user.email ?? "").toLowerCase() === email);
  const matchedRegisteredPassword =
    typeof (matchedUser?.user_metadata as Record<string, unknown> | null)?.login_password === "string" &&
    (matchedUser?.user_metadata as Record<string, unknown>).login_password === password;

  if (!matchedRosterTeacher && !matchedAccessCode && !matchedRegisteredPassword) {
    return NextResponse.json({ success: false, error: "Credential not recognized" }, { status: 401 });
  }

  if (!approvedRequest) {
    return NextResponse.json({ success: false, error: "Registration pending approval" }, { status: 403 });
  }

  if (matchedUser) {
    const existingMetadata = (matchedUser.user_metadata as Record<string, unknown> | null) ?? {};
    const updateResult = await supabase.auth.admin.updateUserById(matchedUser.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...existingMetadata,
        login_password: password
      }
    });

    if (updateResult.error) {
      return NextResponse.json({ success: false, error: updateResult.error.message }, { status: 500 });
    }
  } else {
    const createResult = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        login_password: password
      }
    });

    if (createResult.error) {
      return NextResponse.json({ success: false, error: createResult.error.message }, { status: 500 });
    }
  }

  const targetUserId = matchedUser?.id ?? (await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })).data.users.find((user) => (user.email ?? "").toLowerCase() === email)?.id;

  if (targetUserId) {
    const roleResult = await supabase.from("user_roles").upsert(
      {
        user_id: targetUserId,
        role: approvedRequest.desired_role,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );

    if (roleResult.error) {
      return NextResponse.json({ success: false, error: roleResult.error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}