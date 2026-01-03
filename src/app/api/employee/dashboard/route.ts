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

    if (session.userType !== 'EMPLOYEE') {
      return NextResponse.json(
        { error: 'Employee access only' },
        { status: 403 }
      );
    }

    // Get today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = database.prepare(`
      SELECT status FROM attendance
      WHERE user_id = ? AND date = ?
    `).get(session.userId, today) as { status: string } | undefined;

    // Get leave request counts
    const leaveStats = database.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending
      FROM leave_requests
      WHERE user_id = ?
    `).get(session.userId) as { total: number; pending: number };

    // Get current month salary
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const payroll = database.prepare(`
      SELECT net_pay FROM payroll
      WHERE user_id = ? AND month = ? AND year = ?
    `).get(session.userId, currentMonth, currentYear) as { net_pay: number } | undefined;

    return NextResponse.json({
      attendanceToday: todayAttendance?.status || null,
      leaveRequests: leaveStats.total || 0,
      pendingLeaves: leaveStats.pending || 0,
      monthlySalary: payroll?.net_pay || null,
    });
  } catch (error) {
    console.error('Error fetching employee dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

