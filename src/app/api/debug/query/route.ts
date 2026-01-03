import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    
    // Test the exact query with ID 3
    console.log('Testing query for ID 3...');
    
    const testQuery = db.prepare(`
      SELECT 
        user_id,
        name,
        email,
        user_type,
        employee_id
      FROM users 
      WHERE user_id = ?
    `).get(3);
    
    console.log('Test query result:', testQuery);
    
    // Test if user_type is exactly 'EMPLOYEE'
    const employeeQuery = db.prepare(`
      SELECT 
        user_id,
        name,
        email,
        user_type,
        employee_id
      FROM users 
      WHERE user_id = ? AND user_type = 'EMPLOYEE'
    `).get(3);
    
    console.log('Employee query result:', employeeQuery);
    
    // Test all users with their types
    const allUsers = db.prepare(`
      SELECT 
        user_id,
        name,
        email,
        user_type
      FROM users 
    `).all();
    
    return NextResponse.json({
      testQuery,
      employeeQuery,
      allUsers,
      message: "Debug query test"
    });

  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
