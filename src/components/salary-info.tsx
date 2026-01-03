"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";

interface SalaryInfoProps {
  employeeId?: number;
  currentSalary: number | null;
  isAdmin: boolean;
}

interface SalaryComponent {
  name: string;
  type: 'Basic' | 'HRA' | 'Standard Allowance' | 'Performance Bonus' | 'LTA' | 'Fixed Allowance';
  computationType: 'Fixed Amount' | 'Percentage of Wage' | 'Percentage of Basic';
  value: number;
  amount: number;
  description: string;
}

export function SalaryInfo({ currentSalary, isAdmin }: SalaryInfoProps) {
  const [wage, setWage] = useState<number>(currentSalary || 50000);
  const [workingDays, setWorkingDays] = useState<number>(5);
  const [breakTime, setBreakTime] = useState<string>("1 hour");
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [pfRate] = useState<number>(12.0);
  const [professionalTax] = useState<number>(200.0);

  const calculateComponents = () => {
    // Default component structure
    const basicAmount = wage * 0.5; // 50% of wage
    const hraAmount = basicAmount * 0.5; // 50% of basic
    const standardAllowance = 4167; // Fixed
    const performanceBonus = basicAmount * 0.0833; // 8.33% of basic
    const lta = basicAmount * 0.0833; // 8.33% of basic
    const totalOtherComponents = hraAmount + standardAllowance + performanceBonus + lta;
    const fixedAllowance = wage - totalOtherComponents - basicAmount;

    setComponents([
      {
        name: "Basic Salary",
        type: "Basic",
        computationType: "Percentage of Wage",
        value: 50.0,
        amount: basicAmount,
        description: "Define Basic salary from company cost compute it based on monthly Wages.",
      },
      {
        name: "House Rent Allowance",
        type: "HRA",
        computationType: "Percentage of Basic",
        value: 50.0,
        amount: hraAmount,
        description: "HRA provided to employees 50% of the basic salary.",
      },
      {
        name: "Standard Allowance",
        type: "Standard Allowance",
        computationType: "Fixed Amount",
        value: 4167,
        amount: standardAllowance,
        description: "A standard allowance is a predetermined, fixed amount provided to employee. as part of their salary.",
      },
      {
        name: "Performance Bonus",
        type: "Performance Bonus",
        computationType: "Percentage of Basic",
        value: 8.33,
        amount: performanceBonus,
        description: "Variable amount paid during payroll. The value defined by the company and calculated as a % of the basic salary.",
      },
      {
        name: "Leave Travel Allowance",
        type: "LTA",
        computationType: "Percentage of Basic",
        value: 8.33,
        amount: lta,
        description: "LTA is paid by the company to employees to cover their travel expenses. and calculated as a % of the basic salary.",
      },
      {
        name: "Fixed Allowance",
        type: "Fixed Allowance",
        computationType: "Fixed Amount",
        value: fixedAllowance,
        amount: fixedAllowance,
        description: "fixed allowance portion of wages is determined after calculating all salary components.",
      },
    ]);
  };

  useEffect(() => {
    calculateComponents();
  }, [wage]);

  const basicSalary = components.find(c => c.type === 'Basic')?.amount || 0;
  const employeePF = basicSalary * (pfRate / 100);
  const employerPF = basicSalary * (pfRate / 100);
  const grossSalary = components.reduce((sum, c) => sum + c.amount, 0);
  const totalDeductions = employeePF + professionalTax;
  const netPay = grossSalary - totalDeductions;

  return (
    <div className="space-y-6">
      {/* Wage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Wage Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-500">Month Wage</label>
              {isAdmin ? (
                <Input
                  type="number"
                  value={wage}
                  onChange={(e) => setWage(parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              ) : (
                <p className="text-lg font-semibold mt-1">{wage.toLocaleString()} ₹ / Month</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-500">Yearly Wage</label>
              <p className="text-lg font-semibold mt-1">{(wage * 12).toLocaleString()} ₹ / Yearly</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-500">No of working days in a week</label>
              {isAdmin ? (
                <Input
                  type="number"
                  value={workingDays}
                  onChange={(e) => setWorkingDays(parseInt(e.target.value) || 5)}
                  className="mt-1"
                  min={1}
                  max={7}
                />
              ) : (
                <p className="text-lg font-semibold mt-1">{workingDays} days</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-500">Break Time</label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={breakTime}
                  onChange={(e) => setBreakTime(e.target.value)}
                  className="mt-1"
                  placeholder="e.g., 1 hour"
                />
              ) : (
                <p className="text-lg font-semibold mt-1">{breakTime}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Components */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {components.map((component, index) => (
            <div key={index} className="border-b border-zinc-200 dark:border-zinc-800 pb-4 last:border-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold">{component.name}</h3>
                  <p className="text-sm text-zinc-500 mt-1">{component.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">₹{component.amount.toFixed(2)} / month</p>
                  <p className="text-sm text-zinc-500">
                    {component.computationType === 'Percentage of Wage' || component.computationType === 'Percentage of Basic'
                      ? `${component.value}%`
                      : 'Fixed'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Gross Salary</span>
              <span className="text-xl font-bold">{grossSalary.toFixed(2)} ₹ / month</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PF Contribution */}
      <Card>
        <CardHeader>
          <CardTitle>Provident Fund (PF) Contribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold">Employee</h3>
              <p className="text-sm text-zinc-500 mt-1">PF is calculated based on the basic salary.</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">{employeePF.toFixed(2)} ₹ / month</p>
              <p className="text-sm text-zinc-500">{pfRate}%</p>
            </div>
          </div>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold">Employer</h3>
              <p className="text-sm text-zinc-500 mt-1">PF is calculated based on the basic salary.</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">{employerPF.toFixed(2)} ₹ / month</p>
              <p className="text-sm text-zinc-500">{pfRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Deductions */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Deductions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold">Professional Tax</h3>
              <p className="text-sm text-zinc-500 mt-1">Professional Tax deducted from the Gross salary.</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">{professionalTax.toFixed(2)} ₹ / month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Gross Salary</span>
              <span className="font-semibold">{grossSalary.toFixed(2)} ₹</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Total Deductions</span>
              <span className="font-semibold text-red-600 dark:text-red-400">-{totalDeductions.toFixed(2)} ₹</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-indigo-200 dark:border-indigo-800">
              <span className="text-lg font-semibold">Net Pay</span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{netPay.toFixed(2)} ₹</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


