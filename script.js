// ===========================
//   STUDENTHUB — CRUD APP
// ===========================

const STORAGE_KEY = "studentHub_v2";

// Avatar colors per gender
const AVATAR_COLORS = {
  Male:   ["#6366f1","#4338ca"],
  Female: ["#ec4899","#db2777"],
  Other:  ["#8b5cf6","#7c3aed"],
  "":     ["#64748b","#475569"]
};

let students  = [];
let editingId = null;
let toastTimer;

// ---- Boot ----
document.addEventListener("DOMContentLoaded", () => {
  loadStudents();
  renderTable(students);
  updateStats();
  updateFilterOptions();
});

// ============================================================
//  CRUD
// ============================================================

function handleFormSubmit(e) {
  e.preventDefault();
  const id      = document.getElementById("studentId").value;
  const first   = cap(document.getElementById("firstName").value.trim());
  const last    = cap(document.getElementById("lastName").value.trim());
  const email   = document.getElementById("email").value.trim().toLowerCase();
  const phone   = document.getElementById("phone").value.trim();
  const age     = document.getElementById("age").value.trim();
  const gender  = document.getElementById("gender").value;
  const course  = document.getElementById("course").value;
  const year    = document.getElementById("year").value;
  const address = document.getElementById("address").value.trim();

  // Duplicate email check
  if (students.find(s => s.email === email && s.id !== id)) {
    showToast("Email already exists!", "error"); return;
  }

  if (id) {
    const idx = students.findIndex(s => s.id === id);
    students[idx] = { ...students[idx], firstName: first, lastName: last, email, phone, age, gender, course, year, address, updatedAt: new Date().toISOString() };
    showToast("Student updated successfully!");
  } else {
    students.unshift({ id: uid(), firstName: first, lastName: last, email, phone, age, gender, course, year, address, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    showToast("Student added successfully!");
  }

  saveStudents();
  renderTable(getFiltered());
  updateStats();
  updateFilterOptions();
  clearForm();
}

function renderTable(data) {
  const tbody   = document.getElementById("studentTableBody");
  const empty   = document.getElementById("emptyState");
  const wrapper = document.getElementById("tableWrapper");
  const countEl = document.getElementById("recordCount");

  tbody.innerHTML = "";
  countEl.textContent = `${data.length} record${data.length !== 1 ? "s" : ""} found`;

  if (data.length === 0) { empty.style.display = "block"; wrapper.style.display = "none"; return; }
  empty.style.display = "none"; wrapper.style.display = "block";

  data.forEach((s, i) => {
    const initials = (s.firstName[0] || "") + (s.lastName[0] || "");
    const colors   = AVATAR_COLORS[s.gender] || AVATAR_COLORS[""];
    const gClass   = s.gender === "Male" ? "gender-male" : s.gender === "Female" ? "gender-female" : "gender-other";
    const tr       = document.createElement("tr");
    tr.setAttribute("data-id", s.id);
    tr.innerHTML = `
      <td><div class="serial-num">${i + 1}</div></td>
      <td>
        <div class="name-cell">
          <div class="student-avatar" style="background:linear-gradient(135deg,${colors[0]},${colors[1]})">${esc(initials.toUpperCase())}</div>
          <div class="name-info">
            <div class="full-name">${esc(s.firstName)} ${esc(s.lastName)}</div>
            ${s.address ? `<div class="address">${esc(s.address)}</div>` : ""}
          </div>
        </div>
      </td>
      <td>
        <div class="email-text">${esc(s.email)}</div>
        <div class="phone-text" style="margin-top:2px">${esc(s.phone)}</div>
      </td>
      <td><span class="year-badge" style="background:rgba(245,158,11,.1);color:#fbbf24;border-color:rgba(245,158,11,.2)">${esc(s.age)}</span></td>
      <td><span class="gender-badge ${gClass}">${esc(s.gender)}</span></td>
      <td><span class="course-badge" title="${esc(s.course)}">${esc(s.course)}</span></td>
      <td><span class="year-badge">${esc(s.year)}</span></td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-warning btn-sm" onclick="editStudent('${s.id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteStudent('${s.id}')"><i class="fas fa-trash"></i></button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

function editStudent(id) {
  const s = students.find(s => s.id === id);
  if (!s) return;
  editingId = id;
  document.getElementById("studentId").value  = s.id;
  document.getElementById("firstName").value  = s.firstName;
  document.getElementById("lastName").value   = s.lastName;
  document.getElementById("email").value      = s.email;
  document.getElementById("phone").value      = s.phone;
  document.getElementById("age").value        = s.age;
  document.getElementById("gender").value     = s.gender;
  document.getElementById("course").value     = s.course;
  document.getElementById("year").value       = s.year;
  document.getElementById("address").value    = s.address || "";

  document.getElementById("formTitle").innerHTML  = 'Edit Student <span id="formSubtitle">Update the details below</span>';
  document.getElementById("formIconEl").innerHTML = '<i class="fas fa-user-edit"></i>';
  document.getElementById("formIconEl").style.background = "linear-gradient(135deg,#f59e0b,#d97706)";
  document.getElementById("submitBtn").innerHTML  = '<i class="fas fa-save"></i> Update Student';
  document.getElementById("submitBtn").className  = "btn btn-success btn-full";

  document.querySelector(".form-section").scrollIntoView({ behavior: "smooth" });
}

function confirmDeleteStudent(id) {
  const s = students.find(s => s.id === id);
  document.getElementById("modalMessage").textContent = `Delete "${s.firstName} ${s.lastName}"? This cannot be undone.`;
  openModal();
  document.getElementById("confirmDeleteBtn").onclick = () => {
    students = students.filter(s => s.id !== id);
    afterMutation("Student deleted.");
  };
}

function deleteAllStudents() {
  if (!students.length) { showToast("Nothing to delete!", "warning"); return; }
  document.getElementById("modalMessage").textContent = `Delete all ${students.length} student(s)? This cannot be undone.`;
  openModal();
  document.getElementById("confirmDeleteBtn").onclick = () => {
    students = [];
    afterMutation("All students deleted.");
  };
}

function afterMutation(msg) {
  saveStudents(); renderTable(getFiltered()); updateStats(); updateFilterOptions(); closeModal(); showToast(msg);
}

// ============================================================
//  SEARCH & FILTER
// ============================================================
function getFiltered() {
  const q = document.getElementById("searchInput").value.toLowerCase().trim();
  const c = document.getElementById("filterCourse").value;
  return students.filter(s => {
    const match = !q || `${s.firstName} ${s.lastName} ${s.email} ${s.phone} ${s.course} ${s.year} ${s.gender}`.toLowerCase().includes(q);
    return match && (!c || s.course === c);
  });
}
function searchStudents() { renderTable(getFiltered()); }
function filterStudents()  { renderTable(getFiltered()); }

// ============================================================
//  STATS
// ============================================================
function updateStats() {
  document.getElementById("totalStudents").textContent = students.length;
  document.getElementById("maleCount").textContent     = students.filter(s => s.gender === "Male").length;
  document.getElementById("femaleCount").textContent   = students.filter(s => s.gender === "Female").length;
  document.getElementById("courseCount").textContent   = new Set(students.map(s => s.course)).size;
}

function updateFilterOptions() {
  const sel     = document.getElementById("filterCourse");
  const current = sel.value;
  const courses = [...new Set(students.map(s => s.course))].sort();
  sel.innerHTML = '<option value="">All Courses</option>' +
    courses.map(c => `<option value="${c}"${c === current ? " selected" : ""}>${c}</option>`).join("");
}

// ============================================================
//  FORM HELPERS
// ============================================================
function clearForm() {
  document.getElementById("studentForm").reset();
  document.getElementById("studentId").value  = "";
  editingId = null;
  document.getElementById("formTitle").innerHTML  = 'Add Student <span id="formSubtitle">Fill in the details below</span>';
  document.getElementById("formIconEl").innerHTML = '<i class="fas fa-user-plus"></i>';
  document.getElementById("formIconEl").style.background = "linear-gradient(135deg,#6366f1,#8b5cf6)";
  document.getElementById("submitBtn").innerHTML  = '<i class="fas fa-plus-circle"></i> Add Student';
  document.getElementById("submitBtn").className  = "btn btn-primary btn-full";
}

// ============================================================
//  MODAL
// ============================================================
function openModal()  { document.getElementById("modalOverlay").classList.add("active"); }
function closeModal() { document.getElementById("modalOverlay").classList.remove("active"); }
document.getElementById("modalOverlay").addEventListener("click", e => { if (e.target === e.currentTarget) closeModal(); });

// ============================================================
//  TOAST
// ============================================================
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  const icon = { success: "fa-check-circle", error: "fa-times-circle", warning: "fa-exclamation-circle" };
  t.className = `toast${type !== "success" ? " " + type : ""}`;
  document.getElementById("toastIcon").className = `fas ${icon[type] || icon.success}`;
  document.getElementById("toastMsg").textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
}

// ============================================================
//  LOCALSTORAGE
// ============================================================
function saveStudents() { localStorage.setItem(STORAGE_KEY, JSON.stringify(students)); }
function loadStudents() { try { students = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { students = []; } }

// ============================================================
//  UTILS
// ============================================================
function uid()     { return "_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36); }
function cap(str)  { return str ? str.charAt(0).toUpperCase() + str.slice(1) : str; }
function esc(str)  { const d = document.createElement("div"); d.appendChild(document.createTextNode(String(str ?? ""))); return d.innerHTML; }
