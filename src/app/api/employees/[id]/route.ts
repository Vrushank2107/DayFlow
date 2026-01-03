import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { database } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Handle both async and sync params for Next.js 16 compatibility
    const resolvedParams = params instanceof Promise ? await params : params;
    const employeeId = parseInt(resolvedParams.id);
    
    if (isNaN(employeeId)) {
      return NextResponse.json(
        { error: 'Invalid employee ID' },
        { status: 400 }
      );
    }
    
    // Employees can only see their own data, admins can see all
    if (session.userType === 'EMPLOYEE' && session.userId !== employeeId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const employee = database.prepare(`
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
      WHERE user_id = ? AND user_type = 'EMPLOYEE'
    `).get(employeeId) as {
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
    } | undefined;

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    // Handle both async and sync params for Next.js 16 compatibility
    const resolvedParams = params instanceof Promise ? await params : params;
    const employeeId = parseInt(resolvedParams.id);
    
    if (isNaN(employeeId)) {
      return NextResponse.json(
        { error: 'Invalid employee ID' },
        { status: 400 }
      );
    }

    // Check if employee exists
    const employee = database.prepare(`
      SELECT user_id FROM users
      WHERE user_id = ? AND user_type = 'EMPLOYEE'
    `).get(employeeId);

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Delete related records first (attendance, leave requests, payroll)
    database.prepare(`DELETE FROM attendance WHERE user_id = ?`).run(employeeId);
    database.prepare(`DELETE FROM leave_requests WHERE user_id = ?`).run(employeeId);
    database.prepare(`DELETE FROM payroll WHERE user_id = ?`).run(employeeId);
    database.prepare(`DELETE FROM notifications WHERE user_id = ?`).run(employeeId);
    database.prepare(`DELETE FROM salary_components WHERE user_id = ?`).run(employeeId);

    // Delete the employee
    const result = database.prepare(`
      DELETE FROM users WHERE user_id = ?
    `).run(employeeId);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Failed to delete employee' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
