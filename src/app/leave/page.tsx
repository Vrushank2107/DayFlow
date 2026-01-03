"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/loading-state";
import { toast } from "sonner";
import { Calendar, Clock, CheckCircle, XCircle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type LeaveRequest = {
  id: number;
  userId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: string;
  adminComment: string | null;
  createdAt: string;
  updatedAt: string;
  employeeName?: string;
  employeeEmail?: string;
};

export default function LeavePage() {
  const { user, isEmployee, isAdmin } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [formData, setFormData] = useState({
    leaveType: "Paid",
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  async function fetchLeaves() {
    try {
      setIsLoading(true);
      console.log('Fetching leaves...');
      const response = await fetch("/api/leave");
      console.log('Leave response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Leave data:', data);
        setLeaves(data.leaves || []);
      } else {
        const errorData = await response.json();
        console.error('Leave API error:', errorData);
        toast.error(errorData.error || "Failed to fetch leave requests");
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      toast.error("Failed to fetch leave requests");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Submitting leave request:', formData);
      const response = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log('Leave submission response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Leave submission success:', data);
        toast.success("Leave request submitted successfully!");
        setShowForm(false);
        setFormData({
          leaveType: "Paid",
          startDate: "",
          endDate: "",
          reason: "",
        });
        fetchLeaves();
      } else {
        const error = await response.json();
        console.error('Leave submission error:', error);
        toast.error(error.error || "Failed to submit leave request");
      }
    } catch (error) {
      console.error("Leave submission error:", error);
      toast.error("Failed to submit leave request");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleApproveReject(leaveId: number, status: 'Approved' | 'Rejected', comment?: string) {
    try {
      const response = await fetch(`/api/leave/${leaveId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminComment: comment || null }),
      });

      if (response.ok) {
        toast.success(`Leave request ${status.toLowerCase()} successfully!`);
        fetchLeaves();
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${status.toLowerCase()} leave request`);
      }
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} leave request`);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Approved</Badge>;
      case "Rejected":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Pending</Badge>;
    }
  }

  function getLeaveTypeColor(type: string) {
    switch (type) {
      case "Paid":
        return "text-blue-600 dark:text-blue-400";
      case "Sick":
        return "text-red-600 dark:text-red-400";
      case "Unpaid":
        return "text-zinc-600 dark:text-zinc-400";
      default:
        return "text-zinc-600 dark:text-zinc-400";
    }
  }

  return (
    <AuthGuard requireAuth>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Leave Management</p>
            <h1 className="text-3xl font-semibold">Leave Requests</h1>
            <p className="text-sm text-zinc-500">
              {isAdmin 
                ? "View and manage all leave requests."
                : "Apply for leave and track your leave requests."}
            </p>
          </div>
          {isEmployee && (
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-2 h-4 w-4" />
              {showForm ? "Cancel" : "Apply for Leave"}
            </Button>
          )}
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {isEmployee && showForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Apply for Leave</CardTitle>
                  <CardDescription>Submit a new leave request</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Leave Type</label>
                      <select
                        value={formData.leaveType}
                        onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                        required
                      >
                        <option value="Paid">Paid Leave</option>
                        <option value="Sick">Sick Leave</option>
                        <option value="Unpaid">Unpaid Leave</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Start Date</label>
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">End Date</label>
                        <Input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Reason (Optional)</label>
                      <Textarea
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        placeholder="Please provide a reason for your leave request..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Request"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Leave Requests</CardTitle>
                    <CardDescription>
                      {isAdmin ? "All leave requests" : "Your leave requests"}
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
                        <Button
                          key={status}
                          variant={statusFilter === status ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setStatusFilter(status)}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const filteredLeaves = statusFilter === 'All' 
                    ? leaves 
                    : leaves.filter(l => l.status === statusFilter);
                  
                  return filteredLeaves.length === 0 ? (
                    <p className="text-center text-zinc-500 py-4">No leave requests found</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredLeaves.map((leave) => (
                      <div
                        key={leave.id}
                        className="flex items-start justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-800"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="h-5 w-5 text-indigo-500" />
                            <div>
                              {isAdmin && leave.employeeName && (
                                <p className="font-medium text-sm">{leave.employeeName}</p>
                              )}
                              <p className="font-medium">
                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                              </p>
                              <p className={`text-sm ${getLeaveTypeColor(leave.leaveType)}`}>
                                {leave.leaveType} Leave
                              </p>
                            </div>
                          </div>
                          {leave.reason && (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                              {leave.reason}
                            </p>
                          )}
                          {leave.adminComment && (
                            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                              <strong>Admin Comment:</strong> {leave.adminComment}
                            </p>
                          )}
                          <p className="text-xs text-zinc-500 mt-2">
                            Submitted: {new Date(leave.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(leave.status)}
                          {isAdmin && leave.status === 'Pending' && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                                onClick={() => handleApproveReject(leave.id, 'Approved')}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                                onClick={() => handleApproveReject(leave.id, 'Rejected')}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AuthGuard>
  );
}

