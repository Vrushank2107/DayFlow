import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { database } from '@/lib/db';

// GET /api/employee/profile - Get current employee profile
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = database.prepare(`
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
      WHERE user_id = ?
    `).get(session.userId) as {
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

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      employeeId: user.employee_id,
      department: user.department,
      designation: user.designation,
      joiningDate: user.joining_date,
      userType: user.user_type,
      address: user.address,
      salary: user.salary,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT /api/employee/profile - Update current employee profile
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Employees can only update: name, phone, address
    const allowedFields = ['name', 'phone', 'address'];
    const updates: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    values.push(session.userId);

    database.prepare(`
      UPDATE users
      SET ${updates.join(', ')}
      WHERE user_id = ?
    `).run(...values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

