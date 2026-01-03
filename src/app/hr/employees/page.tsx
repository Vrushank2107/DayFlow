"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/loading-state";
import { Search, Users, Plus, Eye, Mail, Phone, Building, Calendar } from "lucide-react";

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

export default function HREmployeesPage() {
  const { user, isHR } = useAuth();
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

    if (isHR) {
      fetchEmployees();
    }
  }, [isHR]);

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
              <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Employee Management</p>
              <h1 className="text-3xl font-semibold">
                Manage Employees
              </h1>
              <p className="text-sm text-zinc-500">
                View and manage all employee information
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
              <Button asChild variant="outline" size="sm">
                <Link href="/hr">
                  ← Back to HR Dashboard
                </Link>
              </Button>
            </div>

            {/* Employees Grid */}
            {filteredEmployees.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredEmployees.map((employee) => (
                  <Card key={employee.id} className="hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        {/* Profile Picture */}
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {employee.name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* Employee Info */}
                        <div className="space-y-2 w-full">
                          <h3 className="font-semibold text-lg">{employee.name}</h3>
                          
                          {employee.designation && (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{employee.designation}</p>
                          )}
                          
                          {employee.department && (
                            <div className="flex items-center justify-center gap-1 text-xs text-zinc-500">
                              <Building className="h-3 w-3" />
                              {employee.department}
                            </div>
                          )}

                          {employee.employeeId && (
                            <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                              {employee.employeeId}
                            </p>
                          )}

                          {/* Contact Info */}
                          <div className="space-y-1 text-xs text-zinc-500">
                            <div className="flex items-center justify-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{employee.email}</span>
                            </div>
                            {employee.phone && (
                              <div className="flex items-center justify-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{employee.phone}</span>
                              </div>
                            )}
                          </div>

                          {employee.joiningDate && (
                            <div className="flex items-center justify-center gap-1 text-xs text-zinc-400">
                              <Calendar className="h-3 w-3" />
                              <span>Joined: {new Date(employee.joiningDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full space-y-2">
                          <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={`/dashboard/employee/${employee.id}`} className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              View Profile
                            </Link>
                          </Button>
                          
                          <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={`/leave?userId=${employee.id}`} className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              View Leave
                            </Link>
                          </Button>
                        </div>
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
