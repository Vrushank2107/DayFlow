import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'dayflow.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database connection
let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL'); // Enable WAL mode for better concurrency
    initializeSchema();
  }
  return db;
}

// Initialize database schema
function initializeSchema() {
  const database = db!;
  
  // Enable foreign keys
  database.pragma('foreign_keys = ON');

  // Create users table (now employees)
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      phone TEXT,
      user_type TEXT NOT NULL CHECK(user_type IN ('EMPLOYEE', 'ADMIN', 'HR')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      employee_id TEXT UNIQUE,
      department TEXT,
      designation TEXT,
      joining_date DATE,
      salary REAL,
      address TEXT
    )
  `);

  // Migrate existing user_type values if needed
  try {
    database.exec(`UPDATE users SET user_type = 'EMPLOYEE' WHERE user_type = 'CANDIDATE'`);
    database.exec(`UPDATE users SET user_type = 'ADMIN' WHERE user_type = 'SME'`);
  } catch {
    // Ignore if column doesn't exist yet
  }

  // Simple migration for HR support - just update the constraint if needed
  try {
    // Check if HR is already supported by trying to insert a test value
    database.exec(`BEGIN TRANSACTION`);
    const stmt = database.prepare(`INSERT OR ROLLBACK INTO users (name, email, user_type) VALUES ('test', 'test@test.com', 'HR')`);
    try {
      stmt.run();
      database.exec(`DELETE FROM users WHERE email = 'test@test.com'`);
    } catch {
      // If HR is not supported, we need to recreate the table
      database.exec(`ROLLBACK`);
      
      // Create new table with HR support
      database.exec(`
        CREATE TABLE IF NOT EXISTS users_new (
          user_id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT,
          phone TEXT,
          user_type TEXT NOT NULL CHECK(user_type IN ('EMPLOYEE', 'ADMIN', 'HR')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          employee_id TEXT UNIQUE,
          department TEXT,
          designation TEXT,
          joining_date DATE,
          salary REAL,
          address TEXT
        )
      `);
      
      // Copy data from old table
      database.exec(`
        INSERT INTO users_new (user_id, name, email, password, phone, user_type, created_at, employee_id, department, designation, joining_date, salary, address)
        SELECT user_id, name, email, password, phone, user_type, created_at, employee_id, department, designation, joining_date, salary, address
        FROM users
      `);
      
      // Drop old table and rename new one
      database.exec(`DROP TABLE users`);
      database.exec(`ALTER TABLE users_new RENAME TO users`);
    }
    database.exec(`COMMIT`);
  } catch {
    // Ignore any errors during migration
  }

  // Add employee columns if they don't exist
  try {
    database.exec(`ALTER TABLE users ADD COLUMN employee_id TEXT UNIQUE`);
  } catch {
    // Column already exists
  }
  try {
    database.exec(`ALTER TABLE users ADD COLUMN department TEXT`);
  } catch {
    // Column already exists
  }
  try {
    database.exec(`ALTER TABLE users ADD COLUMN designation TEXT`);
  } catch {
    // Column already exists
  }
  try {
    database.exec(`ALTER TABLE users ADD COLUMN joining_date DATE`);
  } catch {
    // Column already exists
  }
  try {
    database.exec(`ALTER TABLE users ADD COLUMN salary REAL`);
  } catch {
    // Column already exists
  }
  try {
    database.exec(`ALTER TABLE users ADD COLUMN address TEXT`);
  } catch {
    // Column already exists
  }

  // Create salary_components table
  database.exec(`
    CREATE TABLE IF NOT EXISTS salary_components (
      component_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      component_name TEXT NOT NULL,
      component_type TEXT NOT NULL CHECK(component_type IN ('Basic', 'HRA', 'Standard Allowance', 'Performance Bonus', 'LTA', 'Fixed Allowance')),
      computation_type TEXT NOT NULL CHECK(computation_type IN ('Fixed Amount', 'Percentage of Wage', 'Percentage of Basic')),
      value REAL NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  // Create company_settings table
  database.exec(`
    CREATE TABLE IF NOT EXISTS company_settings (
      setting_id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      company_logo TEXT,
      pf_rate REAL DEFAULT 12.0,
      professional_tax REAL DEFAULT 200.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create attendance table
  database.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date DATE NOT NULL,
      check_in DATETIME,
      check_out DATETIME,
      status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Half-day', 'Leave')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    )
  `);

  // Create leave_requests table
  database.exec(`
    CREATE TABLE IF NOT EXISTS leave_requests (
      leave_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      leave_type TEXT NOT NULL CHECK(leave_type IN ('Paid', 'Sick', 'Unpaid')),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected')),
      admin_comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  // Create payroll table
  database.exec(`
    CREATE TABLE IF NOT EXISTS payroll (
      payroll_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      month INTEGER NOT NULL CHECK(month >= 1 AND month <= 12),
      year INTEGER NOT NULL,
      salary_structure TEXT,
      deductions REAL DEFAULT 0,
      net_pay REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      UNIQUE(user_id, month, year)
    )
  `);

  // Create notifications table (simplified for HRMS)
  database.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('LEAVE_UPDATE', 'ATTENDANCE_REMINDER', 'PAYROLL_UPDATE', 'SYSTEM')),
      title TEXT NOT NULL,
      message TEXT,
      link TEXT,
      read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
    CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
    CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON leave_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
    CREATE INDEX IF NOT EXISTS idx_payroll_user_id ON payroll(user_id);
    CREATE INDEX IF NOT EXISTS idx_payroll_month_year ON payroll(month, year);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
  `);
}

// Export database instance
export const database = getDb();
export { getDb };

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const db = getDb();
    db.prepare('SELECT 1').get();
    return true;
  } catch (error) {
    console.error('[db] Connection test failed:', error);
    return false;
  }
}


// Type definitions for database models
export interface User {
  user_id: number;
  name: string;
  email: string;
  password: string | null;
  phone: string | null;
  user_type: 'EMPLOYEE' | 'ADMIN';
  created_at: string;
  employee_id: string | null;
  department: string | null;
  designation: string | null;
  joining_date: string | null;
  salary: number | null;
  address: string | null;
}

export interface Attendance {
  attendance_id: number;
  user_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'Present' | 'Absent' | 'Half-day' | 'Leave';
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  leave_id: number;
  user_id: number;
  leave_type: 'Paid' | 'Sick' | 'Unpaid';
  start_date: string;
  end_date: string;
  reason: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  admin_comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payroll {
  payroll_id: number;
  user_id: number;
  month: number;
  year: number;
  salary_structure: string | null;
  deductions: number;
  net_pay: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  notification_id: number;
  user_id: number;
  type: 'LEAVE_UPDATE' | 'ATTENDANCE_REMINDER' | 'PAYROLL_UPDATE' | 'SYSTEM';
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}
