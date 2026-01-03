import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { database } from '@/lib/db';

// PUT /api/leave/[id] - Update leave request (approve/reject by admin)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    // Handle both async and sync params for Next.js 16 compatibility
    const resolvedParams = params instanceof Promise ? await params : params;
    const leaveId = parseInt(resolvedParams.id);
    const body = await request.json();
    const { status, adminComment } = body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status (Approved/Rejected) is required' },
        { status: 400 }
      );
    }

    // Get leave request details
    const leave = database.prepare(`
      SELECT user_id, start_date, end_date FROM leave_requests
      WHERE leave_id = ?
    `).get(leaveId) as {
      user_id: number;
      start_date: string;
      end_date: string;
    } | undefined;

    if (!leave) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }

    // Update leave request
    database.prepare(`
      UPDATE leave_requests
      SET status = ?, admin_comment = ?, updated_at = CURRENT_TIMESTAMP
      WHERE leave_id = ?
    `).run(status, adminComment || null, leaveId);

    // If approved, update attendance records
    if (status === 'Approved') {
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);
      
      // Update attendance for each day in the leave period
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        // Check if attendance record exists
        const existing = database.prepare(`
          SELECT attendance_id FROM attendance
          WHERE user_id = ? AND date = ?
        `).get(leave.user_id, dateStr);

        if (existing) {
          // Update existing record
          database.prepare(`
            UPDATE attendance
            SET status = 'Leave', updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ? AND date = ?
          `).run(leave.user_id, dateStr);
        } else {
          // Create new record
          database.prepare(`
            INSERT INTO attendance (user_id, date, status)
            VALUES (?, ?, 'Leave')
          `).run(leave.user_id, dateStr);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating leave request:', error);
    return NextResponse.json(
      { error: 'Failed to update leave request' },
      { status: 500 }
    );
  }
}

