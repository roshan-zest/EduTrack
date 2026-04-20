import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const querySchema = z.object({
  email: z.string().email()
});

export async function POST(request: NextRequest) {
  const parsed = querySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  }

  const { email } = parsed.data;
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase server config missing" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("access_requests")
    .select("status, access_code")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: data ? { status: data.status, accessCode: data.access_code } : { status: "not_found", accessCode: null }
  });
}