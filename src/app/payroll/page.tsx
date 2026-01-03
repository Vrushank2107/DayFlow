"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/loading-state";
import { DollarSign, Calendar, TrendingUp } from "lucide-react";

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

  useEffect(() => {
    fetchPayroll();
  }, []);

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

  return (
    <AuthGuard requireAuth>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Payroll</p>
          <h1 className="text-3xl font-semibold">Payroll Information</h1>
          <p className="text-sm text-zinc-500">
            {isAdmin 
              ? "View and manage employee payroll records."
              : "View your salary and payroll information (read-only)."}
          </p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <>
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
                            ${record.netPay.toLocaleString()}
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
                            ${record.deductions.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500">Gross Pay</p>
                          <p className="text-lg font-semibold">
                            ${(record.netPay + record.deductions).toLocaleString()}
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

