import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const employeeId = parseInt(params.id);

    // Fetch employee by ID
    const employee = db.prepare(`
      SELECT 
        user_id as id,
        name,
        email,
        phone,
        employee_id,
        department,
        designation,
        joining_date,
        address,
        salary,
        created_at as createdAt
      FROM users 
      WHERE user_id = ? AND user_type = 'EMPLOYEE'
    `).get(employeeId);

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        employeeId: employee.employee_id,
        department: employee.department,
        designation: employee.designation,
        joiningDate: employee.joining_date,
        address: employee.address,
        salary: employee.salary,
        createdAt: employee.createdAt,
      }
    });

  } catch (error) {
    console.error("Error fetching employee profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}