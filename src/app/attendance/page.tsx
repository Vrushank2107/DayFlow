"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { toast } from "sonner";
import { Clock, CheckCircle, XCircle, Calendar } from "lucide-react";
import Link from "next/link";

type AttendanceRecord = {
  id: number;
  userId: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function AttendancePage() {
  const { user, isEmployee, isAdmin } = useAuth();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [weeklyRecords, setWeeklyRecords] = useState<AttendanceRecord[]>([]);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'timeoff'>('attendance');

  useEffect(() => {
    fetchAttendance();
  }, []);

  async function fetchAttendance() {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const startDate = weekAgo.toISOString().split('T')[0];

      // Get start of current week (Monday)
      const currentWeekStart = new Date();
      const day = currentWeekStart.getDay();
      const diff = currentWeekStart.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      const weekStart = new Date(currentWeekStart.setDate(diff));
      weekStart.setHours(0, 0, 0, 0);
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const response = await fetch(
        `/api/attendance?startDate=${startDate}&endDate=${today}`
      );
      if (response.ok) {
        const data = await response.json();
        const records = data.records || [];
        
        // Find today's record
        const todayRecord = records.find((r: AttendanceRecord) => r.date === today);
        setTodayRecord(todayRecord || null);
        
        // Get recent records (last 7 days)
        setRecentRecords(records.slice(0, 7));
        
        // Get weekly records (current week)
        const weeklyData = await fetch(
          `/api/attendance?startDate=${weekStartStr}&endDate=${today}`
        );
        if (weeklyData.ok) {
          const weeklyResult = await weeklyData.json();
          setWeeklyRecords(weeklyResult.records || []);
        }
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCheckIn() {
    setIsChecking(true);
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkin" }),
      });

      if (response.ok) {
        toast.success("Checked in successfully!");
        fetchAttendance();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to check in");
      }
    } catch (error) {
      toast.error("Failed to check in");
    } finally {
      setIsChecking(false);
    }
  }

  async function handleCheckOut() {
    setIsChecking(true);
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkout" }),
      });

      if (response.ok) {
        toast.success("Checked out successfully!");
        fetchAttendance();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to check out");
      }
    } catch (error) {
      toast.error("Failed to check out");
    } finally {
      setIsChecking(false);
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "Present":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Absent":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "Leave":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "Half-day":
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return <Clock className="h-5 w-5 text-zinc-500" />;
    }
  }

  return (
    <AuthGuard requireAuth>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Attendance</p>
          <h1 className="text-3xl font-semibold">Attendance Management</h1>
          <p className="text-sm text-zinc-500">
            {isAdmin 
              ? "View and manage employee attendance records."
              : "Check in/out and view your attendance records."}
          </p>
        </div>

        {/* Tabs for Admin */}
        {isAdmin && (
          <div className="border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('employees')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'employees'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Employees
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'attendance'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Attendance
              </button>
              <button
                onClick={() => setActiveTab('timeoff')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'timeoff'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Time Off
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {(!isAdmin || activeTab === 'attendance') && (
          isLoading ? (
            <LoadingState />
          ) : (
            <>
            {isEmployee && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Today's Attendance
                  </CardTitle>
                  <CardDescription>Check in and check out for today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todayRecord ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-zinc-500">Status</p>
                          <p className="text-lg font-semibold flex items-center gap-2">
                            {getStatusIcon(todayRecord.status)}
                            {todayRecord.status}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500">Date</p>
                          <p className="text-lg font-semibold">
                            {new Date(todayRecord.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-zinc-500">Check In</p>
                          <p className="font-medium">
                            {todayRecord.checkIn 
                              ? new Date(todayRecord.checkIn).toLocaleTimeString()
                              : "Not checked in"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500">Check Out</p>
                          <p className="font-medium">
                            {todayRecord.checkOut 
                              ? new Date(todayRecord.checkOut).toLocaleTimeString()
                              : "Not checked out"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        {!todayRecord.checkIn && (
                          <Button onClick={handleCheckIn} disabled={isChecking} className="flex-1">
                            <Clock className="mr-2 h-4 w-4" />
                            Check In
                          </Button>
                        )}
                        {todayRecord.checkIn && !todayRecord.checkOut && (
                          <Button onClick={handleCheckOut} disabled={isChecking} className="flex-1">
                            <Clock className="mr-2 h-4 w-4" />
                            Check Out
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-zinc-500 mb-4">No attendance record for today</p>
                      <Button onClick={handleCheckIn} disabled={isChecking}>
                        <Clock className="mr-2 h-4 w-4" />
                        Check In
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Attendance Records</CardTitle>
                    <CardDescription>
                      {viewMode === 'daily' ? 'Last 7 days' : 'Current week'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'daily' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('daily')}
                    >
                      Daily
                    </Button>
                    <Button
                      variant={viewMode === 'weekly' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('weekly')}
                    >
                      Weekly
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(viewMode === 'daily' ? recentRecords : weeklyRecords).length === 0 ? (
                  <p className="text-center text-zinc-500 py-4">No attendance records found</p>
                ) : (
                  <div className="space-y-2">
                    {(viewMode === 'daily' ? recentRecords : weeklyRecords).map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(record.status)}
                          <div>
                            <p className="font-medium">
                              {new Date(record.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-zinc-500">
                              {record.checkIn 
                                ? `In: ${new Date(record.checkIn).toLocaleTimeString()}`
                                : "Not checked in"}
                              {record.checkOut && ` • Out: ${new Date(record.checkOut).toLocaleTimeString()}`}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === "Present" 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : record.status === "Leave"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            </>
          )
        )}

        {isAdmin && activeTab === 'employees' && (
          <Card>
            <CardHeader>
              <CardTitle>Employees</CardTitle>
              <CardDescription>View and manage all employees</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/employees">View All Employees</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {isAdmin && activeTab === 'timeoff' && (
          <Card>
            <CardHeader>
              <CardTitle>Time Off</CardTitle>
              <CardDescription>View and manage leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/leave">View Leave Requests</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}

