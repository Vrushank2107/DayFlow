"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/loading-state";
import { ArrowLeft, Save, User, Building2, Calendar, DollarSign, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

type Employee = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  employeeId: string | null;
  department: string | null;
  designation: string | null;
  joiningDate: string | null;
  address: string | null;
  salary: number | null;
  createdAt: string;
};

export default function EditEmployeePage() {
  const { user, isAdmin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const employeeId = params.id as string;

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  async function fetchEmployee() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dashboard/employee/${employeeId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Employee not found");
        } else if (response.status === 403) {
          setError("Access denied");
        } else {
          setError("Failed to fetch employee data");
        }
        return;
      }

      const data = await response.json();
      setEmployee(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        employeeId: data.employeeId || "",
        department: data.department || "",
        designation: data.designation || "",
        joiningDate: data.joiningDate ? new Date(data.joiningDate).toISOString().split('T')[0] : "",
        address: data.address || "",
        salary: data.salary ? data.salary.toString() : "",
      });
    } catch (error) {
      console.error("Error fetching employee:", error);
      setError("Failed to fetch employee data");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!isAdmin) {
      setError("Only admins can edit employee profiles");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/dashboard/employee/${employeeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          employeeId: formData.employeeId || null,
          department: formData.department || null,
          designation: formData.designation || null,
          joiningDate: formData.joiningDate || null,
          address: formData.address || null,
          salary: formData.salary ? parseFloat(formData.salary) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update employee");
        return;
      }

      toast.success("Employee updated successfully!");
      router.push(`/dashboard/employee/${employeeId}`);
    } catch (error) {
      console.error("Error updating employee:", error);
      setError("Failed to update employee");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleInputChange(field: string, value: string) {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }

  if (isLoading) {
    return (
      <AuthGuard requireAuth requireAdmin>
        <LoadingState />
      </AuthGuard>
    );
  }

  if (error || !employee) {
    return (
      <AuthGuard requireAuth requireAdmin>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/employee/${employeeId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-zinc-400 mb-4" />
              <p className="text-lg font-semibold mb-2">Error</p>
              <p className="text-sm text-zinc-500">{error || "Employee not found"}</p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth requireAdmin>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/employee/${employeeId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Edit Employee Profile
            </CardTitle>
            <CardDescription>
              Update employee information for {employee.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="employeeId" className="text-sm font-medium">
                      Employee ID
                    </label>
                    <Input
                      id="employeeId"
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange("employeeId", e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="address" className="text-sm font-medium">
                      Address
                    </label>
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Work Information
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="department" className="text-sm font-medium">
                      Department
                    </label>
                    <Input
                      id="department"
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="designation" className="text-sm font-medium">
                      Designation
                    </label>
                    <Input
                      id="designation"
                      type="text"
                      value={formData.designation}
                      onChange={(e) => handleInputChange("designation", e.target.value)}
                      disabled={isSubmitting}
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
                      onChange={(e) => handleInputChange("joiningDate", e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="salary" className="text-sm font-medium">
                      Annual Salary (₹)
                    </label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) => handleInputChange("salary", e.target.value)}
                      disabled={isSubmitting}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                
                <Button type="button" variant="outline" asChild disabled={isSubmitting}>
                  <Link href={`/dashboard/employee/${employeeId}`}>
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
