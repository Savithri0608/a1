// =====================
// Navigation
// =====================
function nav(page) {
  state.page         = page;
  state.profileId    = null;
  state.sidebarOpen  = false;
  render();
}

function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
  render();
}

// =====================
// Filters & Search
// =====================
function setSearch(value)      { state.search = value;       render(); }
function setFilter(value)      { state.filterCourse = value; render(); }
function setAttDate(value)     { state.attDate = value;      render(); }
function setMarksSub(value)    { state.marksSub = value;     render(); }

// =====================
// Modal Controls
// =====================
function openAdd()  { if (!isFaculty()) return; state.modal = { data: {} }; render(); }
function openEdit(id) { if (!isFaculty()) return; state.modal = { id };     render(); }

function closeModal(e) {
  if (!e || e.target.classList.contains('modal-bg')) {
    state.modal = null;
    render();
  }
}

// =====================
// Profile
// =====================
function openProfile(id) { state.profileId = id; render(); }
function closeProfile()  { state.profileId = null; render(); }

// =====================
// Student CRUD (faculty only)
// =====================
function saveStudent(id) {
  if (!isFaculty()) return;

  const get = sel => document.querySelector(sel).value.trim();
  const data = {
    name:    get('#f-name'),
    roll:    get('#f-roll'),
    course:  get('#f-course'),
    section: get('#f-section'),
    email:   get('#f-email'),
    phone:   get('#f-phone'),
    status:  get('#f-status'),
  };

  if (!data.name || !data.roll) {
    alert('Name and Roll Number are required.');
    return;
  }

  if (id) {
    state.students = state.students.map(s => s.id === id ? { ...s, ...data } : s);
  } else {
    const ns = { id: nextId++, ...data };
    state.students   = [...state.students, ns];
    state.marks      = [...state.marks, ...makeMarks(ns.id)];
    state.attendance = [...state.attendance, { studentId: ns.id, date: state.attDate, status: 'present' }];
  }

  state.modal = null;
  render();
}

function deleteStudent(id) {
  if (!isFaculty()) return;
  if (!confirm('Remove this student? This cannot be undone.')) return;

  state.students   = state.students.filter(s => s.id !== id);
  state.marks      = state.marks.filter(m => m.studentId !== id);
  state.attendance = state.attendance.filter(a => a.studentId !== id);
  render();
}

// =====================
// Attendance (faculty only)
// =====================
function setAtt(studentId, status) {
  if (!isFaculty()) return;
  applyAtt(studentId, status);
  render();
}

function applyAtt(studentId, status) {
  const existing = state.attendance.find(
    a => a.studentId === studentId && a.date === state.attDate
  );
  if (existing) existing.status = status;
  else state.attendance.push({ studentId, date: state.attDate, status });
}

function markAllAtt(status) {
  if (!isFaculty()) return;
  state.students
    .filter(s => s.status === 'active')
    .forEach(s => applyAtt(s.id, status));
  render();
}

function copyPrevDayAtt() {
  if (!isFaculty()) return;

  const prevDate = [...new Set(state.attendance.map(a => a.date))]
    .filter(d => d < state.attDate)
    .sort()
    .pop();

  if (!prevDate) {
    alert('No earlier attendance record to copy from.');
    return;
  }

  state.students
    .filter(s => s.status === 'active')
    .forEach(s => {
      const src = state.attendance.find(a => a.studentId === s.id && a.date === prevDate);
      if (src) applyAtt(s.id, src.status);
    });

  render();
}

// =====================
// Marks (faculty only)
// =====================
function updateMarks(studentId, subject, value) {
  if (!isFaculty()) return;

  const m      = state.marks.find(m => m.studentId === studentId && m.subject === subject);
  const parsed = Math.min(Math.max(0, parseInt(value) || 0), m ? m.maxMarks : 100);

  if (m) m.marks = parsed;
  else state.marks.push({ studentId, subject, marks: parsed, maxMarks: 100 });
}