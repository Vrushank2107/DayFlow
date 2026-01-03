import { NextResponse } from 'next/server';
import { database } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';

// Generate Login ID: [Company][First2LettersFirstName][First2LettersLastName][Year][Serial]
function generateLoginId(companyName: string, firstName: string, lastName: string, joiningYear: number, serialNumber: number): string {
  const companyInitials = companyName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
    .padEnd(2, 'X');
  
  const namePart = (
    firstName.substring(0, 2).toUpperCase() +
    lastName.substring(0, 2).toUpperCase()
  ).padEnd(4, 'X');
  
  const yearPart = joiningYear.toString();
  const serialPart = String(serialNumber).padStart(4, '0');
  
  return `${companyInitials}${namePart}${yearPart}${serialPart}`;
}

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

    if (userType !== 'EMPLOYEE' && userType !== 'ADMIN' && userType !== 'HR') {
      return NextResponse.json(
        { error: 'Invalid user type. Must be EMPLOYEE, ADMIN, or HR' },
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

    // Handle employee ID / Login ID generation
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
        // Auto-generate Login ID in format: [Company][Name][Year][Serial]
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';
        const joiningYear = new Date().getFullYear();
        const company = 'DF'; // Default to 'DF' for Dayflow
        
        // Get serial number for this year
        const yearEmployees = database.prepare(`
          SELECT COUNT(*) as count FROM users 
          WHERE user_type = 'EMPLOYEE' 
          AND strftime('%Y', joining_date) = ? OR (joining_date IS NULL AND strftime('%Y', created_at) = ?)
        `).get(joiningYear.toString(), joiningYear.toString()) as { count: number } | undefined;
        
        const serialNumber = (yearEmployees?.count || 0) + 1;
        finalEmployeeId = generateLoginId(company, firstName, lastName, joiningYear, serialNumber);
        
        // Ensure uniqueness
        let attempts = 0;
        while (attempts < 10) {
          const existing = database.prepare(`
            SELECT user_id FROM users WHERE employee_id = ?
          `).get(finalEmployeeId) as { user_id: number } | undefined;
          
          if (!existing) break;
          
          const newSerial = serialNumber + attempts + 1;
          finalEmployeeId = generateLoginId(company, firstName, lastName, joiningYear, newSerial);
          attempts++;
        }
      }
    }

    // Insert user
    const joiningDate = new Date().toISOString().split('T')[0];
    const result = database.prepare(`
      INSERT INTO users (name, email, password, phone, user_type, employee_id, joining_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, 
      email, 
      hashedPassword, 
      phone || null, 
      userType, 
      finalEmployeeId,
      joiningDate
    );

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
      redirectUrl: userType === 'ADMIN' ? '/admin' : '/dashboard',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register. Please try again.' },
      { status: 500 }
    );
  }
}

