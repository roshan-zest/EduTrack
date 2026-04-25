import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function generateCode() {
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("");
}

export async function POST(request: NextRequest) {
  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase server config missing" }, { status: 503 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  const [existingRequestResult, usersResult] = await Promise.all([
    supabase
      .from("access_requests")
      .select("id, email, access_code, desired_role, status, created_at, approved_at, rejected_at, note")
      .eq("email", email)
      .maybeSingle(),
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  ]);

  if (usersResult.error) {
    return NextResponse.json({ success: false, error: usersResult.error.message }, { status: 500 });
  }

  const existingUser = usersResult.data.users.find((user) => (user.email ?? "").toLowerCase() === email);
  if (existingUser) {
    const existingMetadata = (existingUser.user_metadata as Record<string, unknown> | null) ?? {};
    const updateUserResult = await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...existingMetadata,
        full_name: typeof existingMetadata.full_name === "string" ? existingMetadata.full_name : email.split("@")[0],
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
        full_name: email.split("@")[0],
        login_password: password
      }
    });

    if (createUserResult.error) {
      return NextResponse.json({ success: false, error: createUserResult.error.message }, { status: 500 });
    }
  }

  if (!existingRequestResult.error && existingRequestResult.data?.status === "approved") {
    return NextResponse.json({
      success: true,
      data: {
        access_code: existingRequestResult.data.access_code,
        status: "approved"
      }
    });
  }

  const accessCode = generateCode();
  const upsertResult = await supabase
    .from("access_requests")
    .upsert(
      {
        email,
        user_id: existingUser?.id ?? null,
        access_code: accessCode,
        desired_role: "teacher",
        status: "pending",
        note: null,
        updated_at: new Date().toISOString()
      },
      { onConflict: "email" }
    )
    .select("access_code, status")
    .single();

  if (upsertResult.error) {
    return NextResponse.json({ success: false, error: upsertResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: {
      access_code: upsertResult.data.access_code,
      status: upsertResult.data.status
    }
  });
}