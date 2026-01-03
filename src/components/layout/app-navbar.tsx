"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkle, User, LogOut, Clock, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-client";
import { toast } from "sonner";

const navItems = [
  { href: "/", label: "Home", public: true },
  { href: "/dashboard", label: "Dashboard", requiresAuth: true, employeeOnly: true },
  { href: "/employees", label: "Employees", requiresAuth: true, excludeEmployee: true },
  { href: "/attendance", label: "Attendance", requiresAuth: true },
  { href: "/leave", label: "Leave", requiresAuth: true },
  { href: "/payroll", label: "Payroll", requiresAuth: true },
  { href: "/admin", label: "Admin Dashboard", requiresAuth: true, unifiedAdminOnly: true },
];

export function AppNavbar() {
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, isEmployee, isAdmin, isHR, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Absent' | 'Half-day' | 'Leave' | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  // HR-specific state for real-time updates
  const [hrStats, setHrStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    totalPayroll: 0,
  });

  useEffect(() => {
    if (isEmployee && isAuthenticated) {
      fetchTodayAttendance();
    }
    if (isHR && isAuthenticated) {
      fetchHRStats();
    }
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isEmployee, isHR, isAuthenticated]);

  // Add periodic refresh for employee and HR data
  useEffect(() => {
    if (!isAuthenticated) return;

    // Refresh data for employees and HR
    const interval = setInterval(() => {
      if (isEmployee) {
        fetchTodayAttendance();
      }
      if (isHR) {
        fetchHRStats();
        fetchTodayAttendance(); // Also fetch attendance for HR
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isEmployee, isHR, isAuthenticated]);

  async function fetchTodayAttendance() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/attendance?startDate=${today}&endDate=${today}`);
      if (response.ok) {
        const data = await response.json();
        const todayRecord = data.records?.[0];
        if (todayRecord) {
          setAttendanceStatus(todayRecord.status === 'Present' ? 'Present' : null);
          setCheckInTime(todayRecord.checkIn);
        } else {
          setAttendanceStatus(null);
          setCheckInTime(null);
        }
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  }

  async function fetchNotifications() {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setUnreadNotifications(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }

  // Fetch HR statistics for real-time updates
  async function fetchHRStats() {
    if (!isHR) return;
    
    try {
      // Fetch employees count
      const employeesResponse = await fetch("/api/employees");
      const employeesData = employeesResponse.ok ? await employeesResponse.json() : { employees: [] };
      
      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const attendanceResponse = await fetch(`/api/attendance?startDate=${today}&endDate=${today}`);
      const attendanceData = attendanceResponse.ok ? await attendanceResponse.json() : { records: [] };
      
      // Fetch pending leaves
      const leavesResponse = await fetch("/api/leave");
      const leavesData = leavesResponse.ok ? await leavesResponse.json() : { leaves: [] };
      
      // Update HR stats
      setHrStats({
        totalEmployees: employeesData.employees?.length || 0,
        presentToday: attendanceData.records?.filter((r: any) => r.status === 'Present').length || 0,
        pendingLeaves: leavesData.leaves?.filter((l: any) => l.status === 'Pending').length || 0,
        totalPayroll: 0, // Can be calculated from payroll API if needed
      });
    } catch (error) {
      console.error("Error fetching HR stats:", error);
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
        
        // Immediately update state for instant UI feedback
        const now = new Date();
        setAttendanceStatus('Present');
        setCheckInTime(now.toTimeString().split(' ')[0].substring(0, 5));
        
        // Then fetch fresh data from server
        await fetchTodayAttendance();
        
        // Also refresh HR stats if user is HR
        if (isHR) {
          await fetchHRStats();
        }
        
        // Force a re-render by updating a timestamp
        setUnreadNotifications(prev => prev + 0); // Triggers re-render
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
        
        // Immediately update state for instant UI feedback
        setAttendanceStatus(null);
        setCheckInTime(null);
        
        // Then fetch fresh data from server
        await fetchTodayAttendance();
        
        // Also refresh HR stats if user is HR
        if (isHR) {
          await fetchHRStats();
        }
        
        // Force a re-render by updating a timestamp
        setUnreadNotifications(prev => prev + 0); // Triggers re-render
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

  const visibleNavItems = navItems.filter((item) => {
    if (item.public) return true;
    if (item.requiresAuth && !isAuthenticated) return false;
    if ((item as any).unifiedAdminOnly && !(isAdmin || isHR)) return false;
    if ((item as any).adminOnly && !isAdmin) return false;
    if ((item as any).hrOnly && !isHR) return false;
    if ((item as any).excludeHR && isHR) return false;
    if ((item as any).excludeEmployee && isEmployee) return false;
    if ((item as any).employeeOnly && !isEmployee) return false;
    return true;
  });

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/90 backdrop-blur-xl shadow-sm dark:bg-black/80 dark:border-zinc-800/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight transition-transform hover:scale-105">
          <Sparkle className="h-5 w-5 text-indigo-500 animate-pulse" />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
            Dayflow
          </span>
        </Link>
        
        <nav className="hidden items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 md:flex">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 transition-all duration-200",
                pathname === item.href
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          ) : isAuthenticated && user ? (
            <>
              {/* Check In/Out for Employees */}
              {isEmployee && (
                <div className="flex items-center gap-2 mr-2">
                  <div className={`h-3 w-3 rounded-full ${
                    attendanceStatus === 'Present' 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`} title={attendanceStatus === 'Present' ? 'Present' : 'Not checked in'} />
                  {!checkInTime ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCheckIn}
                      disabled={isChecking}
                      className="gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Check In
                    </Button>
                  ) : (
                    <>
                      <span className="text-xs text-zinc-500">
                        Since {checkInTime ? new Date(checkInTime).toLocaleTimeString() : ''}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCheckOut}
                        disabled={isChecking}
                        className="gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Check Out
                      </Button>
                    </>
                  )}
                </div>
              )}
              
              {/* Notification Icon */}
              <Link href="/notifications">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 relative"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </Button>
              </Link>
              
            <DropdownMenu
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 max-w-[180px] justify-between"
                  disabled={isLoggingOut}
                >
                  <span className="flex items-center gap-2 truncate">
                    <User className="h-4 w-4" />
                    <span className="truncate text-sm font-medium">
                      {user.name || (isAdmin ? "Admin" : isHR ? "HR" : "Employee")}
                    </span>
                  </span>
                </Button>
              }
            >
              <DropdownMenuItem href="/profile/me">
                <span className="flex flex-col">
                  <span className="font-medium">My Profile</span>
                  <span className="text-xs text-zinc-500">View your profile</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="border-t border-zinc-100 dark:border-zinc-800 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </span>
              </DropdownMenuItem>
            </DropdownMenu>
            </>
          ) : (
            <Link href="/auth/login">
              <Button variant="default" size="sm" className="gap-2">
                Login
                <User className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}


