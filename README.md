# Dayflow – Human Resource Management System (HRMS)

**Dayflow** is a modern, comprehensive Human Resource Management System built with Next.js. It provides essential HR features including employee management, attendance tracking, leave management, and payroll processing.

## At a glance
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Database**: SQLite using `better-sqlite3` (file stored at `data/dayflow.db`)
- **Styling**: Tailwind CSS (+ Framer Motion for animations)
- **Auth**: Cookie-based session management with role-based access control

## Core features

- **Employee Management**
  - Employee profiles with department, designation, and joining date
  - Role-based access (Employee vs Admin/HR)
  - Employee ID management

- **Attendance Management**
  - Check-in / Check-out functionality
  - Daily and weekly attendance views
  - Status tracking (Present, Absent, Half-day, Leave)
  - Admin can view all employees' attendance

- **Leave Management**
  - Apply for leave (employees)
  - Leave types: Paid, Sick, Unpaid
  - Approve / Reject leave requests (admin)
  - Auto-update attendance on approval

- **Payroll Management**
  - Read-only salary view for employees
  - Admin salary management
  - Monthly payroll records with deductions and net pay

- **Authentication & Authorization**
  - Secure login/signup
  - Role-based routing and access control
  - Employees can only see their own data
  - Admin/HR can see all employees

## Technologies

- Next.js 16 (App Router)
- React 19, TypeScript
- Tailwind CSS, Framer Motion
- better-sqlite3 (local database)
- bcryptjs (password hashing)
- sonner (toast notifications)

## Project structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── page.tsx            # Home page
│   ├── auth/               # Login/register pages
│   ├── dashboard/          # Employee dashboard
│   ├── employees/          # Employee directory (admin)
│   ├── attendance/         # Attendance management
│   ├── leave/              # Leave management
│   ├── payroll/            # Payroll management
│   └── admin/              # Admin dashboard and management
├── components/             # Reusable UI components
└── lib/                    # Utilities (db, auth, helpers)
```

## Getting started (local development)

**Prerequisites**

- Node.js 18+ and a package manager (`npm`, `yarn`, or `pnpm`).

**1. Install dependencies**

```bash
npm install
```

**2. Run the dev server**

```bash
npm run dev
```

**3. Open the app**

Visit `http://localhost:3000` in your browser.

## Environment variables

- `DATABASE_PATH` (optional): file path for the SQLite DB. Defaults to `data/dayflow.db`.
- `NEXT_PUBLIC_APP_URL`: public app URL (used by some UI links). Example: `http://localhost:3000`

## Scripts (package.json)

- `npm run dev` — start Next.js dev server
- `npm run build` — build for production
- `npm start` — run production server
- `npm run lint` — run eslint

## Database and data layer

The app uses **SQLite** (via `better-sqlite3`) with a schema initialized in `src/lib/db.ts`. On first run, the code creates/migrates tables for:

- **users** (employees and admins)
- **attendance** (daily attendance records)
- **leave_requests** (leave applications)
- **payroll** (monthly payroll records)
- **notifications** (system notifications)

## API routes

The app exposes API routes under `src/app/api/`:

- `/api/auth/*` — Authentication endpoints (login, logout, register, me)
- `/api/employees/*` — Employee management
- `/api/attendance/*` — Attendance tracking
- `/api/leave/*` — Leave management
- `/api/payroll/*` — Payroll management
- `/api/notifications/*` — Notifications

## Authentication & sessions

Authentication helpers live in `src/lib/auth.ts`:
- Password hashing: bcryptjs
- Cookie-based session helpers using Next.js `cookies()` API

Notes:
- Sessions are stored as a JSON cookie named `session`. In production you should use signed cookies or a server-side session store for stronger security.

## Access Control

- **Employees**: Can only view and edit their own profile, attendance, leave requests, and payroll (read-only)
- **Admin/HR**: Can view and manage all employees' data, approve/reject leave requests, manage payroll, and view all attendance records

## Development notes & recommendations

- For production, consider migrating to PostgreSQL for better concurrency and scalability
- Secure session cookies in production: sign/encrypt cookie contents or use a server session store (or adopt a library such as NextAuth)
- Add proper input validation and sanitization for production use
- Implement proper error logging and monitoring

## Troubleshooting

- If the app can't find the database, set `DATABASE_PATH` or create the `data/` directory and ensure file permissions allow writes from your user.
- If you encounter authentication issues, clear your browser cookies and try logging in again.

---
