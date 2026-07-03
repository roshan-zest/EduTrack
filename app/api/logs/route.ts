import { NextRequest, NextResponse } from "next/server";
import { getAuthContextFromCookies } from "@/lib/auth";
import { getTeachingLogsData, createTeachingLogsBulkData } from "@/lib/data-access";

export async function GET() {
  const auth = await getAuthContextFromCookies();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await getTeachingLogsData();
  const data =
    auth.role === "admin"
      ? result.data
      : result.data.filter((log) => log.teacherId === auth.user.id);

  return NextResponse.json({
    success: true,
    source: result.source,
    data
  });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthContextFromCookies();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Identity always comes from the session, never from the client payload
  const payloads = (Array.isArray(body) ? body : [body]).map((entry) => ({
    ...(entry as Record<string, unknown>),
    teacherId: auth.user.id,
    teacherName: auth.user.name
  }));

  try {
    const result = await createTeachingLogsBulkData(payloads);
    return NextResponse.json(
      {
        success: true,
        source: result.source,
        data: result.data
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save logs";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
