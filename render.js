// =====================
// Root Render
// =====================
function render() {
  document.getElementById('app').innerHTML = state.currentUser
    ? renderApp()
    : renderLogin();
  saveState();
}

// =====================
// LOGIN PAGE
// =====================
function renderLogin() {
  const isF       = state.loginRole === 'faculty';
  const isSignup  = state.loginMode === 'signup';

  return `
    <div class="login-page">
      <div class="login-box">
        <div class="login-logo">
          <i class="ti ti-school" aria-hidden="true"></i> EduTrack
        </div>
        <p class="login-subtitle">${isSignup ? 'Create a new account' : 'Sign in to your account'}</p>

        <!-- Sign in / Sign up toggle -->
        <div class="login-mode-tabs">
          <button class="mode-tab ${!isSignup ? 'active' : ''}" onclick="selectLoginMode('signin')">
            Sign In
          </button>
          <button class="mode-tab ${isSignup ? 'active' : ''}" onclick="selectLoginMode('signup')">
            Sign Up
          </button>
        </div>

        <!-- Role selector -->
        <div class="login-role-tabs">
          <div class="role-tab ${isF ? 'active' : ''}" onclick="selectLoginRole('faculty')">
            <i class="ti ti-chalkboard-teacher" aria-hidden="true"
               style="color:${isF ? '#1d4ed8' : '#9ca3af'}"></i>
            <div class="role-name">Faculty</div>
            <div class="role-desc">Full access</div>
          </div>
          <div class="role-tab ${!isF ? 'active' : ''}" onclick="selectLoginRole('student')">
            <i class="ti ti-user-graduate" aria-hidden="true"
               style="color:${!isF ? '#1d4ed8' : '#9ca3af'}"></i>
            <div class="role-name">Student</div>
            <div class="role-desc">View own record</div>
          </div>
        </div>

        <!-- Error -->
        <div class="login-error ${state.loginError ? 'show' : ''}">
          <i class="ti ti-alert-circle" aria-hidden="true"></i>
          ${state.loginError}
        </div>

        <!-- Form -->
        <div class="login-form">
          ${isSignup ? `
            <div class="login-field full">
              <label>Full Name</label>
              <input id="signup-name"
                     placeholder="${isF ? 'e.g. Dr. Anita Rao' : 'e.g. Priya Sharma'}"
                     onkeydown="loginKeydown(event)">
            </div>
          ` : ''}

          <div class="login-field ${isSignup ? '' : 'full'}">
            <label>${isF ? 'Username' : 'Roll Number'}</label>
            <input id="login-username"
                   placeholder="${isF ? 'e.g. ramesh' : 'e.g. CS001'}"
                   onkeydown="loginKeydown(event)"
                   autocomplete="username">
          </div>
          <div class="login-field ${isSignup ? '' : 'full'}">
            <label>Password</label>
            <div class="password-wrap">
              <input id="login-password"
                     type="password"
                     placeholder="Enter password"
                     onkeydown="loginKeydown(event)"
                     autocomplete="${isSignup ? 'new-password' : 'current-password'}">
              <button type="button"
                      class="password-toggle"
                      aria-label="Show password"
                      onclick="togglePasswordVisibility(this)">
                <i class="ti ti-eye" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          ${isSignup && !isF ? `
            <div class="login-field">
              <label>Course</label>
              <select id="signup-course">
                ${COURSES.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div class="login-field">
              <label>Section</label>
              <select id="signup-section">
                ${SECTIONS.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
          ` : ''}

          ${isSignup && isF ? `
            <div class="login-field full">
              <label>Department</label>
              <input id="signup-dept" placeholder="e.g. Computer Science" onkeydown="loginKeydown(event)">
            </div>
          ` : ''}

          <button class="login-btn full" onclick="${isSignup ? 'doSignup()' : 'doLogin()'}">
            <i class="ti ti-${isSignup ? 'user-plus' : 'login'}" aria-hidden="true"></i>
            ${isSignup ? `Create ${isF ? 'Faculty' : 'Student'} Account` : `Sign In as ${isF ? 'Faculty' : 'Student'}`}
          </button>
        </div>

        ${!isSignup ? `
          <div class="login-hint">
            <p>Demo credentials</p>
            <div class="hint-row">
              ${isF
                ? `<span class="hint-chip">ramesh / faculty123</span>
                   <span class="hint-chip">sunita / faculty456</span>`
                : `<span class="hint-chip">CS001 / priya</span>
                   <span class="hint-chip">EE001 / karan</span>
                   <span class="hint-chip">DS001 / divya</span>`
              }
            </div>
          </div>
        ` : `
          <div class="login-hint">
            <p>New here?</p>
            <div style="font-size:11px;color:#6b7280">
              Fill in the form to create your account. You'll be signed in automatically.
            </div>
          </div>
        `}

        <div class="reset-link" onclick="resetDemoData()">
          <i class="ti ti-refresh" aria-hidden="true"></i> Reset demo data
        </div>
      </div>
    </div>
  `;
}

// =====================
// APP SHELL
// =====================
function renderApp() {
  return `
    ${renderSidebar()}
    <div class="sidebar-backdrop ${state.sidebarOpen ? 'show' : ''}" onclick="toggleSidebar()"></div>
    <div class="main">
      ${renderTopbar()}
      <div class="content">${renderPage()}</div>
    </div>
    ${state.modal ? renderModal() : ''}
  `;
}

// =====================
// SIDEBAR
// =====================
function renderSidebar() {
  const u = state.currentUser;
  const faculty = isFaculty();

  // Students only see "My Profile"; faculty sees all pages
  const pages = faculty
    ? [
        { id: 'dashboard',  icon: 'layout-dashboard', label: 'Dashboard' },
        { id: 'students',   icon: 'users',             label: 'Students' },
        { id: 'attendance', icon: 'calendar-check',    label: 'Attendance' },
        { id: 'marks',      icon: 'trophy',            label: 'Marks' },
        { id: 'reports',    icon: 'file-text',         label: 'Reports' },
      ]
    : [
        { id: 'students', icon: 'user', label: 'My Profile' },
      ];

  const av     = avColor(u.name);
  const avCss  = {
    'av-blue':   { bg: '#dbeafe', color: '#1e3a8a' },
    'av-teal':   { bg: '#ccfbf1', color: '#134e4a' },
    'av-purple': { bg: '#ede9fe', color: '#3b0764' },
    'av-coral':  { bg: '#fee2e2', color: '#7f1d1d' },
    'av-green':  { bg: '#dcfce7', color: '#14532d' },
  }[av];

  return `
    <div class="sidebar ${state.sidebarOpen ? 'open' : ''}">
      <div class="sidebar-brand">
        <div class="logo">
          <i class="ti ti-school" aria-hidden="true"></i> EduTrack
        </div>
        <p>Student Management</p>
      </div>

      ${pages.map(p => `
        <div class="nav-item ${state.page === p.id ? 'active' : ''}" onclick="nav('${p.id}')">
          <i class="ti ti-${p.icon}" aria-hidden="true"></i>
          ${p.label}
        </div>
      `).join('')}

      <!-- User Identity Card -->
      <div class="user-card">
        <div class="user-card-top">
          <div class="user-avatar-lg" style="background:${avCss.bg};color:${avCss.color}">
            ${initials(u.name)}
          </div>
          <div>
            <div class="user-name">${u.name}</div>
            <div class="user-id">${u.uid}</div>
          </div>
        </div>
        <div class="role-badge ${u.role}">
          <i class="ti ti-${u.role === 'faculty' ? 'chalkboard-teacher' : 'user-graduate'}"
             aria-hidden="true"></i>
          ${u.role === 'faculty' ? 'Faculty' : 'Student'}
        </div>
        <button class="logout-btn" onclick="doLogout()">
          <i class="ti ti-logout" aria-hidden="true"></i> Sign Out
        </button>
      </div>
    </div>
  `;
}

// =====================
// TOPBAR
// =====================
function renderTopbar() {
  const titles = {
    dashboard:  'Dashboard',
    students:   isFaculty() ? 'Students' : 'My Profile',
    attendance: 'Attendance',
    marks:      'Marks & Grades',
    reports:    'Reports'
  };

  return `
    <div class="topbar">
      <button class="hamburger-btn" onclick="toggleSidebar()" aria-label="Toggle menu">
        <i class="ti ti-menu-2" aria-hidden="true"></i>
      </button>
      <h1>${titles[state.page] || ''}</h1>
      <div class="topbar-actions">
        ${state.page === 'students' && isFaculty() ? `
          <div class="search-wrap">
            <i class="ti ti-search" aria-hidden="true"></i>
            <input value="${state.search}" oninput="setSearch(this.value)" placeholder="Search students…">
          </div>
          <button class="btn primary" onclick="openAdd()">
            <i class="ti ti-plus" aria-hidden="true"></i> Add Student
          </button>
        ` : ''}
        ${state.page === 'attendance' && isFaculty() ? `
          <input type="date" class="date-input" value="${state.attDate}" onchange="setAttDate(this.value)">
        ` : ''}
      </div>
    </div>
  `;
}

// =====================
// PAGE ROUTER
// =====================
function renderPage() {
  if (state.page === 'dashboard')  return renderDashboard();
  if (state.page === 'students')   return state.profileId ? renderProfile() : renderStudents();
  if (state.page === 'attendance') return renderAttendance();
  if (state.page === 'marks')      return renderMarks();
  if (state.page === 'reports')    return renderReports();
  return '';
}

// =====================
// DASHBOARD (faculty only)
// =====================
function renderDashboard() {
  const active  = state.students.filter(s => s.status === 'active').length;
  const todayAt = state.attendance.filter(a => a.date === todayStr());
  const present = todayAt.filter(a => a.status === 'present').length;
  const avgAll  = state.marks.reduce((a, m) => a + m.marks, 0) / (state.marks.length || 1);

  return `
    <div class="cards-grid">
      <div class="metric-card">
        <div class="label"><i class="ti ti-users" aria-hidden="true"></i> Total Students</div>
        <div class="value blue">${state.students.length}</div>
      </div>
      <div class="metric-card">
        <div class="label"><i class="ti ti-user-check" aria-hidden="true"></i> Active</div>
        <div class="value green">${active}</div>
      </div>
      <div class="metric-card">
        <div class="label"><i class="ti ti-calendar-check" aria-hidden="true"></i> Present Today</div>
        <div class="value amber">${present}</div>
      </div>
      <div class="metric-card">
        <div class="label"><i class="ti ti-chart-bar" aria-hidden="true"></i> Avg. Score</div>
        <div class="value coral">${avgAll.toFixed(1)}%</div>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:40px"></th>
            <th>Name</th>
            <th>UID</th>
            <th>Course</th>
            <th>Status</th>
            <th>Avg. Score</th>
          </tr>
        </thead>
        <tbody>
          ${state.students.slice(0, 8).map(s => {
            const avg = getStudentAvg(s.id);
            const g   = getGrade(avg);
            const usr = USERS.find(u => u.studentId === s.id);
            return `
              <tr>
                <td><div class="avatar ${avColor(s.name)}">${initials(s.name)}</div></td>
                <td style="font-weight:500">${s.name}</td>
                <td><span class="uid-tag">${usr ? usr.uid : '—'}</span></td>
                <td>${s.course}</td>
                <td><span class="badge ${s.status}">${s.status}</span></td>
                <td><span class="badge ${gradeClass(g)}">${avg.toFixed(0)}% — ${g}</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// =====================
// STUDENTS LIST (faculty) / redirect for student
// =====================
function renderStudents() {
  // Students are always redirected to their profile at login,
  // but guard just in case.
  if (!isFaculty()) {
    state.profileId = state.currentUser.studentId;
    return renderProfile();
  }

  const list = state.students.filter(s =>
    (!state.search || s.name.toLowerCase().includes(state.search.toLowerCase()) ||
                      s.roll.toLowerCase().includes(state.search.toLowerCase())) &&
    (!state.filterCourse || s.course === state.filterCourse)
  );

  return `
    <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
      <select onchange="setFilter(this.value)" class="date-input">
        <option value="">All Courses</option>
        ${COURSES.map(c => `
          <option value="${c}" ${state.filterCourse === c ? 'selected' : ''}>${c}</option>
        `).join('')}
      </select>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:40px"></th>
            <th>Name</th>
            <th>UID</th>
            <th>Roll No.</th>
            <th>Course</th>
            <th>Section</th>
            <th>Status</th>
            <th style="width:100px">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${list.length === 0 ? `
            <tr><td colspan="8">
              <div class="empty">
                <i class="ti ti-users-off" aria-hidden="true"></i>No students found
              </div>
            </td></tr>
          ` : ''}
          ${list.map(s => {
            const usr = USERS.find(u => u.studentId === s.id);
            return `
              <tr>
                <td><div class="avatar ${avColor(s.name)}">${initials(s.name)}</div></td>
                <td><span class="link-cell" onclick="openProfile(${s.id})">${s.name}</span></td>
                <td><span class="uid-tag">${usr ? usr.uid : '—'}</span></td>
                <td style="color:#6b7280">${s.roll}</td>
                <td>${s.course}</td>
                <td>${s.section}</td>
                <td><span class="badge ${s.status}">${s.status}</span></td>
                <td>
                  <button class="btn sm" onclick="openEdit(${s.id})" style="margin-right:4px">
                    <i class="ti ti-edit" aria-hidden="true"></i>
                  </button>
                  <button class="btn sm danger" onclick="deleteStudent(${s.id})">
                    <i class="ti ti-trash" aria-hidden="true"></i>
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// =====================
// ATTENDANCE
// Faculty: can mark P/A/L
// Student: read-only view of their own
// =====================
function renderAttendance() {
  const faculty = isFaculty();
  const att     = state.attendance.filter(a => a.date === state.attDate);
  const getAtt  = id => att.find(a => a.studentId === id) || { status: 'present' };
  const active  = faculty
    ? state.students.filter(s => s.status === 'active')
    : state.students.filter(s => s.id === state.currentUser.studentId);

  const present = att.filter(a => a.status === 'present').length;
  const absent  = att.filter(a => a.status === 'absent').length;
  const late    = att.filter(a => a.status === 'late').length;

  return `
    ${!faculty ? `
      <div class="readonly-banner">
        <i class="ti ti-eye" aria-hidden="true"></i>
        Viewing your attendance record — read only.
      </div>
    ` : ''}

    ${faculty ? `
      <div class="cards-grid" style="margin-bottom:16px">
        <div class="metric-card"><div class="label">Present</div><div class="value green">${present}</div></div>
        <div class="metric-card"><div class="label">Absent</div><div class="value coral">${absent}</div></div>
        <div class="metric-card"><div class="label">Late</div><div class="value amber">${late}</div></div>
        <div class="metric-card"><div class="label">Total</div><div class="value blue">${active.length}</div></div>
      </div>

      <div class="bulk-actions">
        <button class="btn primary sm" onclick="markAllAtt('present')">
          <i class="ti ti-check" aria-hidden="true"></i> Mark All Present
        </button>
        <button class="btn sm" onclick="markAllAtt('absent')">
          <i class="ti ti-x" aria-hidden="true"></i> Mark All Absent
        </button>
        <button class="btn sm" onclick="copyPrevDayAtt()">
          <i class="ti ti-copy" aria-hidden="true"></i> Copy Previous Day
        </button>
      </div>
    ` : ''}

    <div class="att-grid">
      ${active.map(s => {
        const a = getAtt(s.id);
        return `
          <div class="att-card">
            <div style="display:flex;align-items:center;gap:8px">
              <div class="avatar ${avColor(s.name)}">${initials(s.name)}</div>
              <div>
                <div class="name">${s.name}</div>
                <div class="sub">${s.roll}</div>
              </div>
            </div>
            <div class="att-toggle">
              <button class="att-btn ${a.status === 'present' ? 'sel-present' : ''}"
                      ${faculty ? `onclick="setAtt(${s.id},'present')"` : 'disabled'}>P</button>
              <button class="att-btn ${a.status === 'absent'  ? 'sel-absent'  : ''}"
                      ${faculty ? `onclick="setAtt(${s.id},'absent')"` : 'disabled'}>A</button>
              <button class="att-btn ${a.status === 'late'    ? 'sel-late'    : ''}"
                      ${faculty ? `onclick="setAtt(${s.id},'late')"` : 'disabled'}>L</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// =====================
// MARKS
// Faculty: can edit
// Student: read-only their own subjects
// =====================
function renderMarks() {
  const faculty  = isFaculty();
  const students = faculty
    ? state.students
    : state.students.filter(s => s.id === state.currentUser.studentId);

  return `
    ${!faculty ? `
      <div class="readonly-banner">
        <i class="ti ti-eye" aria-hidden="true"></i>
        Viewing your marks — read only.
      </div>
    ` : ''}

    <div style="margin-bottom:14px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <span style="font-size:13px;color:#6b7280">Subject:</span>
      <div class="tab-row" style="margin:0">
        ${SUBJECTS.map(s => `
          <button class="tab ${state.marksSub === s ? 'active' : ''}"
                  onclick="setMarksSub('${s}')">${s}</button>
        `).join('')}
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:40px"></th>
            <th>Name</th>
            <th>Roll No.</th>
            <th>Marks</th>
            <th>Max</th>
            <th>%</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(s => {
            const m   = state.marks.find(m => m.studentId === s.id && m.subject === state.marksSub)
                        || { marks: 0, maxMarks: 100 };
            const pct = Math.round(m.marks / m.maxMarks * 100);
            const g   = getGrade(pct);
            return `
              <tr>
                <td><div class="avatar ${avColor(s.name)}">${initials(s.name)}</div></td>
                <td style="font-weight:500">${s.name}</td>
                <td style="color:#6b7280">${s.roll}</td>
                <td>
                  <input class="marks-input" type="number" min="0" max="${m.maxMarks}"
                    value="${m.marks}"
                    ${faculty ? `onchange="updateMarks(${s.id},'${state.marksSub}',this.value)"` : 'disabled'}
                  >
                </td>
                <td>${m.maxMarks}</td>
                <td>${pct}%</td>
                <td><span class="badge ${gradeClass(g)}">${g}</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// =====================
// REPORTS (faculty only)
// =====================
function renderReports() {
  const byCourse = {};

  state.students.forEach(s => {
    if (!byCourse[s.course]) {
      byCourse[s.course] = { count: 0, totalMarks: 0, markCount: 0, present: 0, total: 0 };
    }
    byCourse[s.course].count++;
    state.marks.filter(m => m.studentId === s.id).forEach(m => {
      byCourse[s.course].totalMarks += m.marks;
      byCourse[s.course].markCount++;
    });
    const att = state.attendance.filter(a => a.studentId === s.id);
    byCourse[s.course].present += att.filter(a => a.status === 'present').length;
    byCourse[s.course].total   += att.length;
  });

  const topStudents = state.students
    .map(s => ({ s, avg: getStudentAvg(s.id) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 6);

  return `
    <div class="table-wrap" style="margin-bottom:20px">
      <table>
        <thead>
          <tr>
            <th>Course</th><th>Students</th><th>Avg. Score</th><th>Attendance Rate</th><th>Grade</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(byCourse).map(([course, d]) => {
            const avg     = d.markCount ? d.totalMarks / d.markCount : 0;
            const attRate = d.total ? Math.round(d.present / d.total * 100) : 0;
            const fill    = attRate > 80 ? '#16a34a' : attRate > 60 ? '#d97706' : '#dc2626';
            return `
              <tr>
                <td style="font-weight:500">${course}</td>
                <td>${d.count}</td>
                <td><span class="badge ${gradeClass(getGrade(avg))}">${avg.toFixed(1)}%</span></td>
                <td>
                  <div class="progress-bar-wrap">
                    <div class="progress-bar-track">
                      <div class="progress-bar-fill" style="width:${attRate}%;background:${fill}"></div>
                    </div>
                    <span style="font-size:12px;color:#6b7280;min-width:32px">${attRate}%</span>
                  </div>
                </td>
                <td><span class="badge ${gradeClass(getGrade(avg))}">${getGrade(avg)}</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div class="table-wrap" style="padding:16px">
      <div style="font-size:14px;font-weight:600;margin-bottom:14px">Top Performers</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
        ${topStudents.map(({ s, avg }, i) => {
          const usr = USERS.find(u => u.studentId === s.id);
          return `
            <div style="display:flex;align-items:center;gap:10px;padding:10px;
                        background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb">
              <span style="font-size:13px;font-weight:700;color:#9ca3af;min-width:20px">#${i+1}</span>
              <div class="avatar ${avColor(s.name)}">${initials(s.name)}</div>
              <div>
                <div style="font-size:13px;font-weight:500">${s.name}</div>
                <div style="font-size:11px;color:#6b7280">
                  ${avg.toFixed(1)}% · ${getGrade(avg)}
                  <span class="uid-tag" style="margin-left:4px">${usr ? usr.uid : ''}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// =====================
// PROFILE
// Faculty: can view any student and click back
// Student: sees own profile, no back button
// =====================
function renderProfile() {
  const s = state.students.find(s => s.id === state.profileId);
  if (!s) return '<div class="empty"><i class="ti ti-user-off"></i>Student not found.</div>';

  const ms  = state.marks.filter(m => m.studentId === s.id);
  const avg = getStudentAvg(s.id);
  const g   = getGrade(avg);
  const usr = USERS.find(u => u.studentId === s.id);

  const avCss = {
    'av-blue':   { bg: '#dbeafe', color: '#1e3a8a' },
    'av-teal':   { bg: '#ccfbf1', color: '#134e4a' },
    'av-purple': { bg: '#ede9fe', color: '#3b0764' },
    'av-coral':  { bg: '#fee2e2', color: '#7f1d1d' },
    'av-green':  { bg: '#dcfce7', color: '#14532d' },
  }[avColor(s.name)];

  return `
    ${isFaculty() ? `
      <button class="btn" onclick="closeProfile()" style="margin-bottom:14px">
        <i class="ti ti-arrow-left" aria-hidden="true"></i> Back
      </button>
    ` : ''}

    ${!isFaculty() ? `
      <div class="readonly-banner">
        <i class="ti ti-eye" aria-hidden="true"></i>
        This is your profile — read only.
      </div>
    ` : ''}

    <div class="profile-header">
      <div class="profile-avatar" style="background:${avCss.bg};color:${avCss.color}">
        ${initials(s.name)}
      </div>
      <div>
        <div style="font-size:20px;font-weight:700">${s.name}</div>
        <div style="font-size:13px;color:#6b7280;margin-top:2px">
          ${s.roll} · ${s.course} · Section ${s.section}
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
          <span class="badge ${s.status}">${s.status}</span>
          ${usr ? `<span class="uid-tag">${usr.uid}</span>` : ''}
        </div>
      </div>
      <div style="margin-left:auto;text-align:right">
        <div style="font-size:28px;font-weight:700;color:#1d4ed8">${avg.toFixed(1)}%</div>
        <span class="badge ${gradeClass(g)}">${g}</span>
      </div>
    </div>

    <div class="profile-grid">
      <div class="profile-field">
        <div class="label">Email</div><div class="val">${s.email}</div>
      </div>
      <div class="profile-field">
        <div class="label">Phone</div><div class="val">${s.phone}</div>
      </div>
      <div class="profile-field">
        <div class="label">Course</div><div class="val">${s.course}</div>
      </div>
      <div class="profile-field">
        <div class="label">Section</div><div class="val">${s.section}</div>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Subject</th><th>Marks</th><th>Max Marks</th><th>Percentage</th><th>Grade</th>
          </tr>
        </thead>
        <tbody>
          ${ms.map(m => {
            const pct = Math.round(m.marks / m.maxMarks * 100);
            const mg  = getGrade(pct);
            return `
              <tr>
                <td style="font-weight:500">${m.subject}</td>
                <td>${m.marks}</td>
                <td>${m.maxMarks}</td>
                <td>${pct}%</td>
                <td><span class="badge ${gradeClass(mg)}">${mg}</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// =====================
// ADD / EDIT MODAL (faculty only)
// =====================
function renderModal() {
  const m = state.modal;
  const s = m.id ? state.students.find(s => s.id === m.id) : {};
  const v = (field, def = '') => m.data?.[field] ?? s?.[field] ?? def;

  return `
    <div class="modal-bg" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <h2>${m.id ? 'Edit' : 'Add'} Student</h2>

        <div class="form-row">
          <div class="field">
            <label>Full Name</label>
            <input id="f-name" value="${v('name')}" placeholder="Priya Sharma">
          </div>
          <div class="field">
            <label>Roll Number</label>
            <input id="f-roll" value="${v('roll')}" placeholder="CS001">
          </div>
        </div>
        <div class="form-row">
          <div class="field">
            <label>Course</label>
            <select id="f-course">
              ${COURSES.map(c => `
                <option value="${c}" ${v('course') === c ? 'selected' : ''}>${c}</option>
              `).join('')}
            </select>
          </div>
          <div class="field">
            <label>Section</label>
            <select id="f-section">
              ${SECTIONS.map(c => `
                <option value="${c}" ${v('section') === c ? 'selected' : ''}>${c}</option>
              `).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="field">
            <label>Email</label>
            <input id="f-email" value="${v('email')}" placeholder="student@edu.in">
          </div>
          <div class="field">
            <label>Phone</label>
            <input id="f-phone" value="${v('phone')}" placeholder="9876543210">
          </div>
        </div>
        <div class="form-row full">
          <div class="field">
            <label>Status</label>
            <select id="f-status">
              <option value="active"   ${v('status','active') === 'active'   ? 'selected' : ''}>Active</option>
              <option value="inactive" ${v('status')          === 'inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn" onclick="closeModal()">Cancel</button>
          <button class="btn primary" onclick="saveStudent(${m.id || 'null'})">
            ${m.id ? 'Save Changes' : 'Add Student'}
          </button>
        </div>
      </div>
    </div>
  `;
}