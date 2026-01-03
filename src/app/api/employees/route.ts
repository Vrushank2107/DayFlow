import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { database } from '@/lib/db';

// GET /api/employees - List all employees (admin only)
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (session.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access only' },
        { status: 403 }
      );
    }

    const employees = database.prepare(`
      SELECT 
        user_id,
        name,
        email,
        phone,
        employee_id,
        department,
        designation,
        joining_date,
        user_type,
        address,
        salary,
        created_at
      FROM users
      WHERE user_type = 'EMPLOYEE'
      ORDER BY name
    `).all() as Array<{
      user_id: number;
      name: string;
      email: string;
      phone: string | null;
      employee_id: string | null;
      department: string | null;
      designation: string | null;
      joining_date: string | null;
      user_type: string;
      address: string | null;
      salary: number | null;
      created_at: string;
    }>;

    return NextResponse.json({
      employees: employees.map(emp => ({
        id: emp.user_id,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        employeeId: emp.employee_id,
        department: emp.department,
        designation: emp.designation,
        joiningDate: emp.joining_date,
        address: emp.address,
        salary: emp.salary,
        createdAt: emp.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

