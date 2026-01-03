import { NextResponse } from 'next/server';
import { database } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, employeeId, userType } = body;

    if (!name || !email || !password || !userType) {
      return NextResponse.json(
        { error: 'Name, email, password, and user type are required' },
        { status: 400 }
      );
    }

    if (userType !== 'EMPLOYEE' && userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Invalid user type. Must be EMPLOYEE or ADMIN' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = database.prepare(`
      SELECT user_id FROM users WHERE email = ?
    `).get(email) as { user_id: number } | undefined;

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Handle employee ID
    let finalEmployeeId: string | null = null;
    if (userType === 'EMPLOYEE') {
      if (employeeId && employeeId.trim()) {
        // Check if employee ID already exists
        const existing = database.prepare(`
          SELECT user_id FROM users WHERE employee_id = ?
        `).get(employeeId.trim()) as { user_id: number } | undefined;
        
        if (existing) {
          return NextResponse.json(
            { error: 'Employee ID already exists' },
            { status: 409 }
          );
        }
        finalEmployeeId = employeeId.trim();
      } else {
        // Generate a simple employee ID (e.g., EMP001, EMP002, etc.)
        const count = database.prepare(`
          SELECT COUNT(*) as count FROM users WHERE user_type = 'EMPLOYEE'
        `).get() as { count: number };
        finalEmployeeId = `EMP${String(count.count + 1).padStart(3, '0')}`;
      }
    }

    // Insert user
    const result = database.prepare(`
      INSERT INTO users (name, email, password, phone, user_type, employee_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, email, hashedPassword, phone || null, userType, finalEmployeeId);

    // Create session
    await createSession(result.lastInsertRowid as number, userType);

    return NextResponse.json({
      success: true,
      user: {
        id: result.lastInsertRowid,
        name,
        email,
        userType,
        employeeId: finalEmployeeId,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register. Please try again.' },
      { status: 500 }
    );
  }
}

