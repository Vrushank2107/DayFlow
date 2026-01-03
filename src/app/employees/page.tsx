"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { toast } from "sonner";
import { Users, Plus, Edit, Trash2, Mail, Phone, Building, Calendar, Circle, UserCheck, UserX, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type Employee = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  employeeId: string | null;
  department: string | null;
  designation: string | null;
  joiningDate: string | null;
  salary: number | null;
  address: string | null;
  createdAt: string;
  // Status info
  attendanceStatus?: 'Present' | 'Absent' | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
};

export default function EmployeesPage() {
  const { user, isAdmin, isHR } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'All' | 'Present' | 'Absent'>('All');

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/employees");
      
      if (response.ok) {
        const data = await response.json();
        const employeesData = data.employees || [];
        
        // Fetch attendance status for each employee
        const today = new Date().toISOString().split('T')[0];
        const employeesWithStatus = await Promise.all(
          employeesData.map(async (employee: Employee) => {
            try {
              const attendanceRes = await fetch(`/api/attendance?startDate=${today}&endDate=${today}&userId=${employee.id}`);
              if (attendanceRes.ok) {
                const attendanceData = await attendanceRes.json();
                const todayRecord = attendanceData.records?.[0];
                return {
                  ...employee,
                  attendanceStatus: todayRecord?.status || null,
                  checkInTime: todayRecord?.checkIn || null,
                  checkOutTime: todayRecord?.checkOut || null,
                };
              }
            } catch (error) {
              console.error(`Error fetching attendance for employee ${employee.id}:`, error);
            }
            return employee;
          })
        );
        
        setEmployees(employeesWithStatus);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to fetch employees");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(employeeId: number) {
    if (!confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Employee deleted successfully!");
        fetchEmployees();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete employee");
      }
    } catch (error) {
      toast.error("Failed to delete employee");
    }
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || employee.attendanceStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  function getStatusIndicator(employee: Employee) {
    if (employee.attendanceStatus === 'Present') {
      return (
        <div className="flex items-center gap-2">
          <Circle className="h-3 w-3 fill-green-500 text-green-500" />
          <span className="text-xs text-green-600 dark:text-green-400">Present</span>
          {employee.checkInTime && (
            <span className="text-xs text-zinc-500">
              In: {new Date(employee.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      );
    } else if (employee.attendanceStatus === 'Absent') {
      return (
        <div className="flex items-center gap-2">
          <Circle className="h-3 w-3 fill-red-500 text-red-500" />
          <span className="text-xs text-red-600 dark:text-red-400">Absent</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <Circle className="h-3 w-3 fill-zinc-300 text-zinc-300" />
          <span className="text-xs text-zinc-500">Not checked in</span>
        </div>
      );
    }
  }

  function getStatusBadge(employee: Employee) {
    if (employee.attendanceStatus === 'Present') {
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Present</Badge>;
    } else if (employee.attendanceStatus === 'Absent') {
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Absent</Badge>;
    } else {
      return <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400">Not Checked In</Badge>;
    }
  }

  return (
    <AuthGuard requireAuth>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Employee Directory</p>
            <h1 className="text-3xl font-semibold">All Employees</h1>
            <p className="text-sm text-zinc-500">View and manage all employees in the organization.</p>
          </div>
          {(isAdmin || isHR) && (
            <Button asChild>
              <Link href="/admin/employees/create">
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-zinc-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{employees.length}</div>
                  <p className="text-xs text-zinc-500">Registered employees</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {employees.filter(e => e.attendanceStatus === 'Present').length}
                  </div>
                  <p className="text-xs text-zinc-500">Checked in today</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                  <UserX className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {employees.filter(e => e.attendanceStatus === 'Absent').length}
                  </div>
                  <p className="text-xs text-zinc-500">Not present today</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Employee List</CardTitle>
                    <CardDescription>
                      {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
                    >
                      <option value="All">All Status</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredEmployees.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                    <p className="text-zinc-500">
                      {searchTerm ? "No employees found matching your search." : "No employees found."}
                    </p>
                    {!searchTerm && (isAdmin || isHR) && (
                      <Button asChild className="mt-4">
                        <Link href="/admin/employees/create">
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Employee
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredEmployees.map((employee) => (
                      <Card key={employee.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                  <UserCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-zinc-900 ${
                                  employee.attendanceStatus === 'Present' 
                                    ? 'bg-green-500' 
                                    : employee.attendanceStatus === 'Absent'
                                    ? 'bg-red-500'
                                    : 'bg-zinc-300'
                                }`} />
                              </div>
                              <div>
                                <h3 className="font-semibold">{employee.name}</h3>
                                <p className="text-sm text-zinc-500">{employee.employeeId || `EMP${employee.id}`}</p>
                                {employee.designation && (
                                  <p className="text-xs text-zinc-400">{employee.designation}</p>
                                )}
                              </div>
                            </div>
                            {getStatusBadge(employee)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-zinc-400" />
                              <span className="text-zinc-600 dark:text-zinc-400 truncate">{employee.email}</span>
                            </div>
                            {employee.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-zinc-400" />
                                <span className="text-zinc-600 dark:text-zinc-400">{employee.phone}</span>
                              </div>
                            )}
                            {employee.department && (
                              <div className="flex items-center gap-2 text-sm">
                                <Building className="h-3 w-3 text-zinc-400" />
                                <span className="text-zinc-600 dark:text-zinc-400">{employee.department}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3 w-3 text-zinc-400" />
                              <span className="text-zinc-600 dark:text-zinc-400">
                                Joined: {employee.joiningDate 
                                  ? new Date(employee.joiningDate).toLocaleDateString()
                                  : "N/A"
                                }
                              </span>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            {getStatusIndicator(employee)}
                          </div>

                          {(isAdmin || isHR) && (
                            <div className="flex items-center gap-2 pt-2">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/profile/${employee.id}`}>
                                  View Profile
                                </Link>
                              </Button>
                              {isAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(employee.id)}
                                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
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
