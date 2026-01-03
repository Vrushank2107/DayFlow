"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { Calendar, Clock, DollarSign, FileText, User, Users } from "lucide-react";

type Employee = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  employeeId: string | null;
  department: string | null;
  designation: string | null;
  joiningDate: string | null;
  address: string | null;
  salary: number | null;
  createdAt: string;
};

function AdminDashboardView() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/employees");
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthGuard requireAuth requireAdmin>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Employee Dashboard</p>
          <h1 className="text-3xl font-semibold">
            Welcome back, {user?.name || "Admin"}!
          </h1>
          <p className="text-sm text-zinc-500">View and manage all employees.</p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {employees.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-zinc-400 mb-4" />
                  <p className="text-lg font-semibold mb-2">No employees found</p>
                  <p className="text-sm text-zinc-500">No employees have been registered yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {employees.map((employee) => (
                  <Card key={employee.id} className="hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        {/* Profile Picture Placeholder */}
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{employee.name}</h3>
                          {employee.designation && (
                            <p className="text-sm text-zinc-500">{employee.designation}</p>
                          )}
                          {employee.department && (
                            <p className="text-xs text-zinc-400">{employee.department}</p>
                          )}
                        </div>

                        <Button asChild variant="outline" className="w-full group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20">
                          <Link href={`/employees/${employee.id}`}>
                            View Profile
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}

export default function DashboardPage() {
  const { user, isEmployee, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    attendanceToday: null as 'Present' | 'Absent' | 'Half-day' | 'Leave' | null,
    leaveRequests: 0,
    pendingLeaves: 0,
    monthlySalary: null as number | null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch employee dashboard data
        const response = await fetch("/api/employee/dashboard");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (isEmployee) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [isEmployee]);

  if (isAdmin) {
    return <AdminDashboardView />;
  }

  return (
    <AuthGuard requireAuth>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Employee Dashboard</p>
          <h1 className="text-3xl font-semibold">
            Welcome back,{" "}
            <Link href="/profile/edit" className="text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300">
              {user?.name || "Employee"}
            </Link>
            !
          </h1>
          <p className="text-sm text-zinc-500">Manage your attendance, leave, and payroll information.</p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
                  <Clock className="h-5 w-5 text-indigo-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                    {stats.attendanceToday || "Not Set"}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Current attendance status</p>
                </CardContent>
              </Card>

              <Card className="group hover:border-amber-300 dark:hover:border-amber-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
                  <Calendar className="h-5 w-5 text-amber-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">{stats.leaveRequests}</div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Total leave requests</p>
                </CardContent>
              </Card>

              <Card className="group hover:border-green-300 dark:hover:border-green-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
                  <FileText className="h-5 w-5 text-green-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">{stats.pendingLeaves}</div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card className="group hover:border-purple-300 dark:hover:border-purple-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
                  <DollarSign className="h-5 w-5 text-purple-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400">
                    {stats.monthlySalary ? `$${stats.monthlySalary.toLocaleString()}` : "N/A"}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Current month</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader>
                  <CardTitle className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Profile</CardTitle>
                  <CardDescription>View and edit your profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/profile/me">
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader>
                  <CardTitle className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Attendance</CardTitle>
                  <CardDescription>View and manage your attendance records</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/attendance">
                      <Clock className="mr-2 h-4 w-4" />
                      View Attendance
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader>
                  <CardTitle className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Leave Management</CardTitle>
                  <CardDescription>Apply for leave or check your leave status</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/leave">
                      <Calendar className="mr-2 h-4 w-4" />
                      Manage Leave
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader>
                  <CardTitle className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Payroll</CardTitle>
                  <CardDescription>View your salary and payroll information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/payroll">
                      <DollarSign className="mr-2 h-4 w-4" />
                      View Payroll
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
