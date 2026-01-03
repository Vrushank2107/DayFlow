import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    
    // Check if database has any employees
    const employees = db.prepare(`
      SELECT user_id, name, email, employee_id, user_type
      FROM users 
      WHERE user_type = 'EMPLOYEE'
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    return NextResponse.json({
      message: "Database check",
      totalEmployees: employees.length,
      employees: employees,
      databasePath: process.env.DATABASE_PATH || 'data/dayflow.db'
    });

  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
