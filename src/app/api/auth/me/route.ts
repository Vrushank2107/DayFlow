import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { database } from '@/lib/db';

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = database.prepare(`
      SELECT user_id, name, email, phone, user_type, created_at
      FROM users
      WHERE user_id = ?
    `).get(session.userId) as {
      user_id: number;
      name: string;
      email: string;
      phone: string | null;
      user_type: 'EMPLOYEE' | 'ADMIN';
      created_at: string;
    } | undefined;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.user_type,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
