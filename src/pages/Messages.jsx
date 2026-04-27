import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Messages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations", user?.email],
    queryFn: () => base44.entities.Conversation.list("-updated_date"),
    enabled: !!user?.email,
  });

  const myConversations = conversations.filter(
    (c) => c.participants?.includes(user?.email)
  );

  // Fetch request details for context titles
  const requestIds = [...new Set(myConversations.map((c) => c.request_id).filter(Boolean))];
  const { data: requests = [] } = useQuery({
    queryKey: ["convo-requests", requestIds.join(",")],
    queryFn: async () => {
      const all = await base44.entities.VettingRequest.list();
      return all.filter(r => requestIds.includes(r.id));
    },
    enabled: requestIds.length > 0,
  });
  const requestMap = Object.fromEntries(requests.map((r) => [r.id, r]));

  // Fetch vetter profiles for display names
  const otherEmails = [...new Set(
    myConversations.map((c) => c.participants?.find((p) => p !== user?.email)).filter(Boolean)
  )];
  const { data: vetterProfiles = [] } = useQuery({
    queryKey: ["vetter-profiles-messages", otherEmails.join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        otherEmails.map((email) => base44.entities.VetterProfile.filter({ user_email: email }))
      );
      return results.flat();
    },
    enabled: otherEmails.length > 0,
  });
  const vetterMap = Object.fromEntries(vetterProfiles.map((v) => [v.user_email, v]));

  // Real-time: refresh when a new message arrives
  useEffect(() => {
    const unsub = base44.entities.ChatMessage.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.email] });
    });
    return unsub;
  }, [user?.email, queryClient]);

  const totalUnread = myConversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-heading font-bold text-foreground">Messages</h1>
        {totalUnread > 0 && (
          <span className="min-w-[22px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
            {totalUnread}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-card rounded-2xl border border-border/60 animate-pulse" />
          ))}
        </div>
      ) : myConversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <MessageCircle className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-heading font-semibold text-foreground mb-1">No messages yet</p>
          <p className="text-muted-foreground text-sm max-w-[240px]">
            Once your request is matched with a vetter, you can message them directly here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {myConversations.map((convo) => {
            const otherEmail = convo.participants?.find((p) => p !== user?.email) || "";
            const vetter = vetterMap[otherEmail];
            const displayName = vetter?.display_name || otherEmail;
            const avatarUrl = vetter?.avatar_url;
            const request = convo.request_id ? requestMap[convo.request_id] : null;
            const hasUnread = convo.unread_count > 0;

            return (
              <Link
                key={convo.id}
                to={`/messages/${convo.id}`}
                className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm flex items-center gap-3 hover:bg-muted/30 transition-colors block"
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary font-semibold text-sm">
                      {displayName[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={cn("text-[14px] truncate", hasUnread ? "font-bold text-foreground" : "font-semibold text-foreground")}>
                      {displayName}
                    </p>
                    {convo.last_message_at && (
                      <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                        {format(new Date(convo.last_message_at), "MMM d")}
                      </span>
                    )}
                  </div>
                  {request && (
                    <p className="text-[11px] text-primary truncate font-medium mb-0.5">
                      re: {request.title}
                    </p>
                  )}
                  <p className={cn("text-[12px] truncate", hasUnread ? "text-foreground font-medium" : "text-muted-foreground")}>
                    {convo.last_message || "No messages yet"}
                  </p>
                </div>

                {/* Unread badge */}
                {hasUnread && (
                  <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary-foreground">{convo.unread_count}</span>
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}