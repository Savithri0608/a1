// =====================
// Auth — Login / Logout
// =====================

function selectLoginRole(role) {
  state.loginRole  = role;
  state.loginError = '';
  render();
}

function selectLoginMode(mode) {
  state.loginMode  = mode;
  state.loginError = '';
  render();
}

function doLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!username || !password) {
    state.loginError = 'Please enter a username and password.';
    render();
    return;
  }

  const user = USERS.find(
    u => u.username.toLowerCase() === username.toLowerCase() &&
         u.password === password &&
         u.role === state.loginRole
  );

  if (!user) {
    state.loginError = 'Invalid credentials. If you are new, choose Sign Up.';
    render();
    return;
  }

  state.currentUser = user;
  state.loginError  = '';

  if (user.role === 'student') {
    state.page      = 'students';
    state.profileId = user.studentId;
  } else {
    state.page      = 'dashboard';
    state.profileId = null;
  }

  render();
}

function doSignup() {
  const get = id => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };

  const name     = get('signup-name');
  const username = get('login-username');
  const password = get('login-password');
  const role     = state.loginRole;

  if (!name || !username || !password) {
    state.loginError = 'Name, username and password are all required.';
    render();
    return;
  }

  const clash = USERS.some(u =>
    u.role === role &&
    u.username.toLowerCase() === username.toLowerCase()
  );
  if (clash) {
    state.loginError = `Username "${username}" is already registered as a ${role}. Try another, sign in, or reset demo data below.`;
    render();
    return;
  }

  let newUser;

  if (role === 'faculty') {
    const dept = get('signup-dept') || 'General';
    newUser = {
      uid:        `FAC-${Date.now().toString().slice(-4)}`,
      role:       'faculty',
      name,
      username,
      password,
      department: dept,
      email:      `${username.toLowerCase()}@edutrack.edu`
    };
  } else {
    const course  = get('signup-course')  || COURSES[0];
    const section = get('signup-section') || SECTIONS[0];

    // Create a matching student record so they appear in lists.
    const newStudent = {
      id:      nextId++,
      name,
      roll:    username,
      course,
      section,
      email:   `${username.toLowerCase()}@student.edu`,
      phone:   '',
      status:  'active'
    };
    state.students   = [...state.students, newStudent];
    state.marks      = [...state.marks, ...makeMarks(newStudent.id)];
    state.attendance = [...state.attendance, { studentId: newStudent.id, date: todayStr(), status: 'present' }];

    newUser = {
      uid:       `STU-${username.toUpperCase()}`,
      role:      'student',
      name,
      username,
      password,
      studentId: newStudent.id
    };
  }

  USERS = [...USERS, newUser];
  state.currentUser = newUser;
  state.loginError  = '';

  if (newUser.role === 'student') {
    state.page      = 'students';
    state.profileId = newUser.studentId;
  } else {
    state.page      = 'dashboard';
    state.profileId = null;
  }

  render();
}

function doLogout() {
  state.currentUser  = null;
  state.loginRole    = 'faculty';
  state.loginMode    = 'signin';
  state.loginError   = '';
  state.page         = 'dashboard';
  state.profileId    = null;
  state.modal        = null;
  state.search       = '';
  state.filterCourse = '';
  render();
}

// Toggle visibility on the password field next to the eye button
function togglePasswordVisibility(btn) {
  const input = btn.parentElement.querySelector('input');
  const icon  = btn.querySelector('i');
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  icon.className = show ? 'ti ti-eye-off' : 'ti ti-eye';
  btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
}

// Allow pressing Enter to submit login / signup
function loginKeydown(e) {
  if (e.key === 'Enter') {
    state.loginMode === 'signup' ? doSignup() : doLogin();
  }
}

function resetDemoData() {
  if (!confirm('This will delete all signed-up accounts and reset to the original demo data. Continue?')) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  location.reload();
}