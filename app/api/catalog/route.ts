import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, getAuthContextFromToken } from "@/lib/auth";
import { getCurriculumCatalogData, saveCurriculumCatalogData } from "@/lib/data-access";

export async function GET() {
  const result = await getCurriculumCatalogData();

  return NextResponse.json({
    success: true,
    source: result.source,
    data: result.data
  });
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const auth = await getAuthContextFromToken(token);

  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = await saveCurriculumCatalogData(body);

  return NextResponse.json({
    success: true,
    source: result.source,
    data: result.data
  });
}
