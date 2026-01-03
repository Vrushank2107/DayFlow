"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { Edit, Mail, Phone, User, Building2, Calendar, Hash, MapPin, DollarSign, ArrowLeft } from "lucide-react";
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

export default function EmployeeDetailPage() {
  const { isAdmin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const employeeId = params?.id as string;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'salary'>('profile');

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  async function fetchEmployee() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/employees/${employeeId}`);
      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch employee' }));
        console.error("Error fetching employee:", error);
        router.push("/employees");
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
      router.push("/employees");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthGuard requireAuth requireAdmin>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/employees" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Employees
            </Link>
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Employee Details</p>
            <h1 className="text-3xl font-semibold">{employee?.name || "Employee"}</h1>
            <p className="text-sm text-zinc-500">View and manage employee information.</p>
          </div>
          {employee && (
            <Button asChild>
              <Link href={`/employees/${employeeId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Employee
              </Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <LoadingState />
        ) : employee ? (
          <>
            <Card className="rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Dayflow Employee</p>
                  <h1 className="text-3xl font-semibold">{employee.name}</h1>
                  <p className="text-sm text-zinc-500">
                    {employee.designation || "Employee"}
                    {employee.department && ` · ${employee.department}`}
                  </p>
                </div>
                {employee.employeeId && (
                  <div className="flex items-center gap-3 rounded-full bg-indigo-50 px-4 py-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
                    <Hash className="h-4 w-4" />
                    {employee.employeeId}
                  </div>
                )}
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                {employee.phone && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
                    <Phone className="h-4 w-4" />
                    {employee.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
                  <Mail className="h-4 w-4" />
                  {employee.email}
                </span>
                {employee.department && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
                    <Building2 className="h-4 w-4" />
                    {employee.department}
                  </span>
                )}
                {employee.joiningDate && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(employee.joiningDate).toLocaleDateString()}
                  </span>
                )}
                {employee.address && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
                    <MapPin className="h-4 w-4" />
                    {employee.address}
                  </span>
                )}
              </div>
            </Card>

            {/* Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'profile'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Profile
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('salary')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'salary'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    Salary Info
                  </button>
                )}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'profile' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardContent className="space-y-4 pt-6">
                    <section>
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </h2>
                      <div className="mt-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Full Name</span>
                          <span className="text-sm font-medium">{employee.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Email</span>
                          <span className="text-sm font-medium">{employee.email}</span>
                        </div>
                        {employee.phone && (
                          <div className="flex justify-between">
                            <span className="text-sm text-zinc-500">Phone</span>
                            <span className="text-sm font-medium">{employee.phone}</span>
                          </div>
                        )}
                        {employee.address && (
                          <div className="flex justify-between">
                            <span className="text-sm text-zinc-500">Address</span>
                            <span className="text-sm font-medium">{employee.address}</span>
                          </div>
                        )}
                        {employee.employeeId && (
                          <div className="flex justify-between">
                            <span className="text-sm text-zinc-500">Employee ID</span>
                            <span className="text-sm font-medium">{employee.employeeId}</span>
                          </div>
                        )}
                      </div>
                    </section>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-4 pt-6">
                    <section>
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Employment Information
                      </h2>
                      <div className="mt-4 space-y-3">
                        {employee.department && (
                          <div className="flex justify-between">
                            <span className="text-sm text-zinc-500">Department</span>
                            <span className="text-sm font-medium">{employee.department}</span>
                          </div>
                        )}
                        {employee.designation && (
                          <div className="flex justify-between">
                            <span className="text-sm text-zinc-500">Designation</span>
                            <span className="text-sm font-medium">{employee.designation}</span>
                          </div>
                        )}
                        {employee.joiningDate && (
                          <div className="flex justify-between">
                            <span className="text-sm text-zinc-500">Joining Date</span>
                            <span className="text-sm font-medium">
                              {new Date(employee.joiningDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </section>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'salary' && isAdmin && (
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <section>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Salary Structure
                    </h2>
                    <div className="mt-4 space-y-3">
                      {employee.salary ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-zinc-500">Basic Salary</span>
                            <span className="text-sm font-medium">${employee.salary.toLocaleString()}</span>
                          </div>
                          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                            <p className="font-medium mb-2">Salary Details</p>
                            <p>Full salary structure and breakdown can be viewed in the Payroll section.</p>
                            <p className="mt-2 text-xs">To update salary structure, please use the Payroll management page.</p>
                          </div>
                        </>
                      ) : (
                        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                          <p>No salary information available for this employee.</p>
                        </div>
                      )}
                    </div>
                  </section>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-zinc-500">Employee not found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}

