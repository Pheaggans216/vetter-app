import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { MessageCircle } from "lucide-react";
import { format } from "date-fns";

export default function Messages() {
  const { user } = useAuth();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations", user?.email],
    queryFn: () => base44.entities.Conversation.list("-updated_date"),
    enabled: !!user?.email,
  });

  const myConversations = conversations.filter(
    (c) => c.participants?.includes(user?.email)
  );

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-xl font-heading font-bold text-foreground mb-6">Messages</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-card rounded-2xl border border-border/60 animate-pulse" />
          ))}
        </div>
      ) : myConversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <MessageCircle className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-heading font-semibold text-foreground mb-1">No messages yet</p>
          <p className="text-muted-foreground text-sm max-w-[240px]">
            Conversations with vetters will appear here once a request is matched.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {myConversations.map((convo) => {
            const otherParticipant = convo.participants?.find((p) => p !== user?.email) || "Unknown";
            return (
              <div
                key={convo.id}
                className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-semibold text-sm">
                    {otherParticipant[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-foreground truncate">
                    {otherParticipant}
                  </p>
                  <p className="text-[12px] text-muted-foreground truncate">
                    {convo.last_message || "No messages yet"}
                  </p>
                </div>
                {convo.last_message_at && (
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {format(new Date(convo.last_message_at), "MMM d")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}