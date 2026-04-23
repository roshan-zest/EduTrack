import { randomUUID } from "crypto";
import { z } from "zod";
import { getDevCatalog, getDevLogs, setDevCatalog, addDevLog } from "@/lib/dev-store";
import { curriculumCatalog, teachingLogs as mockTeachingLogs } from "@/lib/mock-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CurriculumCatalog, TeachingLog, Teacher } from "@/lib/types";

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
  const result = await createTeachingLogsBulkData([payload]);
  return { data: result.data[0], source: result.source };
}

export async function createTeachingLogsBulkData(payloads: unknown[]): Promise<{
  data: TeachingLog[];
  source: "supabase" | "memory";
}> {
  const parsedPayloads = payloads.map((payload) => teachingLogPayloadSchema.parse(payload));
  const nextLogs: TeachingLog[] = parsedPayloads.map((parsed) => ({
    id: randomUUID(),
    ...parsed
  }));

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    nextLogs.forEach((log) => addDevLog(log));
    return { data: nextLogs, source: "memory" };
  }

  const insertData = nextLogs.map((log) => ({
    id: log.id,
    teacher_id: log.teacherId,
    teacher_name: log.teacherName,
    program: log.program,
    semester: log.semester,
    subject: log.subject,
    section: log.section,
    start_time: log.startTime,
    end_time: log.endTime,
    methodology: log.methodology,
    topic: log.topic,
    notes: log.notes ?? "",
    date: log.date
  }));

  const { error } = await supabase.from("teaching_logs").insert(insertData);

  if (error) {
    nextLogs.forEach((log) => addDevLog(log));
    return { data: nextLogs, source: "memory" };
  }

  return { data: nextLogs, source: "supabase" };
}

export async function getTeachersData(): Promise<{ data: Teacher[]; source: "supabase" | "memory" }> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return { data: [], source: "memory" };
  }

  // Get all approved requests
  const { data: requests, error: requestsError } = await supabase
    .from("access_requests")
    .select("*")
    .eq("status", "approved");

  if (requestsError || !requests) {
    return { data: [], source: "supabase" };
  }

  // Filter for teachers in JS to avoid column-not-found errors if desired_role is missing
  const teacherRequests = requests.filter(req => req.desired_role === "teacher" || !req.desired_role);

  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  const authUsers = authError || !authData?.users ? [] : authData.users;

  const teachers: Teacher[] = teacherRequests.map((req) => {
    const user = authUsers.find((u) => u.email?.toLowerCase() === req.email.toLowerCase());
    
    let name = "EduTrack Teacher";
    let department = "General";
    let id = req.id;

    if (user) {
      id = user.id;
      const meta = user.user_metadata as Record<string, any>;
      
      if (meta?.full_name) {
        name = meta.full_name;
      } else if (meta?.name) {
        name = meta.name;
      } else {
        const localPart = req.email.split("@")[0] ?? "";
        name = localPart.replace(/[._-]+/g, " ").trim() || name;
      }

      if (meta?.department) {
        department = meta.department;
      }
    } else {
      const localPart = req.email.split("@")[0] ?? "";
      name = localPart.replace(/[._-]+/g, " ").trim() || name;
    }

    let extractedPassword = req.access_code;
    if (user?.user_metadata?.raw_password) {
      extractedPassword = user.user_metadata.raw_password;
    } else if (req.note && req.note.startsWith("PWD:")) {
      extractedPassword = req.note.substring(4);
    }

    // Capitalize name
    name = name
      .split(" ")
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(" ");

    return {
      id,
      name,
      email: req.email,
      department,
      password: extractedPassword,
      role: "teacher"
    };
  });

  return { data: teachers, source: "supabase" };
}

