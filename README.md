# 🌊 Dayflow – Human Resource Management System (HRMS)

**Dayflow** is a modern, secure, and scalable **Human Resource Management System (HRMS)** designed to streamline employee operations and simplify HR workflows. Built with the latest **Next.js App Router** architecture, Dayflow delivers a fast, elegant, and intuitive experience for both employees and administrators.

---

## ✨ Why Dayflow?

Dayflow centralizes **employee management, attendance, leave tracking, and payroll** into a single, clean platform—reducing manual work and improving organizational efficiency.

> Built for modern teams. Designed for clarity. Powered by performance.

---

## 🚀 Key Highlights

- ⚡ High-performance UI with **Next.js 16 + React 19**
- 🔐 Secure authentication with **role-based access control**
- 📊 Real-time HR insights for admins and employees
- 🎨 Smooth animations & clean design using **Tailwind CSS & Framer Motion**
- 🗄️ Lightweight local database using **SQLite**

---

## 🧩 Core Features

### 👥 Employee Management
- Complete employee profiles (department, designation, joining date)
- Unique employee ID system
- Role-based access (Employee / Admin / HR)
- Admin-controlled employee directory

### ⏱️ Attendance Management
- One-click **Check-in / Check-out**
- Daily & weekly attendance views
- Status tracking: Present, Absent, Half-day, Leave
- Admin-wide attendance monitoring

### 🏖️ Leave Management
- Apply for leave directly from the dashboard
- Leave types: Paid, Sick, Unpaid
- Admin approval/rejection workflow
- Auto-update attendance on approval

### 💰 Payroll Management
- Read-only salary view for employees
- Admin-managed salary structure
- Monthly payroll records (deductions & net pay)
- Transparent payroll history

### 🔐 Authentication & Authorization
- Secure login & registration
- Cookie-based sessions
- Role-aware routing
- Strict data isolation by role

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Database | SQLite (`better-sqlite3`) |
| Auth | bcryptjs + Cookie-based sessions |
| Notifications | Sonner |

---


---

## 🌍 Environment Variables

| Variable | Description |
|--------|-------------|
| DATABASE_PATH | SQLite DB file path (default: `data/dayflow.db`) |
| NEXT_PUBLIC_APP_URL | Public app URL |

---

## 📜 Available Scripts

- `npm run dev` – Start dev server
- `npm run build` – Production build
- `npm start` – Run production server
- `npm run lint` – ESLint checks

---

## 🗄️ Database & Data Layer

Uses **SQLite** via `better-sqlite3`.  
Schema auto-initializes on first run.

**Tables**
- users
- attendance
- leave_requests
- payroll
- notifications

---

## 🔌 API Endpoints

- `/api/auth/*`
- `/api/employees/*`
- `/api/attendance/*`
- `/api/leave/*`
- `/api/payroll/*`
- `/api/notifications/*`

---

## 🔐 Security & Sessions

- Password hashing with **bcryptjs**
- Cookie-based session (`session`)
- Built on Next.js `cookies()` API

> Production tip: use signed/encrypted cookies or a server-side session store.

---

## 🛡️ Access Control

| Role | Permissions |
|------|-------------|
| Employee | Own profile, attendance, leave, payroll (read-only) |
| Admin / HR | Full access to all employees & system data |

---

## 🧠 Development Notes

- Consider **PostgreSQL** for production
- Add input validation & sanitization
- Implement logging & monitoring
- Secure cookies (`httpOnly`, `secure`, `sameSite`)

---

## 🧩 Troubleshooting

- DB not found → create `data/` or set `DATABASE_PATH`
- Auth issues → clear cookies and re-login

---

## 🌟 Final Note

**Dayflow** is a solid foundation for enterprise-ready HR systems—clean architecture, modern tooling, and scalable design.

> *Manage people better. Flow through work smarter.*  
> **Welcome to Dayflow 🌊**


