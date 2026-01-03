"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoadingState } from "@/components/loading-state";
import { Edit, Mail, Phone, User, Building2, Calendar, Hash, MapPin, DollarSign, FileText, Lock, Shield } from "lucide-react";
import { SalaryInfo } from "@/components/salary-info";

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
  const [activeTab, setActiveTab] = useState<'resume' | 'private' | 'salary' | 'security'>('private');

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
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">My Profile</p>
          <h1 className="text-3xl font-semibold">Employee Profile</h1>
          <p className="text-sm text-zinc-500">View your profile information.</p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : profile ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Dayflow Employee</p>
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    <CardDescription>
                      {profile.designation || "Employee"}
                      {profile.department && ` · ${profile.department}`}
                    </CardDescription>
                  </div>
                  {profile.employeeId && (
                    <div className="flex items-center gap-3 rounded-full bg-indigo-50 px-4 py-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
                      <Hash className="h-4 w-4" />
                      {profile.employeeId}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm">
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
              </CardContent>
            </Card>

            {/* Action Buttons */}
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

            {/* Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('resume')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'resume'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <FileText className="inline h-4 w-4 mr-2" />
                  Resume
                </button>
                <button
                  onClick={() => setActiveTab('private')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'private'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <User className="inline h-4 w-4 mr-2" />
                  Private Info
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('salary')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'salary'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    <DollarSign className="inline h-4 w-4 mr-2" />
                    Salary Info
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('security')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'security'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <Shield className="inline h-4 w-4 mr-2" />
                  Security
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'private' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Employment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
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
                  </CardContent>
                </Card>

                {profile.salary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Salary Structure
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Monthly Salary</span>
                          <span className="text-sm font-medium">${profile.salary.toLocaleString()}</span>
                        </div>
                        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                          <p>Salary information is managed by HR. Contact your administrator for salary structure details or updates.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'resume' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Resume & Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">About</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">What I love about my job</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm dark:bg-indigo-900/30 dark:text-indigo-300">
                          + Add Skills
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">My interests and hobbies</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Certification</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm dark:bg-indigo-900/30 dark:text-indigo-300">
                          + Add Certification
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'salary' && isAdmin && profile && (
              <SalaryInfo 
                employeeId={profile.id} 
                currentSalary={profile.salary} 
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-zinc-500">Last changed: Never</p>
                      </div>
                      <Button asChild variant="outline">
                        <Link href="/profile/change-password">
                          Change Password
                        </Link>
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-zinc-500">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" disabled>
                        Coming Soon
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
