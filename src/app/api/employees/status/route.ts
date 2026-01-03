import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { database } from '@/lib/db';

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

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Fetch all employees' attendance status for today
    const attendanceStatuses = database.prepare(`
      SELECT 
        a.user_id as userId,
        a.status
      FROM attendance a
      WHERE a.date = ?
      AND a.user_id IN (SELECT user_id FROM users WHERE user_type = 'EMPLOYEE')
    `).all(today) as { userId: number; status: string }[];

    // Get employees on leave today
    const leaveStatuses = database.prepare(`
      SELECT 
        lr.user_id as userId,
        'Leave' as status
      FROM leave_requests lr
      WHERE lr.status = 'Approved'
      AND lr.start_date <= ?
      AND lr.end_date >= ?
      AND lr.user_id IN (SELECT user_id FROM users WHERE user_type = 'EMPLOYEE')
    `).all(today, today) as { userId: number; status: string }[];

    // Combine statuses (leave takes precedence over attendance)
    const statusMap = new Map<number, string>();
    
    // Add attendance statuses
    attendanceStatuses.forEach(({ userId, status }) => {
      statusMap.set(userId, status);
    });
    
    // Override with leave statuses
    leaveStatuses.forEach(({ userId, status }) => {
      statusMap.set(userId, status);
    });

    // Convert to array format
    const statuses = Array.from(statusMap.entries()).map(([userId, status]) => ({
      userId,
      status
    }));

    return NextResponse.json({
      statuses,
      total: statuses.length
    });
  } catch (error) {
    console.error('Error fetching employee statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee statuses' },
      { status: 500 }
    );
  }
}
