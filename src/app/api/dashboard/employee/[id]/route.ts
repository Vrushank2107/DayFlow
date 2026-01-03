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
    
    // Employees can only see their own data, admins and HR can see all
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

export async function PUT(
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

    if (session.userType !== 'ADMIN' && session.userType !== 'HR') {
      return NextResponse.json(
        { error: 'Admin or HR access only' },
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

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingUser = database.prepare(`
      SELECT user_id FROM users 
      WHERE email = ? AND user_id != ?
    `).get(body.email, employeeId);

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already taken by another user' },
        { status: 400 }
      );
    }

    // Update employee
    const result = database.prepare(`
      UPDATE users SET
        name = ?,
        email = ?,
        phone = ?,
        employee_id = ?,
        department = ?,
        designation = ?,
        joining_date = ?,
        address = ?,
        salary = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND user_type = 'EMPLOYEE'
    `).run(
      body.name,
      body.email,
      body.phone || null,
      body.employeeId || null,
      body.department || null,
      body.designation || null,
      body.joiningDate || null,
      body.address || null,
      body.salary ? parseFloat(body.salary) : null,
      employeeId
    );

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}
