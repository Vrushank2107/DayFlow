import { NextResponse } from 'next/server';
import { database } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { generateLoginId, generateSystemPassword, extractNameParts } from '@/lib/utils/auth-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, name, email, phone, department, position, joiningDate } = body;

    if (!companyName || !name || !email || !joiningDate) {
      return NextResponse.json(
        { error: 'Company name, employee name, email, and joining date are required' },
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

    // Generate Login ID
    const { firstName, lastName } = extractNameParts(name);
    const joiningYear = new Date(joiningDate).getFullYear();
    
    // Get serial number for this year
    const yearEmployees = database.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE user_type = 'EMPLOYEE' 
      AND strftime('%Y', joining_date) = ?
    `).get(joiningYear.toString()) as { count: number } | undefined;
    
    const serialNumber = (yearEmployees?.count || 0) + 1;
    const employeeLoginId = generateLoginId(companyName, firstName, lastName, joiningYear, serialNumber);
    
    // Ensure uniqueness
    let finalLoginId = employeeLoginId;
    let attempts = 0;
    while (attempts < 10) {
      const existing = database.prepare(`
        SELECT user_id FROM users WHERE employee_id = ?
      `).get(finalLoginId) as { user_id: number } | undefined;
      
      if (!existing) break;
      
      const newSerial = serialNumber + attempts + 1;
      finalLoginId = generateLoginId(companyName, firstName, lastName, joiningYear, newSerial);
      attempts++;
    }

    // Generate system password
    const systemPassword = generateSystemPassword();
    const hashedPassword = await hashPassword(systemPassword);

    // Insert user
    const result = database.prepare(`
      INSERT INTO users (name, email, password, phone, user_type, employee_id, joining_date, department, designation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, 
      email, 
      hashedPassword, 
      phone || null, 
      'EMPLOYEE', 
      finalLoginId,
      joiningDate,
      department || null,
      position || null
    );

    return NextResponse.json({
      success: true,
      employee: {
        id: result.lastInsertRowid,
        name,
        email,
        employeeId: finalLoginId,
        systemPassword,
        department,
        position,
        joiningDate,
      },
    });
  } catch (error) {
    console.error('Employee creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create employee. Please try again.' },
      { status: 500 }
    );
  }
}
