import { NextRequest, NextResponse } from "next/server";
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
  const body = await request.json();
  const result = await saveCurriculumCatalogData(body);

  return NextResponse.json({
    success: true,
    source: result.source,
    data: result.data
  });
}
