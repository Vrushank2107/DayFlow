import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { database } from '@/lib/db';

// GET /api/attendance - Get attendance records
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Employees can only see their own attendance, admins can see all
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
        attendance_id,
        user_id,
        date,
        check_in,
        check_out,
        status,
        created_at,
        updated_at
      FROM attendance
      WHERE user_id = ?
    `;
    const params: unknown[] = [targetUserId];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY date DESC LIMIT 100';

    const records = database.prepare(query).all(...params) as Array<{
      attendance_id: number;
      user_id: number;
      date: string;
      check_in: string | null;
      check_out: string | null;
      status: string;
      created_at: string;
      updated_at: string;
    }>;

    return NextResponse.json({
      records: records.map(record => ({
        id: record.attendance_id,
        userId: record.user_id,
        date: record.date,
        checkIn: record.check_in,
        checkOut: record.check_out,
        status: record.status,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

// POST /api/attendance - Check in or check out
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
        { error: 'Only employees can check in/out' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body; // 'checkin' or 'checkout'
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Check if attendance record exists for today
    const existing = database.prepare(`
      SELECT attendance_id, check_in, check_out FROM attendance
      WHERE user_id = ? AND date = ?
    `).get(session.userId, today) as {
      attendance_id: number;
      check_in: string | null;
      check_out: string | null;
    } | undefined;

    if (action === 'checkin') {
      if (existing) {
        if (existing.check_in) {
          return NextResponse.json(
            { error: 'Already checked in today' },
            { status: 400 }
          );
        }
        // Update existing record
        database.prepare(`
          UPDATE attendance
          SET check_in = ?, status = 'Present', updated_at = ?
          WHERE attendance_id = ?
        `).run(now, now, existing.attendance_id);
      } else {
        // Create new record
        database.prepare(`
          INSERT INTO attendance (user_id, date, check_in, status, updated_at)
          VALUES (?, ?, ?, 'Present', ?)
        `).run(session.userId, today, now, now);
      }
    } else if (action === 'checkout') {
      if (!existing || !existing.check_in) {
        return NextResponse.json(
          { error: 'Please check in first' },
          { status: 400 }
        );
      }
      if (existing.check_out) {
        return NextResponse.json(
          { error: 'Already checked out today' },
          { status: 400 }
        );
      }
      database.prepare(`
        UPDATE attendance
        SET check_out = ?, updated_at = ?
        WHERE attendance_id = ?
      `).run(now, now, existing.attendance_id);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "checkin" or "checkout"' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    );
  }
}

