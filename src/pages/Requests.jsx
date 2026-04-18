import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import RequestCard from "@/components/requests/RequestCard";

export default function Requests() {
  const { user } = useAuth();
  const activeMode = user?.active_mode || user?.app_role || "buyer";
  const isSeller = activeMode === "seller";
  const filterKey = isSeller ? "seller_email" : "buyer_email";

  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ["vetting-requests", user?.email],
    queryFn: () => base44.entities.VettingRequest.filter({ [filterKey]: user?.email }, "-created_date"),
    enabled: !!user?.email,
  });

  return (
    <PullToRefresh onRefresh={refetch}>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-heading font-bold text-foreground">My Requests</h1>
          <Link to="/requests/new">
            <Button size="sm" className="rounded-xl h-9 gap-1.5 text-[13px] font-semibold">
              <Plus className="w-4 h-4" />
              New
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-card rounded-2xl border border-border/60 animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-heading font-semibold text-foreground mb-1">No requests yet</p>
            <p className="text-muted-foreground text-sm mb-5 max-w-[240px]">
              Found something online? Submit a vetting request to get it inspected.
            </p>
            <Link to="/requests/new">
              <Button className="rounded-xl">Get started</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}