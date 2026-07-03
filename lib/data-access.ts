import { randomUUID } from "crypto";
import { z } from "zod";
import { getDevCatalog, getDevLogs, setDevCatalog, addDevLog } from "@/lib/dev-store";
import { curriculumCatalog } from "@/lib/mock-data";
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
    if (error) {
      console.error("[data-access] curriculum catalog fetch failed:", error.message);
    }
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
    console.error("[data-access] curriculum catalog save failed:", error.message);
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
    .order("created_at", { ascending: false })
    // ponytail: cap at the 1000 most recent logs so dashboards stay fast as the table
    // grows; switch to per-page date filters if older history needs to be charted
    .limit(1000);

  if (error || !data) {
    if (error) {
      console.error("[data-access] teaching logs fetch failed:", error.message);
    }
    return { data: getDevLogs(), source: "memory" };
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
    // Surface the failure instead of silently dropping logs into serverless memory
    console.error("[data-access] teaching log insert failed:", error.message);
    throw new Error(`Unable to save teaching logs: ${error.message}`);
  }

  return { data: nextLogs, source: "supabase" };
}

export async function getTeachersData(): Promise<{ data: Teacher[]; source: "supabase" | "memory" }> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return { data: [], source: "memory" };
  }

  // Get all approved requests and auth users in one parallel round trip
  const [requestsResult, usersResult] = await Promise.all([
    supabase.from("access_requests").select("*").eq("status", "approved"),
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  ]);

  const { data: requests, error: requestsError } = requestsResult;

  if (requestsError || !requests) {
    if (requestsError) {
      console.error("[data-access] access requests fetch failed:", requestsError.message);
    }
    return { data: [], source: "supabase" };
  }

  // Filter for teachers in JS to avoid column-not-found errors if desired_role is missing
  const teacherRequests = requests.filter(req => req.desired_role === "teacher" || !req.desired_role);

  const authUsers = usersResult.error || !usersResult.data?.users ? [] : usersResult.data.users;

  const teachers: Teacher[] = teacherRequests.map((req) => {
    const user = authUsers.find((u) => u.email?.toLowerCase() === req.email.toLowerCase());
    
    let name = "EduTrack Teacher";
    let department = "General";
    let id = req.id;

    let isSuspended = false;

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
      
      if (user.banned_until) {
        isSuspended = new Date(user.banned_until).getTime() > Date.now();
      }
    } else {
      const localPart = req.email.split("@")[0] ?? "";
      name = localPart.replace(/[._-]+/g, " ").trim() || name;
    }

    // Only expose the admin-issued credential (access code / admin-set login),
    // never a password the user chose themselves
    let extractedPassword = req.access_code;
    if (typeof user?.user_metadata?.login_password === "string" && user.user_metadata.login_password) {
      extractedPassword = user.user_metadata.login_password;
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
      role: "teacher",
      isSuspended
    };
  });

  return { data: teachers, source: "supabase" };
}

