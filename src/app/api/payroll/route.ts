import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { database } from '@/lib/db';

// GET /api/payroll - Get payroll records
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
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Employees can only see their own payroll, admins can see all
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
        payroll_id,
        user_id,
        month,
        year,
        salary_structure,
        deductions,
        net_pay,
        created_at,
        updated_at
      FROM payroll
      WHERE 1=1
    `;
    const params: unknown[] = [];

    // For admins, if no specific userId is provided, get all records
    if (session.userType !== 'ADMIN' || userId) {
      query += ' AND user_id = ?';
      params.push(targetUserId);
    }

    if (month) {
      query += ' AND month = ?';
      params.push(parseInt(month));
    }
    if (year) {
      query += ' AND year = ?';
      params.push(parseInt(year));
    }

    query += ' ORDER BY year DESC, month DESC LIMIT 12';

    const records = database.prepare(query).all(...params) as Array<{
      payroll_id: number;
      user_id: number;
      month: number;
      year: number;
      salary_structure: string | null;
      deductions: number;
      net_pay: number;
      created_at: string;
      updated_at: string;
    }>;

    return NextResponse.json({
      records: records.map(record => ({
        id: record.payroll_id,
        userId: record.user_id,
        month: record.month,
        year: record.year,
        salaryStructure: record.salary_structure,
        deductions: record.deductions,
        netPay: record.net_pay,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching payroll:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll' },
      { status: 500 }
    );
  }
}

// POST /api/payroll - Create payroll record (admin only)
export async function POST(request: Request) {
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

    const body = await request.json();
    const { userId, month, year, salaryStructure, deductions, netPay } = body;

    if (!userId || !month || !year || netPay === undefined) {
      return NextResponse.json(
        { error: 'User ID, month, year, and net pay are required' },
        { status: 400 }
      );
    }

    // Check if payroll already exists for this month/year
    const existing = database.prepare(`
      SELECT payroll_id FROM payroll
      WHERE user_id = ? AND month = ? AND year = ?
    `).get(userId, month, year);

    if (existing) {
      return NextResponse.json(
        { error: 'Payroll record already exists for this month/year' },
        { status: 409 }
      );
    }

    const result = database.prepare(`
      INSERT INTO payroll (user_id, month, year, salary_structure, deductions, net_pay)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      month,
      year,
      salaryStructure || null,
      deductions || 0,
      netPay
    );

    return NextResponse.json({
      success: true,
      payrollId: result.lastInsertRowid,
    });
  } catch (error) {
    console.error('Error creating payroll:', error);
    return NextResponse.json(
      { error: 'Failed to create payroll' },
      { status: 500 }
    );
  }
}

