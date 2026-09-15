// ===========================
//   STUDENT CRUD APPLICATION
//   Pure HTML + CSS + JS
//   Data persisted via localStorage
// ===========================

const STORAGE_KEY = "studentHub_students";

// ---- State ----
let students = [];
let editingId = null;
let deleteTarget = null;
let deleteAll = false;

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  loadStudents();
  renderTable(students);
  updateStats();
  updateFilterOptions();
});

// ============================================================
//  CRUD OPERATIONS
// ============================================================

/** CREATE / UPDATE */
function handleFormSubmit(e) {
  e.preventDefault();

  const id     = document.getElementById("studentId").value;
  const first  = document.getElementById("firstName").value.trim();
  const last   = document.getElementById("lastName").value.trim();
  const email  = document.getElementById("email").value.trim();
  const phone  = document.getElementById("phone").value.trim();
  const age    = document.getElementById("age").value.trim();
  const gender = document.getElementById("gender").value;
  const course = document.getElementById("course").value;
  const year   = document.getElementById("year").value;
  const address= document.getElementById("address").value.trim();

  // Email uniqueness check
  const duplicate = students.find(s => s.email === email && s.id !== id);
  if (duplicate) {
    showToast("A student with this email already exists!", "error");
    return;
  }

  if (id) {
    // UPDATE
    const idx = students.findIndex(s => s.id === id);
    students[idx] = { id, firstName: first, lastName: last, email, phone, age, gender, course, year, address, updatedAt: new Date().toISOString() };
    showToast("Student updated successfully!", "success");
  } else {
    // CREATE
    const newStudent = {
      id: generateId(),
      firstName: first, lastName: last, email, phone, age, gender, course, year, address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    students.unshift(newStudent);
    showToast("Student added successfully!", "success");
  }

  saveStudents();
  renderTable(getFilteredStudents());
  updateStats();
  updateFilterOptions();
  clearForm();
}

/** READ – render table rows */
function renderTable(data) {
  const tbody = document.getElementById("studentTableBody");
  const empty = document.getElementById("emptyState");
  const wrapper = document.getElementById("tableWrapper");

  tbody.innerHTML = "";

  if (data.length === 0) {
    empty.style.display = "block";
    wrapper.style.display = "none";
    return;
  }

  empty.style.display = "none";
  wrapper.style.display = "block";

  data.forEach((s, i) => {
    const gClass = s.gender === "Male" ? "gender-male" : s.gender === "Female" ? "gender-female" : "gender-other";
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", s.id);
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>
        <div class="name-cell">
          <span class="full-name">${escHtml(s.firstName)} ${escHtml(s.lastName)}</span>
          ${s.address ? `<span class="address">${escHtml(s.address)}</span>` : ""}
        </div>
      </td>
      <td>${escHtml(s.email)}</td>
      <td>${escHtml(s.phone)}</td>
      <td>${escHtml(s.age)}</td>
      <td><span class="gender-badge ${gClass}">${escHtml(s.gender)}</span></td>
      <td><span class="course-badge">${escHtml(s.course)}</span></td>
      <td><span class="year-badge">${escHtml(s.year)}</span></td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-warning btn-sm" onclick="editStudent('${s.id}')">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteStudent('${s.id}')">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/** UPDATE – load student into form */
function editStudent(id) {
  const s = students.find(s => s.id === id);
  if (!s) return;

  editingId = id;
  document.getElementById("studentId").value    = s.id;
  document.getElementById("firstName").value    = s.firstName;
  document.getElementById("lastName").value     = s.lastName;
  document.getElementById("email").value        = s.email;
  document.getElementById("phone").value        = s.phone;
  document.getElementById("age").value          = s.age;
  document.getElementById("gender").value       = s.gender;
  document.getElementById("course").value       = s.course;
  document.getElementById("year").value         = s.year;
  document.getElementById("address").value      = s.address || "";

  document.getElementById("formTitle").innerHTML = '<i class="fas fa-user-edit"></i> Update Student';
  document.getElementById("submitBtn").innerHTML = '<i class="fas fa-save"></i> Update Student';
  document.getElementById("submitBtn").className = "btn btn-success";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/** DELETE single */
function confirmDeleteStudent(id) {
  deleteTarget = id;
  deleteAll = false;
  const s = students.find(s => s.id === id);
  document.getElementById("modalMessage").textContent = `Are you sure you want to delete "${s.firstName} ${s.lastName}"? This action cannot be undone.`;
  openModal();
  document.getElementById("confirmDeleteBtn").onclick = () => {
    students = students.filter(s => s.id !== deleteTarget);
    saveStudents();
    renderTable(getFilteredStudents());
    updateStats();
    updateFilterOptions();
    closeModal();
    showToast("Student deleted successfully!", "success");
  };
}

/** DELETE all */
function deleteAllStudents() {
  if (students.length === 0) {
    showToast("No students to delete!", "warning");
    return;
  }
  deleteAll = true;
  document.getElementById("modalMessage").textContent = `Are you sure you want to delete ALL ${students.length} student(s)? This action cannot be undone.`;
  openModal();
  document.getElementById("confirmDeleteBtn").onclick = () => {
    students = [];
    saveStudents();
    renderTable([]);
    updateStats();
    updateFilterOptions();
    closeModal();
    showToast("All students deleted!", "success");
  };
}

// ============================================================
//  SEARCH & FILTER
// ============================================================
function getFilteredStudents() {
  const q      = document.getElementById("searchInput").value.toLowerCase().trim();
  const course = document.getElementById("filterCourse").value;
  return students.filter(s => {
    const matchSearch = !q ||
      `${s.firstName} ${s.lastName} ${s.email} ${s.phone} ${s.course} ${s.year} ${s.gender}`.toLowerCase().includes(q);
    const matchCourse = !course || s.course === course;
    return matchSearch && matchCourse;
  });
}

function searchStudents() { renderTable(getFilteredStudents()); }
function filterStudents()  { renderTable(getFilteredStudents()); }

// ============================================================
//  STATS
// ============================================================
function updateStats() {
  document.getElementById("totalStudents").textContent = students.length;
  document.getElementById("maleCount").textContent    = students.filter(s => s.gender === "Male").length;
  document.getElementById("femaleCount").textContent  = students.filter(s => s.gender === "Female").length;
  const uniqueCourses = new Set(students.map(s => s.course));
  document.getElementById("courseCount").textContent  = uniqueCourses.size;
}

function updateFilterOptions() {
  const sel = document.getElementById("filterCourse");
  const current = sel.value;
  const courses = [...new Set(students.map(s => s.course))].sort();
  sel.innerHTML = '<option value="">All Courses</option>' +
    courses.map(c => `<option value="${c}" ${c === current ? "selected" : ""}>${c}</option>`).join("");
}

// ============================================================
//  FORM HELPERS
// ============================================================
function clearForm() {
  document.getElementById("studentForm").reset();
  document.getElementById("studentId").value    = "";
  editingId = null;
  document.getElementById("formTitle").innerHTML = '<i class="fas fa-user-plus"></i> Add New Student';
  document.getElementById("submitBtn").innerHTML = '<i class="fas fa-plus-circle"></i> Add Student';
  document.getElementById("submitBtn").className = "btn btn-primary";
}

// ============================================================
//  MODAL
// ============================================================
function openModal()  { document.getElementById("modalOverlay").classList.add("active"); }
function closeModal() { document.getElementById("modalOverlay").classList.remove("active"); }

// Close modal on overlay click
document.getElementById("modalOverlay").addEventListener("click", function(e) {
  if (e.target === this) closeModal();
});

// ============================================================
//  TOAST
// ============================================================
let toastTimer;
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const icon  = document.getElementById("toastIcon");
  const msg   = document.getElementById("toastMsg");

  toast.className = "toast";
  icon.className  = type === "success" ? "fas fa-check-circle" :
                    type === "error"   ? "fas fa-times-circle"  :
                                         "fas fa-exclamation-circle";
  if (type !== "success") toast.classList.add(type);
  msg.textContent = message;

  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

// ============================================================
//  LOCAL STORAGE
// ============================================================
function saveStudents()  { localStorage.setItem(STORAGE_KEY, JSON.stringify(students)); }
function loadStudents()  {
  const data = localStorage.getItem(STORAGE_KEY);
  students = data ? JSON.parse(data) : [];
}

// ============================================================
//  UTILITIES
// ============================================================
function generateId() { return "_" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36); }
function escHtml(str) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}
