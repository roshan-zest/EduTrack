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
    id: "t3",
    name: "Dr. Neha Verma",
    email: "neha.verma@edutrack.edu",
    department: "Computer Science",
    role: "teacher"
  },
  {
    id: "t4",
    name: "Prof. Raghav Menon",
    email: "raghav.menon@edutrack.edu",
    department: "Mathematics",
    role: "teacher"
  },
  {
    id: "t5",
    name: "Dr. Sana Qureshi",
    email: "sana.qureshi@edutrack.edu",
    department: "Information Technology",
    role: "teacher"
  },
  {
    id: "t6",
    name: "Prof. Vikram Desai",
    email: "vikram.desai@edutrack.edu",
    department: "Electronics",
    role: "teacher"
  },
  {
    id: "b1",
    name: "Prof. Hemanth Kumar",
    email: "hemanth@sjr.edu",
    password: "Hemanth123",
    department: "BCA",
    role: "teacher"
  },
  {
    id: "b2",
    name: "Dr. Shubha Sharma",
    email: "shubha@sjr.edu",
    password: "Shubha123",
    department: "BCA",
    role: "teacher"
  },
  {
    id: "b3",
    name: "Prof. Anusha Reddy",
    email: "anusha@sjr.edu",
    password: "Anusha123",
    department: "BCA",
    role: "teacher"
  },
  {
    id: "b4",
    name: "Dr. Uday Singh",
    email: "uday@sjr.edu",
    password: "Uday123",
    department: "BCA",
    role: "teacher"
  },
  {
    id: "b5",
    name: "Prof. Madhu Prabha",
    email: "madhu@sjr.edu",
    password: "Madhu123",
    department: "BCA",
    role: "teacher"
  },
  {
    id: "b6",
    name: "Dr. Sujata Desai",
    email: "sujata@sjr.edu",
    password: "Sujata123",
    department: "BCA",
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
          { id: "coa", name: "Computer Organization", code: "CSE203" },
          { id: "discrete", name: "Discrete Mathematics", code: "CSE204" },
          { id: "python-prog", name: "Python Programming", code: "CSE205" }
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
          { id: "cn", name: "Computer Networks", code: "CSE503" },
          { id: "ai", name: "Introduction to AI", code: "CSE504" },
          { id: "se", name: "Software Engineering", code: "CSE505" }
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
          { id: "networks", name: "Network Theory", code: "ECE202" },
          { id: "signals", name: "Signals and Systems", code: "ECE203" },
          { id: "devices", name: "Electronic Devices", code: "ECE204" }
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
          { id: "vlsi", name: "VLSI Design", code: "ECE502" },
          { id: "embedded", name: "Embedded Systems", code: "ECE503" },
          { id: "wireless", name: "Wireless Communication", code: "ECE504" }
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
          { id: "uiux", name: "UI Fundamentals", code: "BCA203" },
          { id: "stats", name: "Business Statistics", code: "BCA204" },
          { id: "cloud", name: "Cloud Fundamentals", code: "BCA205" }
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
  },
  {
    id: "l5",
    teacherId: "t3",
    teacherName: "Dr. Neha Verma",
    program: "B.Tech CSE",
    semester: "Semester 5",
    subject: "Operating Systems",
    section: "B.Tech CSE - B",
    startTime: "09:30",
    endTime: "11:00",
    methodology: "Interactive Lecture",
    topic: "Thread Scheduling and Synchronization",
    notes: "Included live deadlock simulation.",
    date: "2026-04-16"
  },
  {
    id: "l6",
    teacherId: "t4",
    teacherName: "Prof. Raghav Menon",
    program: "B.Tech CSE",
    semester: "Semester 3",
    subject: "Discrete Mathematics",
    section: "B.Tech CSE - B",
    startTime: "12:00",
    endTime: "13:00",
    methodology: "Problem Solving",
    topic: "Recurrence Relations",
    notes: "Students solved 5 graded examples.",
    date: "2026-04-16"
  },
  {
    id: "l7",
    teacherId: "t5",
    teacherName: "Dr. Sana Qureshi",
    program: "BCA",
    semester: "Semester 2",
    subject: "Cloud Fundamentals",
    section: "BCA - II",
    startTime: "10:00",
    endTime: "11:30",
    methodology: "Case Discussion",
    topic: "Cloud Service Models",
    notes: "Compared IaaS, PaaS, and SaaS use cases.",
    date: "2026-04-16"
  },
  {
    id: "l8",
    teacherId: "t6",
    teacherName: "Prof. Vikram Desai",
    program: "B.Tech ECE",
    semester: "Semester 5",
    subject: "Embedded Systems",
    section: "B.Tech ECE - B",
    startTime: "14:00",
    endTime: "15:00",
    methodology: "Lab Session",
    topic: "Interrupt Handling on ARM Cortex",
    notes: "Hands-on with timer and GPIO modules.",
    date: "2026-04-15"
  },
  {
    id: "l9",
    teacherId: "t2",
    teacherName: "Prof. Arjun Patel",
    program: "B.Tech ECE",
    semester: "Semester 3",
    subject: "Signals and Systems",
    section: "B.Tech ECE - A",
    startTime: "08:30",
    endTime: "09:30",
    methodology: "Interactive Lecture",
    topic: "Laplace Transform Properties",
    notes: "Mini quiz assigned for next class.",
    date: "2026-04-16"
  },
  {
    id: "l10",
    teacherId: "t3",
    teacherName: "Dr. Neha Verma",
    program: "B.Tech CSE",
    semester: "Semester 5",
    subject: "Software Engineering",
    section: "B.Tech CSE - A",
    startTime: "15:15",
    endTime: "16:15",
    methodology: "Presentation",
    topic: "Agile Ceremonies and Sprint Planning",
    notes: "Teams prepared sprint backlogs.",
    date: "2026-04-14"
  },
  {
    id: "l11",
    teacherId: "b1",
    teacherName: "Prof. Hemanth Kumar",
    program: "BCA",
    semester: "Semester 3",
    subject: "Data Structures",
    section: "BCA - III",
    startTime: "09:00",
    endTime: "10:30",
    methodology: "Interactive Lecture",
    topic: "Binary Trees and Traversals",
    notes: "Live coding demonstration with recursive algorithms.",
    date: "2026-04-16"
  },
  {
    id: "l11a",
    teacherId: "b1",
    teacherName: "Prof. Hemanth Kumar",
    program: "BCA",
    semester: "Semester 3",
    subject: "Data Structures",
    section: "BCA - III",
    startTime: "14:00",
    endTime: "15:30",
    methodology: "Lab Session",
    topic: "Graph Algorithms - DFS and BFS",
    notes: "Hands-on implementation of graph algorithms.",
    date: "2026-04-15"
  },
  {
    id: "l11b",
    teacherId: "b1",
    teacherName: "Prof. Hemanth Kumar",
    program: "BCA",
    semester: "Semester 3",
    subject: "Data Structures",
    section: "BCA - III",
    startTime: "10:45",
    endTime: "12:00",
    methodology: "Problem Solving",
    topic: "Sorting Algorithms Complexity Analysis",
    notes: "Compared QuickSort vs MergeSort performance.",
    date: "2026-04-14"
  },
  {
    id: "l11c",
    teacherId: "b1",
    teacherName: "Prof. Hemanth Kumar",
    program: "BCA",
    semester: "Semester 3",
    subject: "Algorithms",
    section: "BCA - III",
    startTime: "13:00",
    endTime: "14:15",
    methodology: "Interactive Lecture",
    topic: "Dynamic Programming Fundamentals",
    notes: "Covered Fibonacci and Knapsack problems.",
    date: "2026-04-13"
  },
  {
    id: "l11d",
    teacherId: "b1",
    teacherName: "Prof. Hemanth Kumar",
    program: "BCA",
    semester: "Semester 3",
    subject: "Data Structures",
    section: "BCA - III",
    startTime: "15:00",
    endTime: "16:30",
    methodology: "Case Discussion",
    topic: "Real-world Applications of Data Structures",
    notes: "Case studies from industry applications.",
    date: "2026-04-12"
  },
  {
    id: "l12",
    teacherId: "b2",
    teacherName: "Dr. Shubha Sharma",
    program: "BCA",
    semester: "Semester 2",
    subject: "Database Management Systems",
    section: "BCA - II",
    startTime: "10:45",
    endTime: "12:00",
    methodology: "Lab Session",
    topic: "SQL Joins and Normalization",
    notes: "Hands-on practice with complex queries.",
    date: "2026-04-15"
  },
  {
    id: "l12a",
    teacherId: "b2",
    teacherName: "Dr. Shubha Sharma",
    program: "BCA",
    semester: "Semester 2",
    subject: "Database Management Systems",
    section: "BCA - II",
    startTime: "09:00",
    endTime: "10:15",
    methodology: "Interactive Lecture",
    topic: "Database Design and ER Models",
    notes: "Entity-relationship modeling for real-world scenarios.",
    date: "2026-04-16"
  },
  {
    id: "l12b",
    teacherId: "b2",
    teacherName: "Dr. Shubha Sharma",
    program: "BCA",
    semester: "Semester 2",
    subject: "Database Management Systems",
    section: "BCA - II",
    startTime: "14:00",
    endTime: "15:30",
    methodology: "Problem Solving",
    topic: "Indexing and Query Optimization",
    notes: "Performance tuning strategies for large databases.",
    date: "2026-04-14"
  },
  {
    id: "l12c",
    teacherId: "b2",
    teacherName: "Dr. Shubha Sharma",
    program: "BCA",
    semester: "Semester 2",
    subject: "Web Development",
    section: "BCA - II",
    startTime: "13:30",
    endTime: "14:45",
    methodology: "Case Discussion",
    topic: "Backend Database Integration",
    notes: "Connecting applications to databases.",
    date: "2026-04-13"
  },
  {
    id: "l12d",
    teacherId: "b2",
    teacherName: "Dr. Shubha Sharma",
    program: "BCA",
    semester: "Semester 2",
    subject: "Database Management Systems",
    section: "BCA - II",
    startTime: "11:00",
    endTime: "12:30",
    methodology: "Interactive Lecture",
    topic: "Transaction Management and ACID Properties",
    notes: "Concurrency control in DBMS.",
    date: "2026-04-12"
  },
  {
    id: "l13",
    teacherId: "b3",
    teacherName: "Prof. Anusha Reddy",
    program: "BCA",
    semester: "Semester 1",
    subject: "Programming Fundamentals",
    section: "BCA - I",
    startTime: "14:00",
    endTime: "15:30",
    methodology: "Problem Solving",
    topic: "Control Flow and Functions",
    notes: "Students solved 10 practice problems.",
    date: "2026-04-16"
  },
  {
    id: "l13a",
    teacherId: "b3",
    teacherName: "Prof. Anusha Reddy",
    program: "BCA",
    semester: "Semester 1",
    subject: "Programming Fundamentals",
    section: "BCA - I",
    startTime: "09:30",
    endTime: "11:00",
    methodology: "Interactive Lecture",
    topic: "Variables, Data Types, and Operators",
    notes: "Introduction to programming concepts.",
    date: "2026-04-15"
  },
  {
    id: "l13b",
    teacherId: "b3",
    teacherName: "Prof. Anusha Reddy",
    program: "BCA",
    semester: "Semester 1",
    subject: "Programming Fundamentals",
    section: "BCA - I",
    startTime: "13:00",
    endTime: "14:30",
    methodology: "Lab Session",
    topic: "Writing and Testing First Program",
    notes: "Setting up development environment.",
    date: "2026-04-14"
  },
  {
    id: "l13c",
    teacherId: "b3",
    teacherName: "Prof. Anusha Reddy",
    program: "BCA",
    semester: "Semester 1",
    subject: "Computer Fundamentals",
    section: "BCA - I",
    startTime: "10:00",
    endTime: "11:30",
    methodology: "Presentation",
    topic: "Number Systems and Conversions",
    notes: "Binary, Octal, Hexadecimal conversions.",
    date: "2026-04-13"
  },
  {
    id: "l13d",
    teacherId: "b3",
    teacherName: "Prof. Anusha Reddy",
    program: "BCA",
    semester: "Semester 1",
    subject: "Programming Fundamentals",
    section: "BCA - I",
    startTime: "15:00",
    endTime: "16:15",
    methodology: "Problem Solving",
    topic: "Loops and Nested Loops",
    notes: "Pattern printing exercises.",
    date: "2026-04-12"
  },
  {
    id: "l14",
    teacherId: "b4",
    teacherName: "Dr. Uday Singh",
    program: "BCA",
    semester: "Semester 3",
    subject: "Web Development",
    section: "BCA - III",
    startTime: "11:00",
    endTime: "12:30",
    methodology: "Case Discussion",
    topic: "Responsive Design and Bootstrap",
    notes: "Discussed CSS Grid vs Flexbox approaches.",
    date: "2026-04-14"
  },
  {
    id: "l14a",
    teacherId: "b4",
    teacherName: "Dr. Uday Singh",
    program: "BCA",
    semester: "Semester 3",
    subject: "Web Development",
    section: "BCA - III",
    startTime: "09:00",
    endTime: "10:30",
    methodology: "Interactive Lecture",
    topic: "HTML5 Semantic Elements and Forms",
    notes: "Modern HTML markup practices.",
    date: "2026-04-16"
  },
  {
    id: "l14b",
    teacherId: "b4",
    teacherName: "Dr. Uday Singh",
    program: "BCA",
    semester: "Semester 3",
    subject: "Web Development",
    section: "BCA - III",
    startTime: "14:00",
    endTime: "15:30",
    methodology: "Lab Session",
    topic: "CSS Advanced Layouts",
    notes: "Flexbox and CSS Grid deep dive.",
    date: "2026-04-15"
  },
  {
    id: "l14c",
    teacherId: "b4",
    teacherName: "Dr. Uday Singh",
    program: "BCA",
    semester: "Semester 3",
    subject: "JavaScript Basics",
    section: "BCA - III",
    startTime: "10:30",
    endTime: "12:00",
    methodology: "Problem Solving",
    topic: "DOM Manipulation and Events",
    notes: "Building interactive web pages.",
    date: "2026-04-13"
  },
  {
    id: "l14d",
    teacherId: "b4",
    teacherName: "Dr. Uday Singh",
    program: "BCA",
    semester: "Semester 3",
    subject: "Web Development",
    section: "BCA - III",
    startTime: "13:00",
    endTime: "14:15",
    methodology: "Interactive Lecture",
    topic: "Responsive Web Design Principles",
    notes: "Mobile-first development approach.",
    date: "2026-04-12"
  },
  {
    id: "l15",
    teacherId: "b5",
    teacherName: "Prof. Madhu Prabha",
    program: "BCA",
    semester: "Semester 2",
    subject: "Object-Oriented Programming",
    section: "BCA - II",
    startTime: "13:00",
    endTime: "14:30",
    methodology: "Interactive Lecture",
    topic: "Inheritance and Polymorphism",
    notes: "Real-world design pattern examples.",
    date: "2026-04-16"
  },
  {
    id: "l15a",
    teacherId: "b5",
    teacherName: "Prof. Madhu Prabha",
    program: "BCA",
    semester: "Semester 2",
    subject: "Object-Oriented Programming",
    section: "BCA - II",
    startTime: "09:30",
    endTime: "11:00",
    methodology: "Lab Session",
    topic: "Creating Classes and Objects",
    notes: "Hands-on OOP implementation.",
    date: "2026-04-15"
  },
  {
    id: "l15b",
    teacherId: "b5",
    teacherName: "Prof. Madhu Prabha",
    program: "BCA",
    semester: "Semester 2",
    subject: "Object-Oriented Programming",
    section: "BCA - II",
    startTime: "14:00",
    endTime: "15:30",
    methodology: "Problem Solving",
    topic: "Encapsulation and Abstraction",
    notes: "Data hiding and access modifiers.",
    date: "2026-04-14"
  },
  {
    id: "l15c",
    teacherId: "b5",
    teacherName: "Prof. Madhu Prabha",
    program: "BCA",
    semester: "Semester 2",
    subject: "Object-Oriented Programming",
    section: "BCA - II",
    startTime: "10:45",
    endTime: "12:00",
    methodology: "Interactive Lecture",
    topic: "Method Overloading and Overriding",
    notes: "Advanced OOP concepts.",
    date: "2026-04-13"
  },
  {
    id: "l15d",
    teacherId: "b5",
    teacherName: "Prof. Madhu Prabha",
    program: "BCA",
    semester: "Semester 2",
    subject: "Object-Oriented Programming",
    section: "BCA - II",
    startTime: "15:00",
    endTime: "16:30",
    methodology: "Case Discussion",
    topic: "Design Patterns and SOLID Principles",
    notes: "Best practices in software design.",
    date: "2026-04-12"
  },
  {
    id: "l16",
    teacherId: "b6",
    teacherName: "Dr. Sujata Desai",
    program: "BCA",
    semester: "Semester 1",
    subject: "Introduction to IT",
    section: "BCA - I",
    startTime: "15:45",
    endTime: "17:00",
    methodology: "Presentation",
    topic: "Computer Fundamentals and Networking Basics",
    notes: "Overview of hardware, software, and OSI model.",
    date: "2026-04-15"
  },
  {
    id: "l16a",
    teacherId: "b6",
    teacherName: "Dr. Sujata Desai",
    program: "BCA",
    semester: "Semester 1",
    subject: "Introduction to IT",
    section: "BCA - I",
    startTime: "09:00",
    endTime: "10:30",
    methodology: "Interactive Lecture",
    topic: "Operating Systems Overview",
    notes: "Linux and Windows fundamentals.",
    date: "2026-04-16"
  },
  {
    id: "l16b",
    teacherId: "b6",
    teacherName: "Dr. Sujata Desai",
    program: "BCA",
    semester: "Semester 1",
    subject: "Introduction to IT",
    section: "BCA - I",
    startTime: "14:00",
    endTime: "15:30",
    methodology: "Lab Session",
    topic: "System Administration Basics",
    notes: "User management and file systems.",
    date: "2026-04-14"
  },
  {
    id: "l16c",
    teacherId: "b6",
    teacherName: "Dr. Sujata Desai",
    program: "BCA",
    semester: "Semester 1",
    subject: "Computer Networks",
    section: "BCA - I",
    startTime: "10:30",
    endTime: "12:00",
    methodology: "Problem Solving",
    topic: "TCP/IP Protocol Stack",
    notes: "Network layer concepts.",
    date: "2026-04-13"
  },
  {
    id: "l16d",
    teacherId: "b6",
    teacherName: "Dr. Sujata Desai",
    program: "BCA",
    semester: "Semester 1",
    subject: "Introduction to IT",
    section: "BCA - I",
    startTime: "13:00",
    endTime: "14:15",
    methodology: "Interactive Lecture",
    topic: "Cloud Computing Introduction",
    notes: "AWS, Azure, GCP overview.",
    date: "2026-04-12"
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
  },
  {
    teacherId: "t3",
    consistencyScore: 88,
    timeScore: 91,
    diversityScore: 79,
    workloadScore: 86,
    totalClasses: 27,
    totalHours: 35
  },
  {
    teacherId: "t4",
    consistencyScore: 83,
    timeScore: 80,
    diversityScore: 74,
    workloadScore: 77,
    totalClasses: 21,
    totalHours: 29
  },
  {
    teacherId: "t5",
    consistencyScore: 90,
    timeScore: 88,
    diversityScore: 81,
    workloadScore: 84,
    totalClasses: 25,
    totalHours: 33
  },
  {
    teacherId: "t6",
    consistencyScore: 76,
    timeScore: 82,
    diversityScore: 70,
    workloadScore: 75,
    totalClasses: 19,
    totalHours: 26
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
  },
  {
    id: "al3",
    teacherId: "t6",
    teacherName: "Prof. Vikram Desai",
    severity: "medium",
    message: "Detected 3 consecutive sessions with minimal topic notes. Consider richer log descriptions."
  }
];

export const methodologyDistribution = [
  { name: "Interactive Lecture", value: 28 },
  { name: "Lab Session", value: 22 },
  { name: "Problem Solving", value: 18 },
  { name: "Case Discussion", value: 14 },
  { name: "Presentation", value: 10 },
  { name: "Tutorial", value: 8 }
];

export const activityTrend = [
  { label: "Week 1", classes: 18, hours: 24 },
  { label: "Week 2", classes: 23, hours: 31 },
  { label: "Week 3", classes: 27, hours: 36 },
  { label: "Week 4", classes: 25, hours: 34 }
];
