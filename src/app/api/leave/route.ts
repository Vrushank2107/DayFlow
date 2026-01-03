import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { database } from '@/lib/db';

// GET /api/leave - Get leave requests
export async function GET(request: Request) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Employees can only see their own leaves, admins can see all
    const targetUserId = userId && session.userType === 'ADMIN' 
      ? parseInt(userId) 
      : session.userId;

    if (session.userType === 'EMPLOYEE' && userId && parseInt(userId) !== session.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const leaves = database.prepare(`
      SELECT 
        leave_id,
        user_id,
        leave_type,
        start_date,
        end_date,
        reason,
        status,
        admin_comment,
        created_at,
        updated_at
      FROM leave_requests
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(targetUserId) as Array<{
      leave_id: number;
      user_id: number;
      leave_type: string;
      start_date: string;
      end_date: string;
      reason: string | null;
      status: string;
      admin_comment: string | null;
      created_at: string;
      updated_at: string;
    }>;

    return NextResponse.json({
      leaves: leaves.map(leave => ({
        id: leave.leave_id,
        userId: leave.user_id,
        leaveType: leave.leave_type,
        startDate: leave.start_date,
        endDate: leave.end_date,
        reason: leave.reason,
        status: leave.status,
        adminComment: leave.admin_comment,
        createdAt: leave.created_at,
        updatedAt: leave.updated_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leave requests' },
      { status: 500 }
    );
  }
}

// POST /api/leave - Create leave request (employees only)
export async function POST(request: Request) {
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
        { error: 'Only employees can create leave requests' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { leaveType, startDate, endDate, reason } = body;

    if (!leaveType || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Leave type, start date, and end date are required' },
        { status: 400 }
      );
    }

    if (!['Paid', 'Sick', 'Unpaid'].includes(leaveType)) {
      return NextResponse.json(
        { error: 'Invalid leave type' },
        { status: 400 }
      );
    }

    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    const result = database.prepare(`
      INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `).run(session.userId, leaveType, startDate, endDate, reason || null);

    return NextResponse.json({
      success: true,
      leaveId: result.lastInsertRowid,
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json(
      { error: 'Failed to create leave request' },
      { status: 500 }
    );
  }
}

