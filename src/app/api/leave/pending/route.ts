import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { database } from '@/lib/db';

// GET /api/leave/pending - Get all pending leave requests (admin only)
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

    const leaves = database.prepare(`
      SELECT 
        l.leave_id,
        l.user_id,
        l.leave_type,
        l.start_date,
        l.end_date,
        l.reason,
        l.status,
        l.admin_comment,
        l.created_at,
        l.updated_at,
        u.name as user_name,
        u.email as user_email,
        u.employee_id
      FROM leave_requests l
      JOIN users u ON l.user_id = u.user_id
      WHERE l.status = 'Pending'
      ORDER BY l.created_at DESC
    `).all() as Array<{
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
      user_name: string;
      user_email: string;
      employee_id: string | null;
    }>;

    return NextResponse.json({
      leaves: leaves.map(leave => ({
        id: leave.leave_id,
        userId: leave.user_id,
        userName: leave.user_name,
        userEmail: leave.user_email,
        employeeId: leave.employee_id,
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
    console.error('Error fetching pending leaves:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending leave requests' },
      { status: 500 }
    );
  }
}

