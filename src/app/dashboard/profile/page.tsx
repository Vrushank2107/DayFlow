"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    // Password complexity check
    const hasUpperCase = /[A-Z]/.test(formData.newPassword);
    const hasLowerCase = /[a-z]/.test(formData.newPassword);
    const hasNumber = /[0-9]/.test(formData.newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      toast.error("Password must contain uppercase, lowercase, and a number");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to change password");
        return;
      }

      toast.success("Password changed successfully!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8 py-8">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Account Settings</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Change Password</h1>
        <p className="text-sm text-zinc-500 sm:text-base">
          Update your account password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="currentPassword" className="text-sm font-medium">
            Current Password
          </label>
          <PasswordInput
            id="currentPassword"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium">
            New Password
          </label>
          <PasswordInput
            id="newPassword"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm New Password
          </label>
          <PasswordInput
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 dark:bg-blue-900/20 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Password Requirements:</strong><br/>
            • At least 8 characters long<br/>
            • Contains uppercase letters (A-Z)<br/>
            • Contains lowercase letters (a-z)<br/>
            • Contains numbers (0-9)
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Changing Password..." : "Change Password"}
        </Button>
      </form>
    </div>
  );
}
