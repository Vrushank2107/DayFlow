"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { Calendar, Clock, Users, FileText, Plus, Eye } from "lucide-react";

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

type LeaveRequest = {
  id: number;
  userId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: string;
  adminComment: string | null;
  createdAt: string;
  updatedAt: string;
  employeeName?: string;
  employeeEmail?: string;
};

export default function HRDashboardPage() {
  const { user, isHR } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    totalLeaves: 0,
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch employees data
        const employeesResponse = await fetch("/api/employees");
        
        if (employeesResponse.ok) {
          const data = await employeesResponse.json();
          setEmployees(data.employees || []);
          setStats(prev => ({ ...prev, totalEmployees: data.employees?.length || 0 }));
        }

        // Fetch leave requests
        const leavesResponse = await fetch("/api/leave");
        
        if (leavesResponse.ok) {
          const data = await leavesResponse.json();
          const leaves = data.leaves || [];
          setRecentLeaves(leaves.slice(0, 5)); // Show recent 5 leaves
          
          setStats(prev => ({
            ...prev,
            totalLeaves: leaves.length,
            pendingLeaves: leaves.filter((l: LeaveRequest) => l.status === 'Pending').length,
            approvedLeaves: leaves.filter((l: LeaveRequest) => l.status === 'Approved').length,
          }));
        }
      } catch (error) {
        console.error('Error fetching HR dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isHR) {
      fetchData();
    }
  }, [isHR]);

  function getStatusBadge(status: string) {
    switch (status) {
      case "Approved":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Approved</span>;
      case "Rejected":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Pending</span>;
    }
  }

  function getLeaveTypeColor(type: string) {
    switch (type) {
      case "Paid":
        return "text-blue-600 dark:text-blue-400";
      case "Sick":
        return "text-red-600 dark:text-red-400";
      case "Unpaid":
        return "text-zinc-600 dark:text-zinc-400";
      default:
        return "text-zinc-600 dark:text-zinc-400";
    }
  }

  if (!isHR) {
    return (
      <AuthGuard requireAuth>
        <div className="space-y-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Access Denied</h1>
            <p className="text-zinc-600 dark:text-zinc-400">This page is only accessible to HR personnel.</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">HR Dashboard</p>
              <h1 className="text-3xl font-semibold">
                Welcome back, {user?.name || "HR"}!
              </h1>
              <p className="text-sm text-zinc-500">Manage employees and leave requests.</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex items-center gap-2">
                <Link href="/leave">
                  <FileText className="h-4 w-4" />
                  Manage Leave
                </Link>
              </Button>
              <Button asChild className="flex items-center gap-2">
                <Link href="/admin/employees/create">
                  <Plus className="h-4 w-4" />
                  Create Employee
                </Link>
              </Button>
            </div>
          </div>
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
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Active employees
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
                  <Clock className="h-5 w-5 text-amber-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">
                    {stats.pendingLeaves}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Awaiting approval
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved Leaves</CardTitle>
                  <Calendar className="h-5 w-5 text-green-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                    {stats.approvedLeaves}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Approved requests
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leave Requests</CardTitle>
                  <FileText className="h-5 w-5 text-purple-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400">
                    {stats.totalLeaves}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    All requests
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Leave Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Leave Requests
                  </CardTitle>
                  <CardDescription>
                    Latest leave requests from employees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentLeaves.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                      <p className="text-zinc-500">No leave requests found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentLeaves.map((leave) => (
                        <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">{leave.employeeName || 'Unknown'}</p>
                              {getStatusBadge(leave.status)}
                            </div>
                            <p className={`text-sm ${getLeaveTypeColor(leave.leaveType)}`}>
                              {leave.leaveType} Leave
                            </p>
                            <p className="text-xs text-zinc-500">
                              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/leave`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common HR tasks and management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/admin/employees/create" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create New Employee
                    </Link>
                  </Button>
                  
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/leave" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Manage Leave Requests
                    </Link>
                  </Button>
                  
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/hr/employees" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      View All Employees
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Employees Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employees Overview
                </CardTitle>
                <CardDescription>
                  All employees in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {employees.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                    <p className="text-zinc-500 mb-4">No employees found</p>
                    <Button asChild className="flex items-center gap-2">
                      <Link href="/admin/employees/create">
                        <Plus className="h-4 w-4" />
                        Create Your First Employee
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {employees.slice(0, 6).map((employee) => (
                      <Card key={employee.id} className="hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {employee.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold">{employee.name}</h3>
                              <p className="text-sm text-zinc-500">{employee.designation || 'Employee'}</p>
                              <p className="text-xs text-zinc-400">{employee.department || 'No department'}</p>
                              {employee.employeeId && (
                                <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                                  {employee.employeeId}
                                </p>
                              )}
                            </div>
                            <Button asChild variant="outline" size="sm" className="w-full">
                              <Link href={`/dashboard/employee/${employee.id}`}>
                                View Profile
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {employees.length > 6 && (
                      <div className="flex items-center justify-center">
                        <Button asChild variant="outline">
                          <Link href="/hr/employees">View All Employees</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
