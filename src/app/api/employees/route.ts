import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { database } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is ADMIN or HR (unified access)
    if (session.userType !== 'ADMIN' && session.userType !== 'HR') {
      return NextResponse.json(
        { error: 'Admin/HR access only' },
        { status: 403 }
      );
    }

    // Fetch all employees
    const employees = database.prepare(`
      SELECT 
        user_id as id,
        name,
        email,
        phone,
        employee_id as employeeId,
        department,
        designation,
        joining_date as joiningDate,
        address,
        salary,
        created_at as createdAt
      FROM users
      WHERE user_type = 'EMPLOYEE'
      ORDER BY created_at DESC
    `).all() as {
      id: number;
      name: string;
      email: string;
      phone: string | null;
      employeeId: string | null;
      department: string | null;
      designation: string | null;
      joiningDate: string | null;
      address: string | null;
      salary: number | null;
      createdAt: string;
    }[];

    return NextResponse.json({
      employees,
      total: employees.length
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}
