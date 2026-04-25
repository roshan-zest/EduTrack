import { randomUUID } from "crypto";
import { z } from "zod";
import { getDevCatalog, getDevLogs, setDevCatalog, addDevLog } from "@/lib/dev-store";
import { curriculumCatalog, teachingLogs as mockTeachingLogs, teachers as mockTeachers } from "@/lib/mock-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CurriculumCatalog, TeachingLog } from "@/lib/types";

const curriculumCatalogSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    semesters: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        sections: z.array(
          z.object({
            id: z.string(),
            name: z.string()
          })
        ),
        subjects: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            code: z.string()
          })
        )
      })
    )
  })
);

const teachingLogPayloadSchema = z.object({
  teacherId: z.string().min(1),
  teacherName: z.string().min(1),
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

export type TeachingLogPayload = z.infer<typeof teachingLogPayloadSchema>;

export async function getCurriculumCatalogData(): Promise<{ data: CurriculumCatalog; source: "supabase" | "memory" }> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return { data: getDevCatalog(), source: "memory" };
  }

  const { data, error } = await supabase
    .from("curriculum_catalog")
    .select("catalog")
    .eq("slug", "default")
    .maybeSingle();

  if (error || !data?.catalog) {
    return { data: curriculumCatalog, source: "memory" };
  }

  const parsedCatalog = curriculumCatalogSchema.safeParse(data.catalog);
  if (!parsedCatalog.success) {
    return { data: curriculumCatalog, source: "memory" };
  }

  return { data: parsedCatalog.data, source: "supabase" };
}

export async function saveCurriculumCatalogData(catalog: CurriculumCatalog): Promise<{
  data: CurriculumCatalog;
  source: "supabase" | "memory";
}> {
  const parsedCatalog = curriculumCatalogSchema.parse(catalog);
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return { data: setDevCatalog(parsedCatalog), source: "memory" };
  }

  const { error } = await supabase.from("curriculum_catalog").upsert(
    {
      slug: "default",
      catalog: parsedCatalog,
      updated_at: new Date().toISOString()
    },
    { onConflict: "slug" }
  );

  if (error) {
    return { data: setDevCatalog(parsedCatalog), source: "memory" };
  }

  return { data: parsedCatalog, source: "supabase" };
}

export async function getTeachingLogsData(): Promise<{ data: TeachingLog[]; source: "supabase" | "memory" }> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return { data: getDevLogs(), source: "memory" };
  }

  const { data, error } = await supabase
    .from("teaching_logs")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { data: getDevLogs(), source: "memory" };
  }

  if (!data.length) {
    return { data: mockTeachingLogs, source: "memory" };
  }

  return {
    data: data.map((row) => ({
      id: row.id,
      teacherId: row.teacher_id,
      teacherName: row.teacher_name,
      program: row.program,
      semester: row.semester,
      subject: row.subject,
      section: row.section,
      startTime: row.start_time,
      endTime: row.end_time,
      methodology: row.methodology,
      topic: row.topic,
      notes: row.notes ?? "",
      date: row.date
    })),
    source: "supabase"
  };
}

export async function createTeachingLogData(payload: unknown): Promise<{
  data: TeachingLog;
  source: "supabase" | "memory";
}> {
  const parsedPayload = teachingLogPayloadSchema.parse(payload);
  const nextLog: TeachingLog = {
    id: randomUUID(),
    ...parsedPayload
  };

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return { data: addDevLog(nextLog), source: "memory" };
  }

  const { error } = await supabase.from("teaching_logs").insert({
    id: nextLog.id,
    teacher_id: nextLog.teacherId,
    teacher_name: nextLog.teacherName,
    program: nextLog.program,
    semester: nextLog.semester,
    subject: nextLog.subject,
    section: nextLog.section,
    start_time: nextLog.startTime,
    end_time: nextLog.endTime,
    methodology: nextLog.methodology,
    topic: nextLog.topic,
    notes: nextLog.notes ?? "",
    date: nextLog.date
  });

  if (error) {
    return { data: addDevLog(nextLog), source: "memory" };
  }

  return { data: nextLog, source: "supabase" };
}

function formatNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "";
  const normalized = localPart.replace(/[._-]+/g, " ").trim();

  if (!normalized) {
    return "EduTrack User";
  }

  return normalized
    .split(" ")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export async function getTeacherDirectoryData(): Promise<{ data: typeof mockTeachers; source: "supabase" | "memory" }> {
  const localTeachers = mockTeachers.filter((teacher) => teacher.role === "teacher");
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return { data: localTeachers, source: "memory" };
  }

  let usersResult:
    | Awaited<ReturnType<NonNullable<typeof supabase>["auth"]["admin"]["listUsers"]>>
    | null = null;
  let rolesResult: { data: Array<{ user_id: string; role: string }> | null; error: { message: string } | null } | null = null;
  let accessRequestResult: { data: Array<{ email: string; access_code: string; status: string }> | null; error: { message: string } | null } | null = null;

  try {
    const [usersResponse, rolesResponse, accessResponse] = await Promise.all([
      supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("access_requests").select("email, access_code, status")
    ]);

    usersResult = usersResponse;
    rolesResult = {
      data: (rolesResponse.data as Array<{ user_id: string; role: string }> | null) ?? null,
      error: rolesResponse.error ? { message: rolesResponse.error.message } : null
    };
    accessRequestResult = {
      data: (accessResponse.data as Array<{ email: string; access_code: string; status: string }> | null) ?? null,
      error: accessResponse.error ? { message: accessResponse.error.message } : null
    };
  } catch {
    return { data: localTeachers, source: "memory" };
  }

  if (!usersResult || !rolesResult || !accessRequestResult || usersResult.error || rolesResult.error || accessRequestResult.error) {
    return { data: localTeachers, source: "memory" };
  }

  const roleMap = new Map((rolesResult.data ?? []).map((entry) => [entry.user_id, entry.role]));
  const approvedAccessCodeByEmail = new Map(
    (accessRequestResult.data ?? [])
      .filter((entry) => entry.status === "approved")
      .map((entry) => [entry.email.toLowerCase(), entry.access_code])
  );
  const directoryMap = new Map<string, (typeof localTeachers)[number]>();

  for (const teacher of localTeachers) {
    directoryMap.set(teacher.email.toLowerCase(), teacher);
  }

  for (const user of usersResult.data.users) {
    const role = roleMap.get(user.id);
    if (role !== "teacher") {
      continue;
    }

    const email = user.email ?? "";
    if (!email) {
      continue;
    }

    const metadata = user.user_metadata as Record<string, unknown> | null;
    const persistedPassword = typeof metadata?.login_password === "string" ? metadata.login_password : undefined;
    const displayName =
      typeof metadata?.full_name === "string"
        ? metadata.full_name
        : typeof metadata?.name === "string"
          ? metadata.name
          : formatNameFromEmail(email);

    directoryMap.set(email.toLowerCase(), {
      id: user.id,
      name: displayName,
      email,
      password: persistedPassword ?? approvedAccessCodeByEmail.get(email.toLowerCase()),
      department: typeof metadata?.department === "string" ? metadata.department : "Teaching Staff",
      role: "teacher"
    });
  }

  return {
    data: Array.from(directoryMap.values()),
    source: "supabase"
  };
}
