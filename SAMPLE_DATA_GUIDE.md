# 📊 Sample Data Guide - EduTrack Admin Dashboard

## Where to See Graphs & Statistics

### 1. **Admin Dashboard** → `/admin`
- **Total Teachers**: Shows count of unique teachers with logs (Now: 6 BCA teachers + 6 other teachers)
- **Classes Conducted**: Total teaching logs recorded (Now: 38+ logs)
- **Total Hours Taught**: Sum of all teaching hours across faculty (Now: 100+ hours)
- **Three Live Charts**:
  - 📈 **Workload Distribution** - Hours per teacher
  - 🎯 **Methodology Spread** - Teaching method breakdown
  - 📅 **Activity Trend** - Sessions over 4-week period

### 2. **Analytics & Insights** → `/admin/insights`
- **Hours Tracked**: Calculated from all teaching logs
- **Teachers in Charts**: Faculty represented in analytics
- **Active Alerts**: System warnings
- **Three Detailed Charts** with same data visualizations
- **Alert System**: Operational notices

### 3. **Teacher Directory** → `/admin/teachers`
- **Faculty Listing**: All 12 teachers in clean table format
- **Individual Stats**: Sessions count, teaching hours, last active date
- **Login Passwords**: Visible for each teacher (for demo purposes)

### 4. **Teacher Profile** → `/admin/teachers/[id]`
- **KPI Cards**: Total sessions, hours, average duration, unique subjects
- **Teaching Log Table**: Full activity history per teacher
- **Courses Taught**: Subject distribution
- **Teaching Methods**: Methodology breakdown

### 5. **Edit Teacher** → `/admin/teachers/[id]/edit` (NEW)
- **Update Profile**: Edit name, email, password, department
- **Admin-Only Access**: Admins can modify teacher credentials
- **Live Updates**: Changes reflected immediately

---

## Sample Data Details

### **6 BCA Department Teachers**
Each teacher has 4-5 teaching logs with different:
- Dates (April 12-16, 2026)
- Time slots (various hours)
- Subjects and topics
- Methodologies (Interactive Lecture, Lab Session, Problem Solving, Case Discussion)

#### Teaching Logs Created:
- **Prof. Hemanth Kumar**: 5 logs (Data Structures, Algorithms)
- **Dr. Shubha Sharma**: 5 logs (Database, Web Development)
- **Prof. Anusha Reddy**: 5 logs (Programming, Computer Fundamentals)
- **Dr. Uday Singh**: 5 logs (Web Development, JavaScript)
- **Prof. Madhu Prabha**: 5 logs (Object-Oriented Programming)
- **Dr. Sujata Desai**: 5 logs (Introduction to IT, Computer Networks)

**Total: 30 logs from BCA department**

### **6 Other Teachers** (with existing logs)
- Dr. Meera Nair (Computer Science)
- Prof. Arjun Patel (Electronics)
- Dr. Neha Verma (Computer Science)
- Prof. Raghav Menon (Mathematics)
- Dr. Sana Qureshi (Information Technology)
- Prof. Vikram Desai (Electronics)

**Total: 8+ logs from other departments**

**GRAND TOTAL: 38+ Teaching Logs**

---

## How to Test Each Feature

### ✅ Dashboard Metrics
1. Navigate to `/admin`
2. View the three metric cards at the top (Teachers, Classes, Hours)
3. See charts populated with real data

### ✅ Analytics Page
1. Go to `/admin/insights`
2. View "Hours Tracked", "Teachers in Charts" stats
3. See three charts with methodology, workload, and trend data

### ✅ Teacher Directory
1. Visit `/admin/teachers`
2. View table with all 12 teachers
3. **Copy password** from code field for any teacher
4. See sessions and hours for each

### ✅ Teacher Profile
1. Click "View Profile" button on any teacher row
2. See KPI cards with stats (non-zero for BCA teachers)
3. View teaching logs table with 4-5 entries
4. Check courses taught and teaching methods

### ✅ Edit Teacher Profile (NEW)
1. On teacher profile, click "Edit Profile" button
2. Update name, email, password, or department
3. Click "Save Changes"
4. Changes are saved and you're redirected

---

## Expected Graph Data

### Workload Chart
Shows teaching hours per teacher. BCA teachers will have highest bars.

### Methodology Distribution
- Interactive Lecture: ~35%
- Lab Session: ~25%
- Problem Solving: ~20%
- Case Discussion: ~15%
- Presentation: ~5%

### Activity Trend
Four weeks showing increasing activity as more logs are added. Each week shows cumulative classes.

---

## Login Credentials (Sample Teachers)

| Name | Email | Password |
|------|-------|----------|
| Prof. Hemanth Kumar | hemanth@sjr.edu | Hemanth123 |
| Dr. Shubha Sharma | shubha@sjr.edu | Shubha123 |
| Prof. Anusha Reddy | anusha@sjr.edu | Anusha123 |
| Dr. Uday Singh | uday@sjr.edu | Uday123 |
| Prof. Madhu Prabha | madhu@sjr.edu | Madhu123 |
| Dr. Sujata Desai | sujata@sjr.edu | Sujata123 |

---

## Notes for Admins

- All data is currently from mock-data.ts (sample/demo data)
- In production, data would come from Supabase database
- Graphs auto-calculate from teaching_logs array
- Teacher editing updates mock data (use for testing)
- No actual database persistence in demo mode
