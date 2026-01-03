"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserCheck, Shield, Check, X, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // HR/Admin registration form state
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "ADMIN", // Unified Admin/HR role
  });

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation rules
  const validatePassword = (password: string) => {
    const rules = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    const isValid = Object.values(rules).every(Boolean);
    return { rules, isValid };
  };

  const passwordValidation = validatePassword(adminData.password);
  const showPasswordRules = adminData.password.length > 0 && !passwordValidation.isValid;

  // Handle HR/Admin registration
  async function handleAdminRegistration(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    if (adminData.password !== adminData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error("Password does not meet security requirements");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: adminData.name,
          email: adminData.email,
          phone: adminData.phone,
          password: adminData.password,
          userType: adminData.userType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to register");
        return;
      }

      toast.success(`${adminData.userType} registered successfully!`);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8 py-8">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Registration</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Admin Registration</h1>
        <p className="text-sm text-zinc-500 sm:text-base">
          Register as an Administrator with HR capabilities
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Admin Registration
          </CardTitle>
          <CardDescription>
            Register as an Admin user with full system management and HR capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminRegistration} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminName">Full Name</Label>
                <Input
                  id="adminName"
                  type="text"
                  value={adminData.name}
                  onChange={(e) => setAdminData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminData.email}
                  onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="admin@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminPhone">Phone (Optional)</Label>
                <Input
                  id="adminPhone"
                  type="tel"
                  value={adminData.phone}
                  onChange={(e) => setAdminData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1234567890"
                />
              </div>
              <div className="space-y-2">
                {/* Empty space to maintain grid layout */}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password</Label>
                <div className="relative">
                  <Input
                    id="adminPassword"
                    type={showPassword ? "text" : "password"}
                    value={adminData.password}
                    onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    placeholder="Enter secure password"
                    className={showPasswordRules ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-zinc-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-zinc-500" />
                    )}
                  </Button>
                </div>
                
                {/* Password Security Rules - Only show when password is entered and invalid */}
                {showPasswordRules && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 relative z-10">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                      Password must meet all requirements:
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        {passwordValidation.rules.length ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <X className="h-3 w-3 text-red-600" />
                        )}
                        <span className={passwordValidation.rules.length ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordValidation.rules.uppercase ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <X className="h-3 w-3 text-red-600" />
                        )}
                        <span className={passwordValidation.rules.uppercase ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordValidation.rules.lowercase ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <X className="h-3 w-3 text-red-600" />
                        )}
                        <span className={passwordValidation.rules.lowercase ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                          One lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordValidation.rules.number ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <X className="h-3 w-3 text-red-600" />
                        )}
                        <span className={passwordValidation.rules.number ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                          One number
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordValidation.rules.special ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <X className="h-3 w-3 text-red-600" />
                        )}
                        <span className={passwordValidation.rules.special ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                          One special character (!@#$%^&* etc.)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminConfirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="adminConfirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={adminData.confirmPassword}
                    onChange={(e) => setAdminData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    placeholder="Confirm password"
                    className={adminData.confirmPassword && adminData.password !== adminData.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-zinc-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-zinc-500" />
                    )}
                  </Button>
                </div>
                {adminData.confirmPassword && adminData.password !== adminData.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100">System Access</p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Admin users have full system access including employee management, payroll, HR functions, and system settings.
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Registering..." : "Register as Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center space-y-4">
        <div className="text-sm text-zinc-500">
          <p>
            Need to create employee accounts?{" "}
            <span className="font-medium">Contact your system administrator</span>
          </p>
        </div>
        <Link 
          href="/auth/login" 
          className="text-sm text-indigo-500 hover:underline"
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}

