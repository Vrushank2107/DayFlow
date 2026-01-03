"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/loading-state";
import { Search, Users, Plus, Eye, Mail, Phone, Building } from "lucide-react";

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

export default function EmployeesListPage() {
  const { user, isAdmin, isHR } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await fetch("/api/employees");
        
        if (response.ok) {
          const data = await response.json();
          setEmployees(data.employees || []);
          setFilteredEmployees(data.employees || []);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.employeeId && employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (employee.designation && employee.designation.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  // Check if user has unified admin access (after all hooks)
  if (!isAdmin && !isHR) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Access Denied
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard requireAuth>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Employee Management</p>
              <h1 className="text-3xl font-semibold">
                All Employees
              </h1>
              <p className="text-sm text-zinc-500">
                View and manage all employees
              </p>
            </div>
            <Button asChild className="flex items-center gap-2">
              <Link href="/admin/hr/employees/create">
                <Plus className="h-4 w-4" />
                Create Employee
              </Link>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search employees by name, email, ID, department, or designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {/* Employee Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Showing {filteredEmployees.length} of {employees.length} employees
              </p>
            </div>

            {/* Employees Table */}
            {filteredEmployees.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-zinc-400 mb-4" />
                  <p className="text-lg font-semibold mb-2">
                    {searchTerm ? "No employees found" : "No employees found"}
                  </p>
                  <p className="text-sm text-zinc-500 mb-6">
                    {searchTerm ? "Try adjusting your search terms" : "No employees have been registered yet."}
                  </p>
                  {!searchTerm && (
                    <Button asChild className="flex items-center gap-2">
                      <Link href="/admin/hr/employees/create">
                        <Plus className="h-4 w-4" />
                        Create Your First Employee
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Employee ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Position
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-700">
                        {filteredEmployees.map((employee) => (
                          <tr key={employee.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-zinc-900 dark:text-zinc-100">
                              {employee.employeeId || "N/A"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {employee.name}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-zinc-400" />
                                <span>{employee.email}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                              {employee.phone ? (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-zinc-400" />
                                  <span>{employee.phone}</span>
                                </div>
                              ) : (
                                <span className="text-zinc-400">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                              {employee.department ? (
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4 text-zinc-400" />
                                  <span>{employee.department}</span>
                                </div>
                              ) : (
                                <span className="text-zinc-400">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                              {employee.designation || "N/A"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                Active
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/dashboard/employee/${employee.id}`} className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  View
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}
