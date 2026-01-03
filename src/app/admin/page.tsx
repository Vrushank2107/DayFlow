"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/loading-state";
import Link from "next/link";
import { Users, Calendar, DollarSign, Clock, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    todayAttendance: 0,
    totalPayroll: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setIsLoading(true);
      // Fetch all employees
      const employeesRes = await fetch("/api/employees");
      const employeesData = employeesRes.ok ? await employeesRes.json() : { employees: [] };
      
      // Fetch all leave requests
      const leavesRes = await fetch("/api/leave");
      const leavesData = leavesRes.ok ? await leavesRes.json() : { leaves: [] };
      
      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const attendanceRes = await fetch(`/api/attendance?startDate=${today}&endDate=${today}`);
      const attendanceData = attendanceRes.ok ? await attendanceRes.json() : { records: [] };

      setStats({
        totalEmployees: employeesData.employees?.length || 0,
        pendingLeaves: leavesData.leaves?.filter((l: any) => l.status === 'Pending').length || 0,
        todayAttendance: attendanceData.records?.filter((r: any) => r.status === 'Present').length || 0,
        totalPayroll: 0, // Can be calculated from payroll records
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthGuard requireAuth requireAdmin>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Admin Dashboard</p>
          <h1 className="text-3xl font-semibold">
            Welcome back, {user?.name || "Admin"}!
          </h1>
          <p className="text-sm text-zinc-500">Manage your workforce and HR operations.</p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-5 w-5 text-indigo-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                    {stats.totalEmployees}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Registered employees</p>
                </CardContent>
              </Card>

              <Card className="group hover:border-amber-300 dark:hover:border-amber-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
                  <FileText className="h-5 w-5 text-amber-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">
                    {stats.pendingLeaves}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card className="group hover:border-green-300 dark:hover:border-green-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                  <Clock className="h-5 w-5 text-green-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                    {stats.todayAttendance}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Present today</p>
                </CardContent>
              </Card>

              <Card className="group hover:border-purple-300 dark:hover:border-purple-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Payroll Records</CardTitle>
                  <DollarSign className="h-5 w-5 text-purple-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400">
                    {stats.totalPayroll}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Total records</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader>
                  <CardTitle className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Employees</CardTitle>
                  <CardDescription>View and manage all employees</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/employees">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Employees
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader>
                  <CardTitle className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Leave Requests</CardTitle>
                  <CardDescription>Approve or reject leave requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/leave">
                      <Calendar className="mr-2 h-4 w-4" />
                      Manage Leaves
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader>
                  <CardTitle className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Attendance</CardTitle>
                  <CardDescription>View all attendance records</CardDescription>
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
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}

