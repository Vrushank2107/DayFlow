"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/loading-state";
import { Edit, Mail, Phone, User, Building2, Calendar, Hash, MapPin, DollarSign } from "lucide-react";

type Profile = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  employeeId: string | null;
  department: string | null;
  designation: string | null;
  joiningDate: string | null;
  userType: string;
  address: string | null;
  salary: number | null;
  createdAt: string;
};

export default function MyProfilePage() {
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/employee/profile");
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  return (
    <AuthGuard requireAuth>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">My Profile</p>
            <h1 className="text-3xl font-semibold">Employee Profile</h1>
            <p className="text-sm text-zinc-500">View your profile information.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/profile/edit">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/profile/change-password">
                Change Password
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : profile ? (
          <>
            <Card className="rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Dayflow Employee</p>
                  <h1 className="text-3xl font-semibold">{profile.name}</h1>
                  <p className="text-sm text-zinc-500">
                    {profile.designation || "Employee"}
                    {profile.department && ` · ${profile.department}`}
                  </p>
                </div>
                {profile.employeeId && (
                  <div className="flex items-center gap-3 rounded-full bg-indigo-50 px-4 py-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
                    <Hash className="h-4 w-4" />
                    {profile.employeeId}
                  </div>
                )}
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                {profile.phone && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
                    <Phone className="h-4 w-4" />
                    {profile.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </span>
                {profile.department && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
                    <Building2 className="h-4 w-4" />
                    {profile.department}
                  </span>
                )}
                {profile.joiningDate && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(profile.joiningDate).toLocaleDateString()}
                  </span>
                )}
                {profile.address && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-900/70">
                    <MapPin className="h-4 w-4" />
                    {profile.address}
                  </span>
                )}
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <section>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </h2>
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-500">Full Name</span>
                        <span className="text-sm font-medium">{profile.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-500">Email</span>
                        <span className="text-sm font-medium">{profile.email}</span>
                      </div>
                      {profile.phone && (
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Phone</span>
                          <span className="text-sm font-medium">{profile.phone}</span>
                        </div>
                      )}
                      {profile.address && (
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Address</span>
                          <span className="text-sm font-medium">{profile.address}</span>
                        </div>
                      )}
                      {profile.employeeId && (
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Employee ID</span>
                          <span className="text-sm font-medium">{profile.employeeId}</span>
                        </div>
                      )}
                    </div>
                  </section>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4 pt-6">
                  <section>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Employment Information
                    </h2>
                    <div className="mt-4 space-y-3">
                      {profile.department && (
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Department</span>
                          <span className="text-sm font-medium">{profile.department}</span>
                        </div>
                      )}
                      {profile.designation && (
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Designation</span>
                          <span className="text-sm font-medium">{profile.designation}</span>
                        </div>
                      )}
                      {profile.joiningDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Joining Date</span>
                          <span className="text-sm font-medium">
                            {new Date(profile.joiningDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-500">Account Type</span>
                        <span className="text-sm font-medium">{profile.userType}</span>
                      </div>
                    </div>
                  </section>
                </CardContent>
              </Card>

              {profile.salary && (
                <Card>
                  <CardContent className="space-y-4 pt-6">
                    <section>
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Salary Structure
                      </h2>
                      <div className="mt-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Monthly Salary</span>
                          <span className="text-sm font-medium">${profile.salary.toLocaleString()}</span>
                        </div>
                        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                          <p>Salary information is managed by HR. Contact your administrator for salary structure details or updates.</p>
                        </div>
                      </div>
                    </section>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-zinc-500">Failed to load profile.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}
