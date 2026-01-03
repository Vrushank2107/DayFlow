"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-client";
import { toast } from "sonner";

export default function HREmployeeCreationPage() {
  const router = useRouter();
  const { user, isAdmin, isHR } = useAuth();
  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    joiningDate: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState<any>(null);

  // Determine the correct dashboard URL based on user type
  const getDashboardUrl = () => {
    if (isHR || isAdmin) return '/admin'; // Unified admin dashboard
    return '/dashboard'; // fallback
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/employees/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create employee");
        return;
      }

      setCreatedEmployee(data.employee);
      toast.success("Employee created successfully! Login ID and password generated.");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      companyName: "",
      name: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      joiningDate: new Date().toISOString().split('T')[0],
    });
    setCreatedEmployee(null);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">HR Management</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Create New Employee</h1>
        <p className="text-sm text-zinc-500 sm:text-base">
          Add a new employee to the system. Login ID and password will be auto-generated.
        </p>
      </div>

      {!createdEmployee ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium">
                Company Name
              </label>
              <Input
                id="companyName"
                type="text"
                placeholder="Dayflow Inc."
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

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
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone
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

            <div className="space-y-2">
              <label htmlFor="department" className="text-sm font-medium">
                Department
              </label>
              <Input
                id="department"
                type="text"
                placeholder="Engineering"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="position" className="text-sm font-medium">
                Position
              </label>
              <Input
                id="position"
                type="text"
                placeholder="Software Engineer"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="joiningDate" className="text-sm font-medium">
                Joining Date
              </label>
              <Input
                id="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Employee..." : "Create Employee"}
          </Button>
        </form>
      ) : (
        <div className="space-y-6 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-600">Employee Created Successfully!</h2>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-zinc-500">Employee Name</p>
                <p className="text-base font-semibold">{createdEmployee.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Email</p>
                <p className="text-base">{createdEmployee.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Login ID</p>
                <p className="text-base font-mono font-semibold text-indigo-600">{createdEmployee.employeeId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">System Password</p>
                <p className="text-base font-mono font-semibold text-red-600">{createdEmployee.systemPassword}</p>
              </div>
            </div>

            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                ⚠️ Important: Share these credentials securely with the employee. 
                They will need to use this Login ID and password for their first login, 
                after which they can change their password.
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button onClick={resetForm} variant="outline" className="flex-1">
              Create Another Employee
            </Button>
            <Button onClick={() => router.push(getDashboardUrl())} className="flex-1">
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}

      <div className="pt-4 text-center text-sm text-zinc-500">
        <Link href={getDashboardUrl()} className="font-medium text-indigo-500 hover:underline">
          ← Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}
