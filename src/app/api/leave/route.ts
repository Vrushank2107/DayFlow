import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { database } from '@/lib/db';

// GET /api/leave - Get leave requests
export async function GET(request: Request) {
  try {
    console.log('GET /api/leave - Starting request');
    const session = await getSession();
    console.log('Session:', session);
    
    if (!session) {
      console.log('No session found');
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

    let query = `
      SELECT 
        leave_requests.leave_id,
        leave_requests.user_id,
        leave_requests.leave_type,
        leave_requests.start_date,
        leave_requests.end_date,
        leave_requests.reason,
        leave_requests.status,
        leave_requests.admin_comment,
        leave_requests.created_at,
        leave_requests.updated_at,
        users.name as employeeName,
        users.email as employeeEmail
      FROM leave_requests
      LEFT JOIN users ON leave_requests.user_id = users.user_id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    // For admins, if no specific userId is provided, get all records
    if (session.userType !== 'ADMIN' || userId) {
      query += ' AND leave_requests.user_id = ?';
      params.push(targetUserId);
    }

    query += ' ORDER BY leave_requests.created_at DESC';

    const records = database.prepare(query).all(...params) as Array<{
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
      employeeName: string;
      employeeEmail: string;
    }>;

    return NextResponse.json({
      leaves: records.map((leave: any) => ({
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
        employeeName: leave.employeeName,
        employeeEmail: leave.employeeEmail,
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
    console.log('POST /api/leave - Starting request');
    const session = await getSession();
    console.log('Session:', session);
    
    if (!session) {
      console.log('No session found');
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

    // Check for overlapping leave requests
    const overlapping = database.prepare(`
      SELECT leave_id FROM leave_requests
      WHERE user_id = ? AND status = 'Approved'
      AND (
        (start_date <= ? AND end_date >= ?) OR
        (start_date <= ? AND end_date >= ?) OR
        (start_date >= ? AND end_date <= ?)
      )
    `).get(
      session.userId, startDate, startDate,
      endDate, endDate,
      startDate, endDate
    );

    if (overlapping) {
      return NextResponse.json(
        { error: 'You already have approved leave during this period' },
        { status: 400 }
      );
    }

    // Check minimum notice period (2 days for paid leave, 1 day for sick leave)
    const start = new Date(startDate);
    const today = new Date();
    const daysDiff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (leaveType === 'Paid' && daysDiff < 2) {
      return NextResponse.json(
        { error: 'Paid leave requires at least 2 days notice' },
        { status: 400 }
      );
    }

    if (leaveType === 'Sick' && daysDiff < 1) {
      return NextResponse.json(
        { error: 'Sick leave requires at least 1 day notice (except emergencies)' },
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

