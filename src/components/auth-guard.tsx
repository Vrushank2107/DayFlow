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
  requireEmployee?: boolean;
  redirectTo?: string;
};

export function AuthGuard({
  children,
  requireAuth = false,
  requireAdmin = false,
  requireEmployee = false,
  redirectTo,
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated, isEmployee, isAdmin } = useAuth();
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

  // Require Admin but user is Employee
  if (requireAdmin && isEmployee) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <Building2 className="h-5 w-5" />
              Admin account required
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              This page is only available for admin accounts. Please contact your administrator to access this feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/dashboard">View Employee Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Require Employee but user is Admin
  if (requireEmployee && isAdmin) {
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
              <Button asChild variant="outline">
                <Link href="/admin">View Admin Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

