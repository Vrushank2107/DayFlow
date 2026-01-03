"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/loading-state";
import { DollarSign, Calendar, TrendingUp, Plus } from "lucide-react";
import { toast } from "sonner";

type PayrollRecord = {
  id: number;
  userId: number;
  month: number;
  year: number;
  salaryStructure: string | null;
  deductions: number;
  netPay: number;
  createdAt: string;
  updatedAt: string;
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function PayrollPage() {
  const { user, isEmployee, isAdmin } = useAuth();
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Array<{id: number, name: string}>>([]);
  const [formData, setFormData] = useState({
    userId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    salaryStructure: "",
    deductions: "",
    netPay: "",
  });

  useEffect(() => {
    fetchPayroll();
    if (isAdmin) {
      fetchEmployees();
    }
  }, [isAdmin]);

  async function fetchEmployees() {
    try {
      const response = await fetch("/api/employees");
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  }

  async function fetchPayroll() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/payroll");
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error("Error fetching payroll:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreatePayroll(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(formData.userId),
          month: formData.month,
          year: formData.year,
          salaryStructure: formData.salaryStructure || null,
          deductions: parseFloat(formData.deductions) || 0,
          netPay: parseFloat(formData.netPay),
        }),
      });

      if (response.ok) {
        toast.success("Payroll record created successfully!");
        setShowCreateForm(false);
        setFormData({
          userId: "",
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          salaryStructure: "",
          deductions: "",
          netPay: "",
        });
        fetchPayroll();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create payroll record");
      }
    } catch (error) {
      toast.error("Failed to create payroll record");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthGuard requireAuth>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Payroll</p>
            <h1 className="text-3xl font-semibold">Payroll Information</h1>
            <p className="text-sm text-zinc-500">
              {isAdmin 
                ? "View and manage employee payroll records."
                : "View your salary and payroll information (read-only)."}
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="mr-2 h-4 w-4" />
              {showCreateForm ? "Cancel" : "Create Payroll"}
            </Button>
          )}
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {isAdmin && showCreateForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Payroll Record</CardTitle>
                  <CardDescription>Add a new payroll record for an employee</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreatePayroll} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Employee</label>
                        <select
                          value={formData.userId}
                          onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                          required
                        >
                          <option value="">Select Employee</option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Month</label>
                        <select
                          value={formData.month}
                          onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                          required
                        >
                          {monthNames.map((month, index) => (
                            <option key={month} value={index + 1}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Year</label>
                        <Input
                          type="number"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                          min="2020"
                          max="2030"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Net Pay (₹)</label>
                        <Input
                          type="number"
                          value={formData.netPay}
                          onChange={(e) => setFormData({ ...formData, netPay: e.target.value })}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Deductions (₹)</label>
                        <Input
                          type="number"
                          value={formData.deductions}
                          onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Salary Structure</label>
                        <Input
                          value={formData.salaryStructure}
                          onChange={(e) => setFormData({ ...formData, salaryStructure: e.target.value })}
                          placeholder="e.g., Standard + Performance Bonus"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Record"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {records.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <DollarSign className="h-12 w-12 text-zinc-400 mb-4" />
                  <p className="text-lg font-semibold mb-2">No payroll records</p>
                  <p className="text-sm text-zinc-500">
                    {isAdmin 
                      ? "No payroll records found. Create payroll records for employees."
                      : "No payroll records available yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {records.map((record) => (
                  <Card key={record.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {monthNames[record.month - 1]} {record.year}
                          </CardTitle>
                          <CardDescription>
                            {record.salaryStructure || "Standard salary structure"}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            ₹{record.netPay.toLocaleString()}
                          </p>
                          <p className="text-sm text-zinc-500">Net Pay</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-zinc-500">Deductions</p>
                          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                            ₹{record.deductions.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500">Gross Pay</p>
                          <p className="text-lg font-semibold">
                            ₹{(record.netPay + record.deductions).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                          <p className="text-xs text-zinc-500">
                            Last updated: {new Date(record.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {isEmployee && (
              <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40">
                <CardContent className="p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-100">
                    <strong>Note:</strong> Payroll information is read-only. Contact your administrator or HR department for any questions or corrections.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}

