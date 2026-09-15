# StudentHub — CRUD Application

> **Web Development Minor Project**

A fully functional **CRUD (Create, Read, Update, Delete)** web application for managing student records, built with pure **HTML5, CSS3, and Vanilla JavaScript** — no frameworks, no backend, no build tools required.

---

## What is a CRUD Application?

A **CRUD app** is a type of software application that performs four basic operations on data:

| Letter | Operation | Description |
|--------|-----------|-------------|
| **C** | Create    | Add new student records to the system |
| **R** | Read      | View, search, and filter existing records |
| **U** | Update    | Edit and modify stored student information |
| **D** | Delete    | Remove individual or all records |

---

## Features

- **Add Students** — Fill in the form and submit to create a new record
- **View All Students** — Displayed in a clean, responsive table
- **Search** — Instantly filter students by name, email, course, gender, or year
- **Filter by Course** — Dropdown filter for course-specific views
- **Edit** — Pre-fills form with existing data for quick updates
- **Delete** — Delete individual students or wipe all records at once
- **Stats Dashboard** — Live counters for total students, male/female count, and unique courses
- **Persistent Storage** — All data saved to `localStorage` (survives page refresh)
- **Confirmation Modal** — Safe delete with confirmation dialog
- **Toast Notifications** — Success/error/warning feedback messages
- **Responsive Design** — Works on desktop, tablet, and mobile

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5      | Structure & semantic markup |
| CSS3       | Styling, animations, responsive layout |
| JavaScript (ES6+) | CRUD logic, DOM manipulation, localStorage |
| Font Awesome 6 | Icons |
| localStorage | Client-side data persistence |

---

## Project Structure

```
WebDev-Minor/
├── index.html    # Main HTML page (structure)
├── style.css     # Stylesheet (dark theme UI)
├── script.js     # JavaScript (CRUD logic)
└── README.md     # Project documentation
```

---

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/Siddhantkr07/WebDev-Minor.git
   ```
2. Open `index.html` in any modern browser — **no server needed!**

---

## CRUD Operations — How They Work

### Create
Fill in the student form and click **"Add Student"**. The record is saved to `localStorage` and appears instantly in the table.

### Read
All records are displayed in the table on page load. Use the **search bar** or **course filter** to narrow results.

### Update
Click the **Edit** button on any row. The form pre-populates with that student's data. Modify fields and click **"Update Student"** to save changes.

### Delete
- **Single delete**: Click the **Delete** button on a row → confirm in the modal
- **Delete All**: Click the **Delete All** button in the table header → confirm to wipe all records

---

## Screenshots

> Open `index.html` in a browser to see the live application.

---

## Author

**Siddhantkr07**  
Web Development Minor Project — CRUD Application

---

*Built with HTML, CSS & JavaScript — No frameworks, No dependencies*
