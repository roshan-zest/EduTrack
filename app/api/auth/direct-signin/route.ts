import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, getAuthContextFromToken } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const oneWeekInSeconds = 60 * 60 * 24 * 7;

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function buildAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function setSessionCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: oneWeekInSeconds
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: oneWeekInSeconds
  });
}

async function readAccessStatusByEmail(email: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { status: "not_found" as const };
  }

  try {
    const { data } = await supabase
      .from("access_requests")
      .select("status, access_code")
      .eq("email", email)
      .maybeSingle();

    if (!data) {
      return { status: "not_found" as const };
    }

    return {
      status: data.status as "pending" | "approved" | "rejected",
      accessCode: data.access_code as string
    };
  } catch {
    return { status: "not_found" as const };
  }
}

export async function POST(request: NextRequest) {
  const parsed = signInSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  const anonClient = buildAnonClient();
  if (!anonClient) {
    return NextResponse.json({ success: false, error: "Supabase auth config missing" }, { status: 503 });
  }

  let signInResult: Awaited<ReturnType<typeof anonClient.auth.signInWithPassword>>;
  try {
    signInResult = await anonClient.auth.signInWithPassword({ email, password });
  } catch {
    return NextResponse.json({ success: false, accessStatus: "invalid", error: "Authentication network error" }, { status: 502 });
  }

  if (signInResult.error || !signInResult.data.session) {
    const accessStatus = await readAccessStatusByEmail(email);

    if (accessStatus.status === "pending") {
      return NextResponse.json(
        {
          success: false,
          accessStatus: "pending",
          error: "Registration pending approval",
          accessCode: accessStatus.accessCode ?? null
        },
        { status: 403 }
      );
    }
    return NextResponse.json({ success: false, accessStatus: "invalid", error: "Invalid email or password" }, { status: 401 });
  }

  const authContext = await getAuthContextFromToken(signInResult.data.session.access_token);
  if (!authContext) {
    return NextResponse.json({ success: false, accessStatus: "pending", error: "Registration pending approval" }, { status: 403 });
  }

  const response = NextResponse.json({
    success: true,
    authenticated: true,
    role: authContext.role,
    email: authContext.user.email,
    name: authContext.user.name
  });

  setSessionCookies(response, signInResult.data.session.access_token, signInResult.data.session.refresh_token);
  return response;
}