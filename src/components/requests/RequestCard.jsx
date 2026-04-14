import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, UserCheck, Loader2, XCircle, Calendar, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const statusConfig = {
  pending: { label: "Pending", icon: Clock, className: "bg-muted text-muted-foreground" },
  matched: { label: "Matched", icon: UserCheck, className: "bg-primary/10 text-primary" },
  scheduled: { label: "Scheduled", icon: Calendar, className: "bg-accent/15 text-accent" },
  in_progress: { label: "In Progress", icon: Loader2, className: "bg-chart-1/10 text-chart-1" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-chart-3/15 text-chart-3" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-destructive/10 text-destructive" },
};

const platformLabels = {
  facebook_marketplace: "Facebook",
  craigslist: "Craigslist",
  ebay: "eBay",
  offerup: "OfferUp",
  other: "Other",
};

const CAN_MESSAGE = ["matched", "scheduled", "in_progress", "completed"];

export default function RequestCard({ request }) {
  const status = statusConfig[request.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const showMessage = CAN_MESSAGE.includes(request.status) && request.vetter_email;

  const messageMutation = useMutation({
    mutationFn: async () => {
      const existing = await base44.entities.Conversation.filter({ request_id: request.id });
      const convo = existing.find(
        (c) => c.participants?.includes(request.buyer_email) && c.participants?.includes(request.vetter_email)
      );
      if (convo) return convo;
      return base44.entities.Conversation.create({
        request_id: request.id,
        participants: [request.buyer_email, request.vetter_email],
        unread_count: 0,
      });
    },
    onSuccess: (convo) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      navigate(`/messages/${convo.id}`);
    },
  });

  return (
    <Link to={`/requests/${request.id}`}>
      <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-3">
            <h4 className="font-heading font-semibold text-foreground text-[15px] truncate">
              {request.title}
            </h4>
            <p className="text-muted-foreground text-[13px] mt-0.5">
              {platformLabels[request.listing_platform] || "Marketplace"} · {request.location_city || "Location TBD"}
            </p>
          </div>
          <Badge variant="secondary" className={cn("shrink-0 text-[11px] font-medium gap-1", status.className)}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {request.listing_price && (
              <span className="text-foreground font-semibold text-sm">
                ${request.listing_price.toLocaleString()}
              </span>
            )}
            {showMessage && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); messageMutation.mutate(); }}
                disabled={messageMutation.isPending}
                className="flex items-center gap-1 text-[12px] text-primary font-medium px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Message Vetter
              </button>
            )}
          </div>
          <span className="text-muted-foreground text-[12px]">
            {format(new Date(request.created_date), "MMM d, yyyy")}
          </span>
        </div>
      </div>
    </Link>
  );
}