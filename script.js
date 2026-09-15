// ============================
//  STUDENTHUB — CRUD APP v3
// ============================
const KEY = "studentHub_v3";

const GRAD = {
  Male:   ["#4f46e5","#7c3aed"],
  Female: ["#db2777","#ec4899"],
  Other:  ["#7c3aed","#a855f7"],
  "":     ["#334155","#475569"]
};

let students = [];
let _timer;

// ---- BOOT ----
document.addEventListener("DOMContentLoaded", () => {
  try { students = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { students = []; }
  render(students); stats(); filters();
});

// ============================================================
// SUBMIT (Create / Update)
// ============================================================
function handleSubmit(e) {
  e.preventDefault();
  const id  = v("sId");
  const fn  = cap(v("fName")), ln = cap(v("lName"));
  const em  = v("email").toLowerCase();
  const ph  = v("phone"), ag = v("age");
  const gn  = v("gender"), co = v("course"), yr = v("year"), ad = v("address");

  if (students.find(s => s.email === em && s.id !== id)) {
    toast("Email already in use!", "err"); return;
  }

  if (id) {
    const i = students.findIndex(s => s.id === id);
    students[i] = { ...students[i], fn, ln, em, ph, ag, gn, co, yr, ad, up: now() };
    toast("Student updated!");
  } else {
    students.unshift({ id: uid(), fn, ln, em, ph, ag, gn, co, yr, ad, cr: now(), up: now() });
    toast("Student added!");
  }
  save(); render(filtered()); stats(); filters(); clearForm();
}

// ============================================================
// RENDER TABLE
// ============================================================
function render(data) {
  const tb  = document.getElementById("tBody");
  const emp = document.getElementById("emptyEl");
  const tw  = document.getElementById("tblWrap");
  const rc  = document.getElementById("recCount");

  tb.innerHTML = "";
  rc.textContent = `${data.length} record${data.length !== 1 ? "s" : ""}`;

  if (!data.length) { emp.style.display = "flex"; tw.style.display = "none"; return; }
  emp.style.display = "none"; tw.style.display = "block";

  data.forEach((s, i) => {
    const [c1, c2] = GRAD[s.gn] || GRAD[""];
    const initials = ((s.fn[0] || "") + (s.ln[0] || "")).toUpperCase();
    const gBadge   = s.gn === "Male" ? "bm" : s.gn === "Female" ? "bf" : "bo";
    const tr = document.createElement("tr");
    tr.style.animationDelay = (i * 35) + "ms";
    tr.innerHTML = `
      <td><div class="snum">${i + 1}</div></td>
      <td>
        <div class="stu-cell">
          <div class="avatar" style="background:linear-gradient(135deg,${c1},${c2})">${x(initials)}</div>
          <div class="stu-info">
            <div class="sname">${x(s.fn)} ${x(s.ln)}</div>
            ${s.ad ? `<div class="saddr">${x(s.ad)}</div>` : ""}
          </div>
        </div>
      </td>
      <td>
        <div class="contact-cell">
          <div class="mail">${x(s.em)}</div>
          <div class="ph">${x(s.ph)}</div>
        </div>
      </td>
      <td><span class="badge ba">${x(s.ag)}</span></td>
      <td><span class="badge ${gBadge}">${x(s.gn)}</span></td>
      <td><span class="badge bc" title="${x(s.co)}">${x(s.co)}</span></td>
      <td><span class="badge by">${x(s.yr)}</span></td>
      <td>
        <div class="acts">
          <button class="btn btn-warn btn-sm" onclick="edit('${s.id}')"><i class="fas fa-pen"></i></button>
          <button class="btn btn-danger btn-sm" onclick="del('${s.id}')"><i class="fas fa-trash"></i></button>
        </div>
      </td>`;
    tb.appendChild(tr);
  });
}

// ============================================================
// EDIT
// ============================================================
function edit(id) {
  const s = students.find(s => s.id === id); if (!s) return;
  set("sId", s.id); set("fName", s.fn); set("lName", s.ln);
  set("email", s.em); set("phone", s.ph); set("age", s.ag);
  set("gender", s.gn); set("course", s.co); set("year", s.yr); set("address", s.ad || "");

  document.getElementById("fTitle").textContent = "Edit Student";
  document.getElementById("fSub").textContent   = "Update the details below";
  const ico = document.getElementById("fIcon");
  ico.innerHTML = '<i class="fas fa-user-edit"></i>';
  ico.style.background = "linear-gradient(135deg,#d97706,#f59e0b)";
  ico.style.boxShadow  = "0 4px 14px rgba(245,158,11,.4)";
  const btn = document.getElementById("sBtn");
  btn.innerHTML = '<i class="fas fa-save"></i> Update Student';
  btn.className = "btn btn-success btn-full";

  document.querySelector(".form-card").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ============================================================
// DELETE
// ============================================================
function del(id) {
  const s = students.find(s => s.id === id);
  document.getElementById("modalTxt").textContent = `Delete "${s.fn} ${s.ln}"? This action cannot be undone.`;
  openModal();
  document.getElementById("modalOk").onclick = () => {
    students = students.filter(s => s.id !== id);
    afterMut("Student deleted.");
  };
}

function deleteAll() {
  if (!students.length) { toast("Nothing to delete!", "warn"); return; }
  document.getElementById("modalTxt").textContent = `Delete all ${students.length} student(s)? This cannot be undone.`;
  openModal();
  document.getElementById("modalOk").onclick = () => { students = []; afterMut("All records cleared."); };
}

function afterMut(msg) {
  save(); render(filtered()); stats(); filters(); closeModal(); toast(msg);
}

// ============================================================
// SEARCH / FILTER
// ============================================================
function filtered() {
  const q  = v("searchQ").toLowerCase().trim();
  const co = v("fCourse");
  return students.filter(s => {
    const m = !q || `${s.fn} ${s.ln} ${s.em} ${s.ph} ${s.co} ${s.yr} ${s.gn}`.toLowerCase().includes(q);
    return m && (!co || s.co === co);
  });
}
function doSearch() { render(filtered()); }
function doFilter()  { render(filtered()); }

// ============================================================
// STATS
// ============================================================
function stats() {
  animCount("totalStudents", students.length);
  animCount("maleCount",     students.filter(s => s.gn === "Male").length);
  animCount("femaleCount",   students.filter(s => s.gn === "Female").length);
  animCount("courseCount",   new Set(students.map(s => s.co)).size);
}

function animCount(id, target) {
  const el = document.getElementById(id);
  const from = parseInt(el.textContent) || 0;
  if (from === target) return;
  const steps = 20, inc = (target - from) / steps;
  let cur = from, step = 0;
  const t = setInterval(() => {
    step++; cur += inc;
    el.textContent = Math.round(step >= steps ? target : cur);
    if (step >= steps) clearInterval(t);
  }, 25);
}

// ============================================================
// FILTER OPTIONS
// ============================================================
function filters() {
  const sel = document.getElementById("fCourse");
  const cur = sel.value;
  const cs  = [...new Set(students.map(s => s.co))].sort();
  sel.innerHTML = '<option value="">All Courses</option>' +
    cs.map(c => `<option value="${c}"${c===cur?" selected":""}>${c}</option>`).join("");
}

// ============================================================
// FORM RESET
// ============================================================
function clearForm() {
  document.getElementById("sForm").reset();
  set("sId", "");
  document.getElementById("fTitle").textContent = "Add Student";
  document.getElementById("fSub").textContent   = "Fill in the details below";
  const ico = document.getElementById("fIcon");
  ico.innerHTML = '<i class="fas fa-user-plus"></i>';
  ico.style.background = "linear-gradient(135deg,#4f46e5,#a855f7)";
  ico.style.boxShadow  = "0 4px 14px rgba(99,102,241,.4)";
  const btn = document.getElementById("sBtn");
  btn.innerHTML = '<i class="fas fa-plus-circle"></i> Add Student';
  btn.className = "btn btn-primary btn-full";
}

// ============================================================
// MODAL
// ============================================================
function openModal()  { document.getElementById("modalBg").classList.add("on"); }
function closeModal() { document.getElementById("modalBg").classList.remove("on"); }
document.getElementById("modalBg").addEventListener("click", e => { if (e.target === e.currentTarget) closeModal(); });

// ============================================================
// TOAST
// ============================================================
function toast(msg, type = "ok") {
  const el  = document.getElementById("toastEl");
  const ico = document.getElementById("toastIco");
  const txt = document.getElementById("toastTxt");
  const MAP = { ok: ["t-ok","fa-check-circle"], err: ["t-err","fa-times-circle"], warn: ["t-warn","fa-exclamation-circle"] };
  const [cls, icon] = MAP[type] || MAP.ok;
  el.className = `toast ${cls}`;
  ico.className = `fas ${icon}`;
  txt.textContent = msg;
  el.classList.add("show");
  clearTimeout(_timer);
  _timer = setTimeout(() => el.classList.remove("show"), 3400);
}

// ============================================================
// UTILS
// ============================================================
function save()   { localStorage.setItem(KEY, JSON.stringify(students)); }
function uid()    { return "_" + Math.random().toString(36).slice(2,9) + Date.now().toString(36); }
function now()    { return new Date().toISOString(); }
function cap(s)   { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function v(id)    { return (document.getElementById(id).value || "").trim(); }
function set(id,val){ document.getElementById(id).value = val; }
function x(str)   { const d = document.createElement("div"); d.appendChild(document.createTextNode(String(str??"")));return d.innerHTML; }
