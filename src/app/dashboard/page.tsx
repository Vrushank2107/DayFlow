"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { Calendar, Clock, DollarSign, FileText, User, Users, Plus } from "lucide-react";

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

export default function DashboardPage() {
  const { user, isEmployee, isAdmin, isHR } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    attendanceToday: null as 'Present' | 'Absent' | 'Half-day' | 'Leave' | null,
    leaveRequests: 0,
    pendingLeaves: 0,
    monthlySalary: null as number | null,
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeStatuses, setEmployeeStatuses] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Redirect HR users to unified admin dashboard
  useEffect(() => {
    if (isHR && !isLoading) {
      router.push('/admin');
      return;
    }
  }, [isHR, isLoading, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        if (isAdmin && !isHR) {
          // Fetch admin data
          const [employeesResponse, statusesResponse] = await Promise.all([
            fetch("/api/employees"),
            fetch("/api/employees/status")
          ]);
          
          if (employeesResponse.ok) {
            const data = await employeesResponse.json();
            setEmployees(data.employees || []);
          }
          
          if (statusesResponse.ok) {
            const data = await statusesResponse.json();
            setEmployeeStatuses(data.statuses || {});
          }
        } else if (isEmployee && !isHR) {
          // Fetch employee data
          const response = await fetch("/api/employee/profile");
          
          if (response.ok) {
            const data = await response.json();
            // Set employee-specific stats
            setStats({
              attendanceToday: null, // You might want to fetch this separately
              leaveRequests: 0,
              pendingLeaves: 0,
              monthlySalary: data.salary || null,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    // Don't fetch data if HR user (they will be redirected)
    if (!isHR) {
      fetchData();
    }
  }, [isAdmin, isEmployee, isHR]);

  function getStatusIndicator(status: string | undefined) {
    if (!status) return null;
    
    switch (status) {
      case 'Present':
        return (
          <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-zinc-900" title="Present" />
        );
      case 'Leave':
        return (
          <div className="absolute top-2 right-2" title="On Leave">
            <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        );
      case 'Absent':
        return (
          <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-yellow-500 border-2 border-white dark:border-zinc-900" title="Absent" />
        );
      default:
        return null;
    }
  }

  // Admin Dashboard View - Shows all employees (not for HR users)
  if (isAdmin && !isHR) {
    return (
      <AuthGuard requireAuth>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Employee Management</p>
                <h1 className="text-3xl font-semibold">
                  Welcome back, {user?.name || "Admin"}!
                </h1>
                <p className="text-sm text-zinc-500">View and manage all employees.</p>
              </div>
              <Button asChild className="flex items-center gap-2">
                <Link href="/admin/hr/employees/create">
                  <Plus className="h-4 w-4" />
                  Create Employee
                </Link>
              </Button>
            </div>
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
                    <p className="text-sm text-zinc-500 mb-6">No employees have been registered yet.</p>
                    <Button asChild className="flex items-center gap-2">
                      <Link href="/admin/hr/employees/create">
                        <Plus className="h-4 w-4" />
                        Create Your First Employee
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {employees.map((employee) => (
                    <Card key={employee.id} className="hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer group relative">
                      <CardContent className="p-6">
                        {getStatusIndicator(employeeStatuses[employee.id])}
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
                            <Link href={`/dashboard/employee/${employee.id}`}>
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

  // Employee Dashboard View - Shows personal stats and actions
  return (
    <AuthGuard requireAuth>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Employee Overview</p>
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
                    {stats.monthlySalary ? `₹${stats.monthlySalary.toLocaleString()}` : "N/A"}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Current month</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions - Dashboard Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
                    <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle className="text-lg">Profile</CardTitle>
                  <CardDescription>View and edit your profile information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/profile/me">
                      View Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:border-green-300 dark:hover:border-green-700 transition-all duration-200 hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                    <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg">Attendance</CardTitle>
                  <CardDescription>View and manage your attendance records</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/attendance">
                      View Attendance
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200 hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                    <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <CardTitle className="text-lg">Leave Management</CardTitle>
                  <CardDescription>Apply for leave or check your leave status</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/leave">
                      Manage Leave
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                    <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-lg">Payroll</CardTitle>
                  <CardDescription>View your salary and payroll information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/payroll">
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

  // Fallback for HR users (should be redirected to HR dashboard)
  if (isHR) {
    return (
      <AuthGuard requireAuth>
        <LoadingState />
      </AuthGuard>
    );
  }
}
