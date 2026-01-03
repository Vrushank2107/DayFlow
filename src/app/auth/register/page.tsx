"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    employeeId: "",
    userType: "EMPLOYEE" as "EMPLOYEE" | "ADMIN",
  });
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    // Password complexity check
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      toast.error("Password must contain uppercase, lowercase, and a number");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || null,
          employeeId: formData.employeeId || null,
          userType: formData.userType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      toast.success("Registration successful! Please login.");
      router.push("/auth/login");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8 py-8">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Join Dayflow</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Create Account</h1>
        <p className="text-sm text-zinc-500 sm:text-base">Sign up to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone (Optional)
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={isLoading}
          />
        </div>

        {formData.userType === "EMPLOYEE" && (
          <div className="space-y-2">
            <label htmlFor="employeeId" className="text-sm font-medium">
              Employee ID
            </label>
            <Input
              id="employeeId"
              type="text"
              placeholder="EMP001 (optional, will be auto-generated if empty)"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              disabled={isLoading}
            />
            <p className="text-xs text-zinc-500">Leave empty to auto-generate</p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <PasswordInput
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <PasswordInput
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="userType" className="text-sm font-medium">
            Account Type
          </label>
          <select
            id="userType"
            value={formData.userType}
            onChange={(e) => setFormData({ ...formData, userType: e.target.value as "EMPLOYEE" | "ADMIN" })}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            disabled={isLoading}
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Admin/HR</option>
          </select>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="pt-4 text-center text-sm text-zinc-500">
        <p>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-indigo-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

