"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { ArrowLeft, Mail, Phone, Building, Calendar, MapPin, User, DollarSign } from "lucide-react";

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

  useEffect(() => {
    async function fetchEmployee() {
      try {
        const response = await fetch(`/api/employee/profile/${params.id}`);
        
        if (response.ok) {
          const data = await response.json();
          setEmployee(data.employee);
        } else {
          console.error('Failed to fetch employee:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      fetchEmployee();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <AuthGuard requireAuth>
        <LoadingState />
      </AuthGuard>
    );
  }

  if (!employee) {
    return (
      <AuthGuard requireAuth>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Employee Not Found
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              The employee you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href="/employees">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Employees
              </Link>
            </Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/employees">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Employees
            </Link>
          </Button>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Employee Profile</p>
            <h1 className="text-3xl font-semibold">{employee.name}</h1>
            <p className="text-sm text-zinc-500">
              {employee.employeeId ? `ID: ${employee.employeeId}` : 'Employee Information'}
            </p>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Basic employee details</CardDescription>
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
                  <Building className="h-5 w-5" />
                  Work Information
                </CardTitle>
                <CardDescription>Employment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {employee.department && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Building className="h-4 w-4" />
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
            {(isAdmin || isHR) && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Access related information</CardDescription>
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
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-2 text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Active
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employee ID */}
            {employee.employeeId && (
              <Card>
                <CardHeader>
                  <CardTitle>Employee ID</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {employee.employeeId}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
