"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/loading-state";
import { toast } from "sonner";
import { User } from "lucide-react";

export default function EditProfilePage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/employee/profile");
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || "",
            phone: data.phone || "",
            address: data.address || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/employee/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        router.push("/profile/me");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AuthGuard requireAuth>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Profile & Settings</p>
          <h1 className="text-3xl font-semibold">Edit Profile</h1>
          <p className="text-sm text-zinc-500">
            {isAdmin 
              ? "Update employee profile information (admin can edit all fields via employees page)."
              : "Update your profile information. Limited fields are editable."}
          </p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Your address"
                  />
                </div>

                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                  <p className="font-semibold mb-1">Note</p>
                  <p>
                    {isAdmin 
                      ? "As an admin, you can edit all employee fields including department, designation, and joining date from the Employees page."
                      : "You can only edit your name, phone number, and address. Contact your administrator to update department, designation, or other employment details."}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/profile/me")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}
