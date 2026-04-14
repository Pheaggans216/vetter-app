import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors = {
  pending: "bg-muted/60 text-muted-foreground",
  matched: "bg-primary/10 text-primary",
  scheduled: "bg-accent/15 text-accent",
  in_progress: "bg-chart-1/10 text-chart-1",
  completed: "bg-chart-3/15 text-chart-3",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function RequestContextBanner({ requestId }) {
  const { data: requests = [] } = useQuery({
    queryKey: ["vetting-request-banner", requestId],
    queryFn: () => base44.entities.VettingRequest.filter({ id: requestId }),
    enabled: !!requestId,
  });

  const req = requests[0];
  if (!req) return null;

  const colorClass = statusColors[req.status] || statusColors.pending;

  return (
    <Link to={`/requests/${requestId}`}>
      <div className={cn(
        "mx-4 mt-2 mb-1 px-3 py-2 rounded-xl border border-border/40 flex items-center gap-2 hover:border-primary/30 transition-colors",
        "bg-muted/30"
      )}>
        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-foreground truncate">{req.title}</p>
          <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize", colorClass)}>
            {req.status?.replace("_", " ")}
          </span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </div>
    </Link>
  );
}