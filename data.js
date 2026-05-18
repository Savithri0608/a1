// =====================
// Constants
// =====================
const COURSES  = ['Computer Science','Electrical Eng.','Mechanical Eng.','Civil Eng.','MBA','Data Science'];
const SECTIONS = ['A','B','C'];
const SUBJECTS = ['Mathematics','Physics','Programming','Databases','Networks'];
const AVATAR_COLORS = ['av-blue','av-teal','av-purple','av-coral','av-green'];

// =====================
// User Accounts
// Role: 'faculty' → full access
// Role: 'student' → view-only their own record
// =====================
const defaultUsers = [
  // --- Faculty ---
  {
    uid: 'FAC-001',
    role: 'faculty',
    name: 'Dr. Ramesh Kumar',
    username: 'ramesh',
    password: 'faculty123',
    department: 'Computer Science',
    email: 'ramesh@edutrack.edu'
  },
  {
    uid: 'FAC-002',
    role: 'faculty',
    name: 'Prof. Sunita Nair',
    username: 'sunita',
    password: 'faculty456',
    department: 'Data Science',
    email: 'sunita@edutrack.edu'
  },
  // --- Students (username = roll number, password = first name lowercase) ---
  {
    uid: 'STU-CS001',
    role: 'student',
    name: 'Priya Sharma',
    username: 'CS001',
    password: 'priya',
    studentId: 1
  },
  {
    uid: 'STU-CS002',
    role: 'student',
    name: 'Rahul Verma',
    username: 'CS002',
    password: 'rahul',
    studentId: 2
  },
  {
    uid: 'STU-CS003',
    role: 'student',
    name: 'Ananya Singh',
    username: 'CS003',
    password: 'ananya',
    studentId: 3
  },
  {
    uid: 'STU-EE001',
    role: 'student',
    name: 'Karan Mehta',
    username: 'EE001',
    password: 'karan',
    studentId: 4
  },
  {
    uid: 'STU-MB001',
    role: 'student',
    name: 'Neha Joshi',
    username: 'MB001',
    password: 'neha',
    studentId: 5
  },
  {
    uid: 'STU-ME001',
    role: 'student',
    name: 'Vikram Nair',
    username: 'ME001',
    password: 'vikram',
    studentId: 6
  },
  {
    uid: 'STU-DS001',
    role: 'student',
    name: 'Divya Patel',
    username: 'DS001',
    password: 'divya',
    studentId: 7
  },
  {
    uid: 'STU-CE001',
    role: 'student',
    name: 'Arjun Kumar',
    username: 'CE001',
    password: 'arjun',
    studentId: 8
  }
];

// =====================
// Sample Students
// =====================
const sampleStudents = [
  { id:1, name:'Priya Sharma',  roll:'CS001', course:'Computer Science', section:'A', email:'priya@student.edu',  phone:'9876543210', status:'active' },
  { id:2, name:'Rahul Verma',   roll:'CS002', course:'Computer Science', section:'A', email:'rahul@student.edu',  phone:'9876543211', status:'active' },
  { id:3, name:'Ananya Singh',  roll:'CS003', course:'Data Science',     section:'B', email:'ananya@student.edu', phone:'9876543212', status:'active' },
  { id:4, name:'Karan Mehta',   roll:'EE001', course:'Electrical Eng.',  section:'A', email:'karan@student.edu',  phone:'9876543213', status:'active' },
  { id:5, name:'Neha Joshi',    roll:'MB001', course:'MBA',              section:'C', email:'neha@student.edu',   phone:'9876543214', status:'inactive' },
  { id:6, name:'Vikram Nair',   roll:'ME001', course:'Mechanical Eng.',  section:'B', email:'vikram@student.edu', phone:'9876543215', status:'active' },
  { id:7, name:'Divya Patel',   roll:'DS001', course:'Data Science',     section:'A', email:'divya@student.edu',  phone:'9876543216', status:'active' },
  { id:8, name:'Arjun Kumar',   roll:'CE001', course:'Civil Eng.',       section:'B', email:'arjun@student.edu',  phone:'9876543217', status:'active' },
];

// =====================
// Helpers
// =====================
function avColor(name) {
  return AVATAR_COLORS[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_COLORS.length];
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getGrade(marks) {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B';
  if (marks >= 60) return 'C';
  if (marks >= 50) return 'D';
  return 'F';
}

function gradeClass(g) {
  if (g.startsWith('A')) return 'grade-a';
  if (g === 'B') return 'grade-b';
  if (g === 'C') return 'grade-c';
  if (g === 'D') return 'grade-d';
  return 'grade-f';
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function makeMarks(studentId) {
  return SUBJECTS.map(subject => ({
    studentId,
    subject,
    marks: Math.floor(45 + Math.random() * 50),
    maxMarks: 100
  }));
}

function getStudentAvg(studentId) {
  const ms = state.marks.filter(m => m.studentId === studentId);
  return ms.length ? ms.reduce((a, m) => a + m.marks, 0) / ms.length : 0;
}

function isFaculty() {
  return state.currentUser && state.currentUser.role === 'faculty';
}

// =====================
// Persistence
// =====================
const STORAGE_KEY = 'edutrack-v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      students:    state.students,
      marks:       state.marks,
      attendance:  state.attendance,
      nextId:      nextId,
      users:       USERS,
    }));
  } catch {}
}

// =====================
// App State
// =====================
const _saved = loadState();
let nextId = _saved?.nextId ?? (sampleStudents.length + 1);
let USERS  = _saved?.users  ?? defaultUsers;

const state = {
  // Auth — never restored from storage; user must log in each visit
  currentUser:  null,
  loginRole:    'faculty',
  loginMode:    'signin',
  loginError:   '',

  // App
  page:         'dashboard',
  students:     _saved?.students   ?? sampleStudents,
  marks:        _saved?.marks      ?? sampleStudents.flatMap(s => makeMarks(s.id)),
  attendance:   _saved?.attendance ?? sampleStudents.map(s => ({ studentId: s.id, date: todayStr(), status: 'present' })),
  modal:        null,
  search:       '',
  filterCourse: '',
  profileId:    null,
  attDate:      todayStr(),
  marksSub:     SUBJECTS[0],
  sidebarOpen:  false,
};