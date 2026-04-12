import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import { ShieldCheck, FileText, ArrowRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import NotificationBell from "@/components/notifications/NotificationBell";

const STATUS_COLOR = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  matched: "bg-blue-50 text-blue-700 border-blue-200",
  scheduled: "bg-purple-50 text-purple-700 border-purple-200",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export default function SellerDashboard() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0] || "there";

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["seller-requests", user?.email],
    queryFn: () =>
      base44.entities.VettingRequest.filter(
        { seller_email: user?.email },
        "-created_date",
        10
      ),
    enabled: !!user?.email,
  });

  return (
    <div className="px-5 pt-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[13px] text-muted-foreground font-medium mb-0.5">Seller Dashboard</p>
          <h1 className="text-[26px] font-heading font-bold text-foreground leading-tight">
            Hey, {firstName} 👋
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link to="/profile">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-border/60">
              <span className="text-primary font-bold text-[15px]">
                {user?.full_name?.[0]?.toUpperCase() || "S"}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* CTA */}
      <Link to="/requests/new" className="block mb-5">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-heading font-bold text-[15px]">Verify a listing</p>
            <p className="text-primary-foreground/70 text-[12px]">Request third-party verification for your item</p>
          </div>
          <ArrowRight className="w-5 h-5 opacity-70" />
        </div>
      </Link>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-accent/10 border border-accent/20 mb-6">
        <Tag className="w-5 h-5 text-accent mt-0.5 shrink-0" />
        <div>
          <p className="text-[13px] font-semibold text-foreground">Build buyer trust</p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Get a certified vetter to verify your listing — increase buyer confidence and close deals faster.
          </p>
        </div>
      </div>

      {/* Past verifications */}
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">Verification Requests</p>
        <Link to="/requests" className="text-[12px] text-primary font-semibold">View all →</Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-card border border-border/60 animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center bg-card rounded-2xl border border-border/60">
          <FileText className="w-6 h-6 text-muted-foreground mb-2" />
          <p className="text-[13px] font-semibold text-foreground mb-1">No verifications yet</p>
          <p className="text-[12px] text-muted-foreground mb-3">Submit a listing to get it verified.</p>
          <Link to="/requests/new">
            <button className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold">
              + New Request
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {requests.map((req) => (
            <Link key={req.id} to={`/requests/${req.id}`}>
              <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-2xl border border-border/60 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{req.title}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">
                    {req.category?.replace(/_/g, " ")}
                  </p>
                </div>
                <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize", STATUS_COLOR[req.status])}>
                  {req.status?.replace("_", " ")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}