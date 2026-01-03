import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { requireAuth, getAuthenticatedUser } from "@/lib/api-auth";

export async function GET() {
  try {
    const authError = await requireAuth();
    if (authError) {
      return authError;
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = database
      .prepare(
        `SELECT * FROM notifications 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT 50`
      )
      .all(currentUser.userId) as Array<{
        notification_id: number;
        user_id: number;
        type: string;
        title: string;
        message: string | null;
        link: string | null;
        read: number | boolean;
        created_at: string;
      }>;

    const unreadCount = database
      .prepare(
        `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0`
      )
      .get(currentUser.userId) as { count: number };

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.notification_id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        read: !!n.read,
        createdAt: n.created_at,
      })),
      unreadCount: unreadCount.count || 0,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authError = await requireAuth();
    if (authError) {
      return authError;
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, read } = body as { notificationId?: number; read?: boolean };

    if (notificationId) {
      database
        .prepare(
          `UPDATE notifications SET read = ? WHERE notification_id = ? AND user_id = ?`
        )
        .run(read ? 1 : 0, notificationId, currentUser.userId);
    } else if (typeof read === "boolean") {
      database
        .prepare(`UPDATE notifications SET read = ? WHERE user_id = ?`)
        .run(read ? 1 : 0, currentUser.userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 },
    );
  }
}