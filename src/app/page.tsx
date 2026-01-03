"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, Clock, DollarSign, Users, FileText, Shield } from "lucide-react";
import { MotionSection } from "@/components/motion-section";

export default function Home() {
  const { user, isAuthenticated, isLoading: authLoading, isEmployee, isAdmin } = useAuth();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <MotionSection className="rounded-3xl border border-white/40 bg-gradient-to-br from-white/95 to-white/80 p-12 shadow-2xl shadow-indigo-300/20 backdrop-blur-xl dark:from-zinc-950/95 dark:to-zinc-900/85 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          {isAuthenticated && (
            <div className="flex items-center gap-3 pb-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
              <div className="rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-3 dark:from-indigo-900/30 dark:to-purple-900/30">
                {isAdmin ? (
                  <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                  Welcome back, {user?.name || (isAdmin ? 'Admin' : 'Employee')}!
                </h2>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                  {isAdmin 
                    ? "Manage your workforce and HR operations"
                    : "Access your attendance, leave, and payroll information"}
                </p>
              </div>
            </div>
          )}

          {/* Website Info Section */}
          <div className="space-y-6 text-center">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-indigo-500 font-semibold mb-4">Dayflow</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-zinc-900 via-indigo-900 to-zinc-900 bg-clip-text text-transparent dark:from-white dark:via-indigo-200 dark:to-white mb-4">
                Human Resource Management System
              </h1>
              <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl mx-auto">
                Streamline your HR operations with attendance tracking, leave management, payroll processing, and employee management all in one place.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap gap-3 justify-center">
              {isAuthenticated ? (
                <Button size="lg" className="min-w-[180px] h-12 text-base" asChild>
                  <Link href={isAdmin ? "/admin" : "/dashboard"}>
                    {isAdmin ? "Admin Dashboard" : "My Dashboard"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="min-w-[200px] h-12 text-base" asChild>
                  <Link href="/auth/login">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Features Section */}
      <MotionSection delay={0.1} className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Attendance Management",
            description: "Track employee check-ins and check-outs with daily and weekly views.",
            icon: <Clock className="h-5 w-5 text-indigo-500" />,
          },
          {
            title: "Leave Management",
            description: "Apply for leave, approve requests, and automatically update attendance.",
            icon: <Calendar className="h-5 w-5 text-indigo-500" />,
          },
          {
            title: "Payroll Processing",
            description: "Manage employee salaries, deductions, and generate payroll reports.",
            icon: <DollarSign className="h-5 w-5 text-indigo-500" />,
          },
        ].map((feature) => (
          <Card key={feature.title} className="group hover:border-indigo-300 dark:hover:border-indigo-700">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 p-3 text-indigo-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 dark:from-indigo-500/10 dark:to-purple-500/10">
                {feature.icon}
              </div>
              <CardTitle className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </MotionSection>

      {/* Additional Info */}
      <MotionSection delay={0.2} className="rounded-3xl border border-white/40 bg-gradient-to-br from-zinc-900 via-indigo-900 to-purple-800 p-10 md:p-12 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl dark:border-zinc-800">
        <div className="space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Comprehensive HR Solution</h2>
            <p className="text-zinc-100 text-lg max-w-2xl">
              Everything you need to manage your workforce efficiently, from employee onboarding to payroll processing.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 transition-all duration-300 hover:bg-white/15 hover:scale-105 border border-white/10">
              <p className="text-xs uppercase tracking-[0.3em] text-white/90 font-semibold mb-3">Employee Management</p>
              <p className="text-2xl md:text-3xl font-bold text-white">Complete Profiles</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 transition-all duration-300 hover:bg-white/15 hover:scale-105 border border-white/10">
              <p className="text-xs uppercase tracking-[0.3em] text-white/90 font-semibold mb-3">Role-Based Access</p>
              <p className="text-2xl md:text-3xl font-bold text-white">Secure & Controlled</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 transition-all duration-300 hover:bg-white/15 border border-white/10">
              <p className="text-xs uppercase tracking-[0.3em] text-white/90 font-semibold mb-3">Real-time Updates</p>
              <p className="text-2xl md:text-3xl font-bold text-white">Always Current</p>
            </div>
          </div>
        </div>
      </MotionSection>
    </div>
  );
}
