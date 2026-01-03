"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/loading-state";
import { toast } from "sonner";
import { User, Building2 } from "lucide-react";

export default function EditEmployeePage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const employeeId = params?.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    employeeId: "",
    department: "",
    designation: "",
    joiningDate: "",
    address: "",
    salary: "",
  });

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  async function fetchEmployee() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/employees/${employeeId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          employeeId: data.employeeId || "",
          department: data.department || "",
          designation: data.designation || "",
          joiningDate: data.joiningDate ? data.joiningDate.split('T')[0] : "",
          address: data.address || "",
          salary: data.salary ? data.salary.toString() : "",
        });
      } else {
        toast.error("Failed to load employee data");
        router.push("/employees");
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
      toast.error("Failed to load employee data");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone || null,
          department: formData.department || null,
          designation: formData.designation || null,
          joiningDate: formData.joiningDate || null,
          address: formData.address || null,
        }),
      });

      if (response.ok) {
        toast.success("Employee updated successfully!");
        router.push(`/employees/${employeeId}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update employee");
      }
    } catch (error) {
      toast.error("Failed to update employee");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AuthGuard requireAuth requireAdmin>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Employee Management</p>
          <h1 className="text-3xl font-semibold">Edit Employee</h1>
          <p className="text-sm text-zinc-500">Update employee information and employment details.</p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Employee Information
              </CardTitle>
              <CardDescription>Update all employee details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-zinc-100 dark:bg-zinc-900"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
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
                    <label className="text-sm font-medium">Employee ID</label>
                    <Input
                      value={formData.employeeId}
                      disabled
                      className="bg-zinc-100 dark:bg-zinc-900"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Employee ID cannot be changed</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Employee address"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Department</label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g., Engineering, Sales, HR"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Designation</label>
                    <Input
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g., Software Engineer, Manager"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Joining Date</label>
                    <Input
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Salary (Monthly)</label>
                    <Input
                      type="number"
                      value={formData.salary}
                      disabled
                      className="bg-zinc-100 dark:bg-zinc-900"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Update salary via Payroll management</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/employees/${employeeId}`)}
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

