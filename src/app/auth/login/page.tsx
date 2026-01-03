"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState<"email" | "loginId">("email");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          [loginType]: loginType === "email" ? loginId : loginId,
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Login failed");
        return;
      }

      toast.success("Login successful");
      
      // Force a full page redirect to ensure auth state is refreshed
      window.location.href = data.redirectUrl || '/';
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8 py-8">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Welcome to Dayflow</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Login</h1>
        <p className="text-sm text-zinc-500 sm:text-base">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Login Type</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="email"
                checked={loginType === "email"}
                onChange={(e) => setLoginType(e.target.value as "email")}
                className="mr-2"
                disabled={isLoading}
              />
              Email
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="loginId"
                checked={loginType === "loginId"}
                onChange={(e) => setLoginType(e.target.value as "loginId")}
                className="mr-2"
                disabled={isLoading}
              />
              Login ID
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor={loginType} className="text-sm font-medium">
            {loginType === "email" ? "Email" : "Login ID"}
          </label>
          <Input
            id={loginType}
            type={loginType === "email" ? "email" : "text"}
            placeholder={loginType === "email" ? "you@example.com" : "e.g., OITODO20220001"}
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <div className="pt-4 text-center text-sm text-zinc-500">
        <p>
          Don't have an account?{" "}
          <Link href="/auth/register" className="font-medium text-indigo-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
