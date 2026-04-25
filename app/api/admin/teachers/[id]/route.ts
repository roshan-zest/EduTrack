import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ACCESS_TOKEN_COOKIE, getAuthContextFromToken } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const updateStatusSchema = z.object({
  action: z.enum(["suspend", "delete", "restore"])
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const auth = await getAuthContextFromToken(token);

  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase server config missing" }, { status: 503 });
  }

  const parsed = updateStatusSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { action } = parsed.data;

  const targetStatus = action === "delete" ? "rejected" : "approved";
  const banDuration = action === "suspend" || action === "delete" ? "876000h" : "none"; // 100 years

  // 1. Update the access request status
  // Try to match either user_id = id OR id = id to handle both auth users and legacy requests
  const { error: updateError } = await supabase
    .from("access_requests")
    .update({ 
      status: targetStatus,
      note: action === "delete" ? "Soft deleted by admin" : action === "suspend" ? "Suspended by admin" : "Restored",
      updated_at: new Date().toISOString(),
      ...(action === "delete" ? { rejected_at: new Date().toISOString() } : {})
    })
    .or(`user_id.eq.${id},id.eq.${id}`);

  if (updateError) {
    console.error("Teacher Delete Error:", updateError);
    return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
  }

  // 2. Ban/Unban the auth user if the id is a valid UUID
  // Supabase Auth requires a valid UUID. If id is from access_requests, it might still be a UUID.
  // We'll try to ban the user and ignore the error if they don't exist in Auth.
  if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    const { error: banError } = await supabase.auth.admin.updateUserById(id, { ban_duration: banDuration });
    if (banError) {
      console.error("Teacher Ban Error (Ignored):", banError.message);
    }
  }

  return NextResponse.json({ success: true, action, targetStatus });
}
