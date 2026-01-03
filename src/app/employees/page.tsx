"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/loading-state";
import { Users, Mail, Phone, Building2, Calendar, Hash } from "lucide-react";
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
  address: string | null;
  salary: number | null;
  createdAt: string;
};

export default function EmployeesPage() {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    }
  }, [isAdmin]);

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
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Employee Management</p>
          <h1 className="text-3xl font-semibold">Employees</h1>
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {employees.map((employee) => (
                  <Card key={employee.id} className="hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{employee.name}</span>
                        {employee.employeeId && (
                          <span className="text-xs font-normal text-zinc-500 flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {employee.employeeId}
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {employee.designation || "Employee"}
                        {employee.department && ` · ${employee.department}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-zinc-400" />
                        <span className="text-zinc-600 dark:text-zinc-400">{employee.email}</span>
                      </div>
                      {employee.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-zinc-400" />
                          <span className="text-zinc-600 dark:text-zinc-400">{employee.phone}</span>
                        </div>
                      )}
                      {employee.joiningDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-zinc-400" />
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Joined {new Date(employee.joiningDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="pt-2 flex gap-2">
                        <Link 
                          href={`/employees/${employee.id}`}
                          className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          View Details →
                        </Link>
                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                        <Link 
                          href={`/employees/${employee.id}/edit`}
                          className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Edit →
                        </Link>
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

