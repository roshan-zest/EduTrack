import { AlertItem, CurriculumCatalog, PerformanceInsight, Teacher, TeachingLog } from "@/lib/types";

export const teachers: Teacher[] = [
  {
    id: "t1",
    name: "Dr. Meera Nair",
    email: "meera.nair@edutrack.edu",
    department: "Computer Science",
    role: "teacher"
  },
  {
    id: "t2",
    name: "Prof. Arjun Patel",
    email: "arjun.patel@edutrack.edu",
    department: "Electronics",
    role: "teacher"
  },
  {
    id: "a1",
    name: "Admin Kavya Singh",
    email: "admin@edutrack.edu",
    department: "Administration",
    role: "admin"
  }
];

export const curriculumCatalog: CurriculumCatalog = [
  {
    id: "prog-cse",
    name: "B.Tech CSE",
    semesters: [
      {
        id: "cse-sem-3",
        name: "Semester 3",
        sections: [
          { id: "cse-a", name: "Section A" },
          { id: "cse-b", name: "Section B" }
        ],
        subjects: [
          { id: "ds", name: "Data Structures", code: "CSE201" },
          { id: "dsa-lab", name: "Data Structures Lab", code: "CSE202" },
          { id: "coa", name: "Computer Organization", code: "CSE203" }
        ]
      },
      {
        id: "cse-sem-5",
        name: "Semester 5",
        sections: [
          { id: "cse5-a", name: "Section A" },
          { id: "cse5-b", name: "Section B" }
        ],
        subjects: [
          { id: "os", name: "Operating Systems", code: "CSE501" },
          { id: "wt", name: "Web Technologies", code: "CSE502" },
          { id: "cn", name: "Computer Networks", code: "CSE503" }
        ]
      }
    ]
  },
  {
    id: "prog-ece",
    name: "B.Tech ECE",
    semesters: [
      {
        id: "ece-sem-3",
        name: "Semester 3",
        sections: [
          { id: "ece-a", name: "Section A" },
          { id: "ece-b", name: "Section B" }
        ],
        subjects: [
          { id: "de", name: "Digital Electronics", code: "ECE201" },
          { id: "networks", name: "Network Theory", code: "ECE202" }
        ]
      },
      {
        id: "ece-sem-5",
        name: "Semester 5",
        sections: [
          { id: "ece5-b", name: "Section B" },
          { id: "ece5-c", name: "Section C" }
        ],
        subjects: [
          { id: "mp", name: "Microprocessors", code: "ECE501" },
          { id: "vlsi", name: "VLSI Design", code: "ECE502" }
        ]
      }
    ]
  },
  {
    id: "prog-bca",
    name: "BCA",
    semesters: [
      {
        id: "bca-sem-2",
        name: "Semester 2",
        sections: [
          { id: "bca-ii", name: "Section II" }
        ],
        subjects: [
          { id: "dbms", name: "Database Management Systems", code: "BCA201" },
          { id: "frontend", name: "Frontend Development", code: "BCA202" },
          { id: "uiux", name: "UI Fundamentals", code: "BCA203" }
        ]
      }
    ]
  }
];

export const teachingLogs: TeachingLog[] = [
  {
    id: "l1",
    teacherId: "t1",
    teacherName: "Dr. Meera Nair",
    program: "B.Tech CSE",
    semester: "Semester 3",
    subject: "Data Structures",
    section: "B.Tech CSE - A",
    startTime: "09:00",
    endTime: "10:00",
    methodology: "Interactive Lecture",
    topic: "AVL Tree Rotations",
    notes: "Students solved one whiteboard exercise.",
    date: "2026-04-15"
  },
  {
    id: "l2",
    teacherId: "t1",
    teacherName: "Dr. Meera Nair",
    program: "BCA",
    semester: "Semester 2",
    subject: "Web Technologies",
    section: "BCA - II",
    startTime: "11:00",
    endTime: "12:30",
    methodology: "Lab Session",
    topic: "Responsive Grid Layouts",
    notes: "Completed mini dashboard prototype.",
    date: "2026-04-15"
  },
  {
    id: "l3",
    teacherId: "t2",
    teacherName: "Prof. Arjun Patel",
    program: "B.Tech ECE",
    semester: "Semester 3",
    subject: "Digital Electronics",
    section: "B.Tech ECE - B",
    startTime: "10:00",
    endTime: "11:00",
    methodology: "Case Discussion",
    topic: "Timing Hazards in Combinational Logic",
    notes: "Follow-up quiz scheduled tomorrow.",
    date: "2026-04-15"
  },
  {
    id: "l4",
    teacherId: "t2",
    teacherName: "Prof. Arjun Patel",
    program: "B.Tech ECE",
    semester: "Semester 5",
    subject: "Microprocessors",
    section: "B.Tech ECE - C",
    startTime: "14:00",
    endTime: "15:30",
    methodology: "Problem Solving",
    topic: "8086 Addressing Modes",
    date: "2026-04-14"
  }
];

export const performanceInsights: PerformanceInsight[] = [
  {
    teacherId: "t1",
    consistencyScore: 94,
    timeScore: 89,
    diversityScore: 82,
    workloadScore: 91,
    totalClasses: 24,
    totalHours: 31
  },
  {
    teacherId: "t2",
    consistencyScore: 78,
    timeScore: 84,
    diversityScore: 68,
    workloadScore: 73,
    totalClasses: 18,
    totalHours: 25
  }
];

export const alerts: AlertItem[] = [
  {
    id: "al1",
    teacherId: "t2",
    teacherName: "Prof. Arjun Patel",
    severity: "medium",
    message: "Methodology mix has repeated 'Case Discussion' across 4 recent logs."
  },
  {
    id: "al2",
    teacherId: "t1",
    teacherName: "Dr. Meera Nair",
    severity: "low",
    message: "One log is missing an optional note for a lab session."
  }
];

export const methodologyDistribution = [
  { name: "Interactive Lecture", value: 34 },
  { name: "Lab Session", value: 24 },
  { name: "Problem Solving", value: 22 },
  { name: "Case Discussion", value: 20 }
];

export const activityTrend = [
  { label: "Week 1", classes: 16, hours: 21 },
  { label: "Week 2", classes: 19, hours: 27 },
  { label: "Week 3", classes: 22, hours: 30 },
  { label: "Week 4", classes: 20, hours: 28 }
];
