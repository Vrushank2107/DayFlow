"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/loading-state";
import { Building2, User } from "lucide-react";

type AuthGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireHR?: boolean;
  requireEmployee?: boolean;
  redirectTo?: string;
};

export function AuthGuard({
  children,
  requireAuth = false,
  requireAdmin = false,
  requireHR = false,
  requireEmployee = false,
  redirectTo,
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated, isEmployee, isAdmin, isHR } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      if (redirectTo) {
        router.push(redirectTo);
      }
    }
  }, [isLoading, isAuthenticated, requireAuth, redirectTo, router]);

  if (isLoading) {
    return <LoadingState />;
  }

  // Not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <User className="h-5 w-5" />
              You haven't registered yet
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              Please register or sign in to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/auth/register">
                  <User className="mr-2 h-4 w-4" />
                  Register
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Require Admin/HR but user is neither Admin nor HR (unified access)
  if (requireAdmin && !isAdmin && !isHR) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <Building2 className="h-5 w-5" />
              Admin/HR account required
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              This page is only available for admin and HR accounts. Please contact your administrator to access this feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {isEmployee && (
                <Button asChild variant="outline">
                  <Link href="/dashboard">View Employee Section</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Require HR but user is not HR
  if (requireHR && !isHR) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <Building2 className="h-5 w-5" />
              HR account required
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              This page is only available for HR accounts. Please contact your HR department to access this feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {isAdmin && (
                <Button asChild variant="outline">
                  <Link href="/admin">View Admin Dashboard</Link>
                </Button>
              )}
              {isEmployee && (
                <Button asChild variant="outline">
                  <Link href="/dashboard">View Employee Section</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Require Employee but user is not Employee
  if (requireEmployee && !isEmployee) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <User className="h-5 w-5" />
              Employee account required
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              This page is only available for employee accounts. Please use an employee account to access this feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {isAdmin && (
                <Button asChild variant="outline">
                  <Link href="/admin">View Admin Dashboard</Link>
                </Button>
              )}
              {isHR && (
                <Button asChild variant="outline">
                  <Link href="/hr">View HR Dashboard</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

