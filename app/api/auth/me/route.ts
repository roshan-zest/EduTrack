import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, getAuthContextFromToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const auth = await getAuthContextFromToken(token);

  if (!auth) {
    return NextResponse.json({
      success: true,
      authenticated: false,
      role: null,
      email: null,
      accessStatus: "pending"
    });
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    role: auth.role,
    email: auth.user.email,
    name: auth.user.name,
    userId: auth.user.id,
    phone: auth.user.phone ?? null,
    department: auth.user.department ?? null,
    designation: auth.user.designation ?? null,
    bio: auth.user.bio ?? null,
    createdAt: auth.user.createdAt ?? null,
    lastSignInAt: auth.user.lastSignInAt ?? null,
    accessStatus: "approved"
  });
}
