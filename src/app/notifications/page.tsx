"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { Bell, CheckCircle, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function markAsRead(notificationId: number) {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, read: true }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  async function markAllAsRead() {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }

  function getIcon(type: string) {
    switch (type) {
      case "LEAVE_UPDATE":
        return <CheckCircle className="h-4 w-4" />;
      case "ATTENDANCE_REMINDER":
        return <Clock className="h-4 w-4" />;
      case "PAYROLL_UPDATE":
        return <TrendingUp className="h-4 w-4" />;
      case "SYSTEM":
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  }

  return (
    <AuthGuard requireAuth>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Notifications</p>
            <h1 className="text-3xl font-semibold">Notifications</h1>
            <p className="text-sm text-zinc-500">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              Mark All as Read
            </Button>
          )}
        </div>

        {isLoading ? (
          <LoadingState />
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-zinc-400 mb-4" />
              <p className="text-lg font-semibold mb-2">No notifications</p>
              <p className="text-sm text-zinc-500">You're all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={notification.read ? "opacity-60" : ""}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{notification.title}</p>
                        {notification.message && (
                          <p className="text-sm text-zinc-500 mt-1">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-zinc-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                    {notification.link && (
                      <Link href={notification.link}>
                        <Button variant="outline" size="sm" className="mt-2">
                          View
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

