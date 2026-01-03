"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { toast } from "sonner";
import { Users, Plus, Edit, Trash2, Mail, Phone, Building, Calendar } from "lucide-react";
import Link from "next/link";

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
};

export default function HREmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AuthGuard requireAuth requireAdmin>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">HR Employee Management</p>
            <h1 className="text-3xl font-semibold">Employees</h1>
            <p className="text-sm text-zinc-500">View and manage all employees in the organization.</p>
          </div>
          <Button asChild>
            <Link href="/admin/hr/employees/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Employees</CardTitle>
                  <CardDescription>
                    {employees.length} total employee{employees.length !== 1 ? 's' : ''}
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
                  {!searchTerm && (
                    <Button asChild className="mt-4">
                      <Link href="/admin/hr/employees/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Employee
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800">
                        <th className="text-left py-3 px-4 font-medium text-sm text-zinc-700 dark:text-zinc-300">Employee</th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-zinc-700 dark:text-zinc-300">Contact</th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-zinc-700 dark:text-zinc-300">Department</th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-zinc-700 dark:text-zinc-300">Joined</th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-zinc-700 dark:text-zinc-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((employee) => (
                        <tr key={employee.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-sm text-zinc-500">{employee.employeeId || `EMP${employee.id}`}</p>
                              {employee.designation && (
                                <p className="text-xs text-zinc-400">{employee.designation}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-zinc-400" />
                                <span className="text-zinc-600 dark:text-zinc-400">{employee.email}</span>
                              </div>
                              {employee.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-3 w-3 text-zinc-400" />
                                  <span className="text-zinc-600 dark:text-zinc-400">{employee.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-zinc-400" />
                              <span className="text-sm">{employee.department || "N/A"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-zinc-400" />
                              <span>
                                {employee.joiningDate 
                                  ? new Date(employee.joiningDate).toLocaleDateString()
                                  : "N/A"
                                }
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(employee.id)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}
