import { NextResponse } from 'next/server';
import { database } from '@/lib/db';

export async function GET() {
  try {
    // Check if there are any users in the database
    const users = database.prepare(`
      SELECT user_id, name, email, employee_id, user_type 
      FROM users 
      LIMIT 5
    `).all();
    
    return NextResponse.json({
      users: users,
      message: users.length > 0 
        ? `Found ${users.length} users. You can log in with any of these emails.` 
        : 'No users found. Please create an employee account first.',
      loginUrl: 'http://localhost:3000/auth/login',
      createEmployeeUrl: 'http://localhost:3000/admin/employees/create'
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
