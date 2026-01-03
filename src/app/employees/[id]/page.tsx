"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Circle,
  Clock,
  Edit,
  ArrowLeft,
  UserCheck,
  UserX,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type EmployeeProfile = {
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

type AttendanceRecord = {
  id: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
};

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, isAdmin, isHR } = useAuth();
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayStatus, setTodayStatus] = useState<'Present' | 'Absent' | null>(null);

  const employeeId = params.id as string;

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeProfile();
      fetchAttendanceHistory();
    }
  }, [employeeId]);

  async function fetchEmployeeProfile() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/employees/${employeeId}`);
      
      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to fetch employee profile");
        router.push("/employees");
      }
    } catch (error) {
      console.error("Error fetching employee profile:", error);
      toast.error("Failed to fetch employee profile");
      router.push("/employees");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAttendanceHistory() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const response = await fetch(`/api/attendance?startDate=${startDate}&endDate=${endDate}&userId=${employeeId}`);
      
      if (response.ok) {
        const data = await response.json();
        const records = data.records || [];
        setAttendanceRecords(records);
        
        // Set today's status
        const today = endDate;
        const todayRecord = records.find((r: AttendanceRecord) => r.date === today);
        setTodayStatus(todayRecord?.status as 'Present' | 'Absent' | null);
      }
    } catch (error) {
      console.error("Error fetching attendance history:", error);
    }
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!employee) {
    return (
      <AuthGuard requireAuth>
        <div className="text-center py-8">
          <p className="text-zinc-500">Employee not found.</p>
          <Button asChild className="mt-4">
            <Link href="/employees">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Employees
            </Link>
          </Button>
        </div>
      </AuthGuard>
    );
  }

  function getStatusIndicator() {
    if (todayStatus === 'Present') {
      return (
        <div className="flex items-center gap-2">
          <Circle className="h-4 w-4 fill-green-500 text-green-500" />
          <span className="text-sm font-medium text-green-600 dark:text-green-400">Present Today</span>
        </div>
      );
    } else if (todayStatus === 'Absent') {
      return (
        <div className="flex items-center gap-2">
          <Circle className="h-4 w-4 fill-red-500 text-red-500" />
          <span className="text-sm font-medium text-red-600 dark:text-red-400">Absent Today</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <Circle className="h-4 w-4 fill-zinc-300 text-zinc-300" />
          <span className="text-sm font-medium text-zinc-500">Not Checked In</span>
        </div>
      );
    }
  }

  const presentDays = attendanceRecords.filter(r => r.status === 'Present').length;
  const attendanceRate = attendanceRecords.length > 0 ? Math.round((presentDays / attendanceRecords.length) * 100) : 0;

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
            <p className="text-sm text-zinc-500">{employee.employeeId || `EMP${employee.id}`}</p>
          </div>
        </div>

        {/* Status Card */}
        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <User className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{employee.name}</h2>
                  <p className="text-zinc-500">{employee.designation || 'Employee'}</p>
                  {employee.department && (
                    <p className="text-sm text-zinc-400">{employee.department}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                {getStatusIndicator()}
                <p className="text-xs text-zinc-500 mt-1">
                  Attendance Rate: {attendanceRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
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
              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-zinc-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{employee.email}</p>
                  </div>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{employee.phone}</p>
                    </div>
                  </div>
                )}
                {employee.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{employee.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Information
              </CardTitle>
              <CardDescription>Professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {employee.employeeId && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium">Employee ID</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{employee.employeeId}</p>
                    </div>
                  </div>
                )}
                {employee.designation && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium">Designation</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{employee.designation}</p>
                    </div>
                  </div>
                )}
                {employee.department && (
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium">Department</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{employee.department}</p>
                    </div>
                  </div>
                )}
                {employee.joiningDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium">Joining Date</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(employee.joiningDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {employee.salary && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium">Salary</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        ${employee.salary.toLocaleString()}/year
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Attendance (Last 30 Days)
            </CardTitle>
            <CardDescription>
              Present: {presentDays}/{attendanceRecords.length} days ({attendanceRate}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceRecords.length === 0 ? (
              <p className="text-center text-zinc-500 py-4">No attendance records found.</p>
            ) : (
              <div className="space-y-2">
                {attendanceRecords.slice(0, 10).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        record.status === 'Present' 
                          ? 'bg-green-500' 
                          : record.status === 'Absent'
                          ? 'bg-red-500'
                          : 'bg-zinc-300'
                      }`} />
                      <div>
                        <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                        <p className="text-sm text-zinc-500">
                          {record.checkIn 
                            ? `In: ${new Date(record.checkIn).toLocaleTimeString()}` 
                            : "Not checked in"}
                          {record.checkOut && ` • Out: ${new Date(record.checkOut).toLocaleTimeString()}`}
                        </p>
                      </div>
                    </div>
                    <Badge className={
                      record.status === 'Present'
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : record.status === 'Absent'
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400"
                    }>
                      {record.status}
                    </Badge>
                  </div>
                ))}
                {attendanceRecords.length > 10 && (
                  <p className="text-center text-sm text-zinc-500 pt-2">
                    Showing 10 of {attendanceRecords.length} records
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {(isAdmin || isHR) && (
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Manage employee account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button asChild variant="outline">
                  <Link href={`/attendance?userId=${employee.id}`}>
                    <Clock className="mr-2 h-4 w-4" />
                    View Full Attendance
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}
