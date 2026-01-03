import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { database } from "@/lib/db";

interface UserRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  employee_id: string | null;
  department: string | null;
  designation: string | null;
  joining_date: string | null;
  address: string | null;
  salary: number | null;
  user_type: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch current user's profile
    const user = database.prepare(`
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
        user_type,
        created_at as createdAt
      FROM users 
      WHERE user_id = ?
    `).get(session.userId) as UserRow | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      employeeId: user.employee_id,
      department: user.department,
      designation: user.designation,
      joiningDate: user.joining_date,
      address: user.address,
      salary: user.salary,
      userType: user.user_type,
      createdAt: user.created_at,
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
