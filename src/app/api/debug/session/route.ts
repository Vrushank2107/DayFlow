import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { database } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: 'No session found - please log in',
        loginUrl: 'http://localhost:3000/auth/login'
      });
    }

    // Get user details
    const user = database.prepare(`
      SELECT user_id, name, email, user_type, employee_id
      FROM users
      WHERE user_id = ?
    `).get(session.userId) as {
      user_id: number;
      name: string;
      email: string;
      user_type: string;
      employee_id: string | null;
    } | undefined;

    if (!user) {
      return NextResponse.json({
        authenticated: true,
        validUser: false,
        message: 'Session found but user not in database',
        session: session
      });
    }

    return NextResponse.json({
      authenticated: true,
      validUser: true,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        userType: user.user_type,
        employeeId: user.employee_id
      },
      session: session,
      isAdmin: user.user_type === 'ADMIN',
      isHR: user.user_type === 'HR',
      isEmployee: user.user_type === 'EMPLOYEE',
      canSeeCreateEmployee: user.user_type === 'ADMIN' || user.user_type === 'HR'
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
