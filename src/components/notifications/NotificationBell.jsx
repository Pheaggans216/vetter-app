import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function NotificationBell() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const panelRef = useRef();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.email],
    queryFn: () =>
      base44.entities.Notification.filter(
        { recipient_email: user?.email },
        "-created_date",
        30
      ),
    enabled: !!user?.email,
    refetchInterval: 30000,
  });

  // Real-time subscription + toast alerts
  useEffect(() => {
    if (!user?.email) return;
    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.type === "create" && event.data?.recipient_email === user.email) {
        queryClient.invalidateQueries({ queryKey: ["notifications", user.email] });

        const n = event.data;
        const isMessage = n.type === "new_message";
        const emoji = isMessage ? "💬" : "🔔";

        toast(
          <div className="flex items-start gap-2.5">
            <span className="text-[16px] shrink-0 mt-0.5">{emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground leading-snug">{n.title}</p>
              {n.body && <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
            </div>
          </div>,
          {
            duration: 5000,
            action: n.link ? {
              label: "View",
              onClick: () => navigate(n.link),
            } : undefined,
          }
        );
      }
    });
    return unsub;
  }, [user?.email]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter((n) => !n.read);

  const markAllRead = async () => {
    for (const n of unread) {
      await base44.entities.Notification.update(n.id, { read: true });
    }
    queryClient.invalidateQueries({ queryKey: ["notifications", user?.email] });
  };

  const handleClick = async (n) => {
    if (!n.read) {
      await base44.entities.Notification.update(n.id, { read: true });
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.email] });
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 rounded-xl bg-card border border-border/60 flex items-center justify-center hover:bg-muted/50 transition-colors"
      >
        <Bell className="w-4 h-4 text-foreground" />
        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
            <span className="text-[9px] font-bold text-primary-foreground">
              {unread.length > 9 ? "9+" : unread.length}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <p className="font-heading font-semibold text-foreground text-[14px]">Notifications</p>
            {unread.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-primary font-semibold hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-[13px] text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-border/40 hover:bg-muted/30 transition-colors last:border-0",
                    !n.read && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-[16px] mt-0.5 shrink-0">
                      {n.type === "new_message"
                        ? "💬"
                        : n.title?.includes("Matched") || n.title?.includes("matched")
                        ? "🎉"
                        : n.title?.includes("Tomorrow") || n.title?.includes("Scheduled")
                        ? "📅"
                        : n.title?.includes("Complete") || n.title?.includes("complete")
                        ? "✅"
                        : n.title?.includes("Cancelled") || n.title?.includes("cancelled")
                        ? "❌"
                        : n.title?.includes("Progress") || n.title?.includes("progress")
                        ? "🔍"
                        : "🔔"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-[13px] text-foreground leading-snug", !n.read && "font-semibold")}>
                        {n.title}
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
                        {n.body}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(n.created_date), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}