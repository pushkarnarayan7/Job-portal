import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { notificationStore } from "@/lib/storage";
import type { LocalNotification } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { cn, timeAgo } from "@/lib/utils";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<LocalNotification[]>(() =>
    notificationStore.getAll()
  );

  const markAllRead = () => {
    notificationStore.markAllRead();
    setNotifications(notificationStore.getAll());
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-slate-500">Updates about your applications and jobs.</p>
        </div>
        {hasUnread && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="mt-6">
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="Notifications about your applications will appear here."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "flex gap-4 border-b border-slate-100 px-5 py-4 last:border-0",
                  !n.read && "bg-primary-50/40"
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    n.read ? "bg-slate-300" : "bg-primary-500"
                  )}
                />
                <div>
                  <p className="font-medium text-slate-900">{n.title}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{n.body}</p>
                  <p className="mt-1 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
