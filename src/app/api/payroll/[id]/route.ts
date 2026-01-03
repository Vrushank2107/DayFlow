import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { database } from '@/lib/db';

// PUT /api/payroll/[id] - Update payroll record (admin only)
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
    const payrollId = parseInt(resolvedParams.id);
    const body = await request.json();
    const { salaryStructure, deductions, netPay } = body;

    const updates: string[] = [];
    const values: unknown[] = [];

    if (salaryStructure !== undefined) {
      updates.push('salary_structure = ?');
      values.push(salaryStructure);
    }
    if (deductions !== undefined) {
      updates.push('deductions = ?');
      values.push(deductions);
    }
    if (netPay !== undefined) {
      updates.push('net_pay = ?');
      values.push(netPay);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(payrollId);

    database.prepare(`
      UPDATE payroll
      SET ${updates.join(', ')}
      WHERE payroll_id = ?
    `).run(...values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating payroll:', error);
    return NextResponse.json(
      { error: 'Failed to update payroll' },
      { status: 500 }
    );
  }
}

