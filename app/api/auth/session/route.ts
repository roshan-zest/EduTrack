import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth";

const oneWeekInSeconds = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    accessToken?: string;
    refreshToken?: string;
  };

  if (!body.accessToken || !body.refreshToken) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing access or refresh token"
      },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set(ACCESS_TOKEN_COOKIE, body.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: oneWeekInSeconds
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, body.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: oneWeekInSeconds
  });

  return response;
}

export function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });

  return response;
}
