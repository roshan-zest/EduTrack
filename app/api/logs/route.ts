import { NextRequest, NextResponse } from "next/server";
import { createTeachingLogData, getTeachingLogsData, createTeachingLogsBulkData } from "@/lib/data-access";

export async function GET() {
  const result = await getTeachingLogsData();
  return NextResponse.json({
    success: true,
    source: result.source,
    data: result.data
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  let result;
  if (Array.isArray(body)) {
    result = await createTeachingLogsBulkData(body);
  } else {
    result = await createTeachingLogData(body);
  }

  return NextResponse.json(
    {
      success: true,
      source: result.source,
      data: result.data
    },
    { status: 201 }
  );
}
