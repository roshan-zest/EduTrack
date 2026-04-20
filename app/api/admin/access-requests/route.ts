import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ACCESS_TOKEN_COOKIE, getAuthContextFromToken } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const requestActionSchema = z.object({
  requestId: z.string().uuid(),
  note: z.string().trim().max(280).optional(),
  role: z.enum(["admin", "teacher"]).default("teacher")
});

function isMissingDesiredRoleColumn(errorMessage: string) {
  return /desired_role|schema cache|column .* does not exist/i.test(errorMessage);
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const auth = await getAuthContextFromToken(token);

  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase server config missing" }, { status: 503 });
  }

  const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";

  const { data, error } = await supabase
    .from("access_requests")
    .select("id, user_id, email, access_code, desired_role, status, note, created_at, approved_at, rejected_at")
    .order("created_at", { ascending: false });

  if (!error) {
    const filtered = (data ?? []).filter((item) => {
      if (!search) {
        return true;
      }

      return [item.email, item.access_code, item.status, item.note ?? "", item.id, item.user_id ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });

    return NextResponse.json({ success: true, data: filtered });
  }

  if (!isMissingDesiredRoleColumn(error.message)) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const legacyResult = await supabase
    .from("access_requests")
    .select("id, user_id, email, access_code, status, note, created_at, approved_at, rejected_at")
    .order("created_at", { ascending: false });

  if (legacyResult.error) {
    return NextResponse.json({ success: false, error: legacyResult.error.message }, { status: 500 });
  }

  const legacyFiltered = (legacyResult.data ?? []).filter((item) => {
    if (!search) {
      return true;
    }

    return [item.email, item.access_code, item.status, item.note ?? "", item.id, item.user_id ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });

  return NextResponse.json({
    success: true,
    data: legacyFiltered.map((item) => ({
      ...item,
      desired_role: "teacher"
    }))
  });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const auth = await getAuthContextFromToken(token);

  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase server config missing" }, { status: 503 });
  }

  const parsed = requestActionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { requestId, note } = parsed.data;
  const { role } = parsed.data;
  const { data: existing, error: existingError } = await supabase
    .from("access_requests")
    .select("id, email, status, user_id, access_code, note, desired_role")
    .eq("id", requestId)
    .maybeSingle();

  let existingRequest = existing;

  if (existingError) {
    if (!isMissingDesiredRoleColumn(existingError.message)) {
      return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
    }

    const legacyExisting = await supabase
      .from("access_requests")
      .select("id, email, status, user_id, access_code, note")
      .eq("id", requestId)
      .maybeSingle();

    if (legacyExisting.error || !legacyExisting.data) {
      return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
    }

    existingRequest = {
      ...legacyExisting.data,
      desired_role: "teacher"
    };
  }

  if (!existingRequest) {
    return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
  }

  const allUsers = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (allUsers.error) {
    return NextResponse.json({ success: false, error: allUsers.error.message }, { status: 500 });
  }

  const matchedUser = allUsers.data.users.find((user) => (user.email ?? "").toLowerCase() === existingRequest.email.toLowerCase());
  let targetUserId = existingRequest.user_id ?? matchedUser?.id ?? null;

  if (!targetUserId) {
    const createUserResult = await supabase.auth.admin.createUser({
      email: existingRequest.email,
      password: existingRequest.access_code,
      email_confirm: true
    });

    if (createUserResult.error) {
      return NextResponse.json({ success: false, error: createUserResult.error.message }, { status: 500 });
    }

    targetUserId = createUserResult.data.user?.id ?? null;
  }

  if (targetUserId) {
    const withRoleColumn = await supabase.from("access_requests").update({
      user_id: targetUserId,
      desired_role: role,
      updated_at: new Date().toISOString()
    }).eq("id", requestId);

    if (withRoleColumn.error && isMissingDesiredRoleColumn(withRoleColumn.error.message)) {
      const withoutRoleColumn = await supabase.from("access_requests").update({
        user_id: targetUserId,
        updated_at: new Date().toISOString()
      }).eq("id", requestId);

      if (withoutRoleColumn.error) {
        return NextResponse.json({ success: false, error: withoutRoleColumn.error.message }, { status: 500 });
      }
    } else if (withRoleColumn.error) {
      return NextResponse.json({ success: false, error: withRoleColumn.error.message }, { status: 500 });
    }

    const { error: roleError } = await supabase.from("user_roles").upsert(
      {
        user_id: targetUserId,
        role,
        assigned_by: auth.user.id,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );

    if (roleError) {
      return NextResponse.json({ success: false, error: roleError.message }, { status: 500 });
    }
  }

  const { error: updateError } = await supabase.from("access_requests").update({
    status: "approved",
    approved_by: auth.user.id,
    approved_at: new Date().toISOString(),
    rejected_by: null,
    rejected_at: null,
    note: note ?? existingRequest.note ?? null,
    updated_at: new Date().toISOString()
  }).eq("id", requestId);

  if (updateError) {
    return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { accessCode: existingRequest.access_code } });
}

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const auth = await getAuthContextFromToken(token);

  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase server config missing" }, { status: 503 });
  }

  const parsed = requestActionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { requestId, note } = parsed.data;

  const { error } = await supabase.from("access_requests").update({
    status: "rejected",
    rejected_by: auth.user.id,
    rejected_at: new Date().toISOString(),
    note: note ?? null,
    updated_at: new Date().toISOString()
  }).eq("id", requestId);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}