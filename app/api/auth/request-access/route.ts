import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const requestAccessSchema = z.object({
  email: z.string().email(),
  desiredRole: z.enum(["admin", "teacher"]).default("teacher")
});

function generateCode() {
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("");
}

function isMissingDesiredRoleColumn(errorMessage: string) {
  return /desired_role|schema cache|column .* does not exist/i.test(errorMessage);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase server config missing" }, { status: 503 });
  }

  const parsed = requestAccessSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { email, desiredRole } = parsed.data;
  const accessCode = generateCode();

  const { data, error } = await supabase
    .from("access_requests")
    .upsert(
      {
        email,
        user_id: null,
        access_code: accessCode,
        desired_role: desiredRole,
        status: "pending",
        updated_at: new Date().toISOString()
      },
      { onConflict: "email" }
    )
    .select("id, user_id, email, access_code, desired_role, status, note, created_at, approved_at, rejected_at")
    .single();

  if (error) {
    if (!isMissingDesiredRoleColumn(error.message)) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const retry = await supabase
      .from("access_requests")
      .upsert(
        {
          email,
          user_id: null,
          access_code: accessCode,
          status: "pending",
          updated_at: new Date().toISOString()
        },
        { onConflict: "email" }
      )
      .select("id, user_id, email, access_code, status, note, created_at, approved_at, rejected_at")
      .single();

    if (retry.error) {
      return NextResponse.json({ success: false, error: retry.error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...retry.data,
        desired_role: desiredRole
      }
    });
  }

  return NextResponse.json({ success: true, data });
}