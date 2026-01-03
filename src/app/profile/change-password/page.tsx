"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Key, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-client";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success("Password changed successfully!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to change password");
      }
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <AuthGuard requireAuth>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Security</p>
          <h1 className="text-3xl font-semibold">Change Password</h1>
          <p className="text-sm text-zinc-500">Update your password to keep your account secure.</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Use a strong password you haven't used elsewhere.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Current Password</label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-zinc-500 mt-1">Must be at least 8 characters</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>Manage your account security.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleLogout} className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
