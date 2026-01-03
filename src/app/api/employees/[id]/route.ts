import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { database } from '@/lib/db';

// GET /api/employees/[id] - Get employee details
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
      WHERE user_id = ? AND user_type = 'EMPLOYEE'
    `).get(employeeId) as {
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
    } | undefined;

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: employee.user_id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      employeeId: employee.employee_id,
      department: employee.department,
      designation: employee.designation,
      joiningDate: employee.joining_date,
      address: employee.address,
      salary: employee.salary,
      createdAt: employee.created_at,
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

// PUT /api/employees/[id] - Update employee (admin can update all fields, employee can update limited fields)
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
    
    // Employees can only update their own profile (limited fields)
    if (session.userType === 'EMPLOYEE' && session.userId !== employeeId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Admin can update all fields, employee can only update: name, phone
    // Map camelCase frontend fields to snake_case database fields
    const fieldMapping: Record<string, string> = {
      name: 'name',
      phone: 'phone',
      department: 'department',
      designation: 'designation',
      joiningDate: 'joining_date',
      address: 'address',
    };

    const allowedFields = session.userType === 'ADMIN' 
      ? ['name', 'phone', 'department', 'designation', 'joiningDate', 'address']
      : ['name', 'phone'];

    const updates: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key) && value !== undefined) {
        const dbField = fieldMapping[key];
        if (dbField) {
          updates.push(`${dbField} = ?`);
          values.push(value);
        }
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    values.push(employeeId);

    database.prepare(`
      UPDATE users
      SET ${updates.join(', ')}
      WHERE user_id = ?
    `).run(...values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

