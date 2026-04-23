export type UserRole = "admin" | "teacher";

export type Teacher = {
  id: string;
  name: string;
  email: string;
  password?: string;
  department: string;
  role: UserRole;
  isSuspended?: boolean;
};

export type CurriculumSection = {
  id: string;
  name: string;
};

export type CurriculumSubject = {
  id: string;
  name: string;
  code: string;
};

export type CurriculumSemester = {
  id: string;
  name: string;
  sections: CurriculumSection[];
  subjects: CurriculumSubject[];
};

export type CurriculumProgram = {
  id: string;
  name: string;
  semesters: CurriculumSemester[];
};

export type CurriculumCatalog = CurriculumProgram[];

export type TeachingLog = {
  id: string;
  teacherId: string;
  teacherName: string;
  program: string;
  semester: string;
  subject: string;
  section: string;
  startTime: string;
  endTime: string;
  methodology: string;
  topic: string;
  notes?: string;
  date: string;
};

export type PerformanceInsight = {
  teacherId: string;
  consistencyScore: number;
  timeScore: number;
  diversityScore: number;
  workloadScore: number;
  totalClasses: number;
  totalHours: number;
};

export type AlertItem = {
  id: string;
  teacherId: string;
  teacherName: string;
  severity: "low" | "medium" | "high";
  message: string;
};
