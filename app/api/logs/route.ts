import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ACCESS_TOKEN_COOKIE, getAuthContextFromToken } from "@/lib/auth";
import { createTeachingLogData, getTeachingLogsData } from "@/lib/data-access";

const logPayloadSchema = z.object({
  program: z.string().min(1),
  semester: z.string().min(1),
  subject: z.string().min(1),
  section: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  methodology: z.string().min(1),
  topic: z.string().min(1),
  notes: z.string().optional().default(""),
  date: z.string().min(1)
});

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const auth = await getAuthContextFromToken(token);
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await getTeachingLogsData();
  const filteredData =
    auth.role === "admin"
      ? result.data
      : result.data.filter(
          (entry) =>
            entry.teacherId === auth.user.id ||
            entry.teacherName.toLowerCase() === auth.user.name.toLowerCase()
        );

  return NextResponse.json({
    success: true,
    source: result.source,
    data: filteredData
  });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const auth = await getAuthContextFromToken(token);
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const parsed = logPayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const result = await createTeachingLogData({
    teacherId: auth.user.id,
    teacherName: auth.user.name,
    program: parsed.data.program,
    semester: parsed.data.semester,
    subject: parsed.data.subject,
    section: parsed.data.section,
    startTime: parsed.data.startTime,
    endTime: parsed.data.endTime,
    methodology: parsed.data.methodology,
    topic: parsed.data.topic,
    notes: parsed.data.notes,
    date: parsed.data.date
  });

  return NextResponse.json(
    {
      success: true,
      source: result.source,
      data: result.data
    },
    { status: 201 }
  );
}
