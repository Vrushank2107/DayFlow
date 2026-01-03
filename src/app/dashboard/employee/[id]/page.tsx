"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { ArrowLeft, Calendar, DollarSign, Mail, MapPin, Phone, User, Building2 } from "lucide-react";

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

export default function EmployeeProfilePage() {
  const { user, isAdmin, isHR } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const employeeId = params.id as string;

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  async function fetchEmployee() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dashboard/employee/${employeeId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Employee not found");
        } else if (response.status === 403) {
          setError("Access denied");
        } else {
          setError("Failed to fetch employee data");
        }
        return;
      }

      const data = await response.json();
      setEmployee(data);
    } catch (error) {
      console.error("Error fetching employee:", error);
      setError("Failed to fetch employee data");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <AuthGuard requireAuth>
        <LoadingState />
      </AuthGuard>
    );
  }

  if (error || !employee) {
    return (
      <AuthGuard requireAuth>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Employee
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-zinc-400 mb-4" />
              <p className="text-lg font-semibold mb-2">Error</p>
              <p className="text-sm text-zinc-500">{error || "Employee not found"}</p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employee
            </Link>
          </Button>
        </div>

        {/* Profile Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Profile Picture */}
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-3xl font-semibold">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold">{employee.name}</h1>
                    {employee.designation && (
                      <p className="text-lg text-zinc-600 dark:text-zinc-400">{employee.designation}</p>
                    )}
                    {employee.department && (
                      <p className="text-sm text-zinc-500">{employee.department}</p>
                    )}
                    {employee.employeeId && (
                      <p className="text-xs text-zinc-400">ID: {employee.employeeId}</p>
                    )}
                  </div>

                  {(isAdmin || isHR) && (
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/dashboard/employee/${employee.id}/edit`}>
                        Edit Profile
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                  
                  {employee.phone && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Phone className="h-4 w-4" />
                        Phone
                      </div>
                      <p className="font-medium">{employee.phone}</p>
                    </div>
                  )}
                  
                  {employee.address && (
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <MapPin className="h-4 w-4" />
                        Address
                      </div>
                      <p className="font-medium">{employee.address}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Work Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Work Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {employee.department && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Building2 className="h-4 w-4" />
                        Department
                      </div>
                      <p className="font-medium">{employee.department}</p>
                    </div>
                  )}
                  
                  {employee.designation && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <User className="h-4 w-4" />
                        Designation
                      </div>
                      <p className="font-medium">{employee.designation}</p>
                    </div>
                  )}
                  
                  {employee.joiningDate && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Calendar className="h-4 w-4" />
                        Joining Date
                      </div>
                      <p className="font-medium">
                        {new Date(employee.joiningDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  {employee.salary && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <DollarSign className="h-4 w-4" />
                        Salary
                      </div>
                      <p className="font-medium">₹{employee.salary.toLocaleString()}/year</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage employee-related information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <Button asChild variant="outline">
                    <Link href={`/attendance?userId=${employee.id}`}>
                      View Attendance
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/leave?userId=${employee.id}`}>
                      View Leave Requests
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/dashboard/employee/${employee.id}/payroll`}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      View Payroll
                    </Link>
                  </Button>
                  {(isAdmin || isHR) && (
                    <Button asChild variant="outline">
                      <Link href={`/dashboard/employee/${employee.id}/edit`}>
                        Edit Employee
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
