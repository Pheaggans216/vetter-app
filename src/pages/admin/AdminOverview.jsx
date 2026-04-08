import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ClipboardList, CheckCircle2, Users, DollarSign, Clock, TrendingUp, Repeat, Star } from "lucide-react";
import { Link } from "react-router-dom";

const SERVICE_PRICES = { standard_verification: 39, specialist_vetting: 89, secure_exchange_presence: 149 };

function MetricCard({ icon: IconComp, label, value, sub, color = "bg-primary/10 text-primary" }) {
  return (
    <div className="p-5 bg-card rounded-2xl border border-border/60 shadow-sm">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <IconComp className="w-4 h-4" />
      </div>
      <p className="text-[24px] font-heading font-bold text-foreground">{value}</p>
      <p className="text-[12px] font-medium text-muted-foreground">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminOverview() {
  const { data: requests = [] } = useQuery({ queryKey: ["admin-requests"], queryFn: () => base44.entities.VettingRequest.list("-created_date", 200) });
  const { data: vetters = [] } = useQuery({ queryKey: ["admin-vetters"], queryFn: () => base44.entities.VetterProfile.list("-created_date", 200) });
  const { data: payments = [] } = useQuery({ queryKey: ["admin-payments"], queryFn: () => base44.entities.Payment.list("-created_date", 200) });

  const completed = requests.filter(r => r.status === "completed");
  const activeVetters = vetters.filter(v => v.status === "active");
  const pendingApps = vetters.filter(v => v.status === "pending_review");
  const totalRevenue = payments.filter(p => p.status === "released").reduce((s, p) => s + (p.amount || 0), 0);
  const avgOrderValue = completed.length > 0
    ? Math.round(completed.reduce((s, r) => s + (SERVICE_PRICES[r.service_type] || 39), 0) / completed.length)
    : 0;

  // Repeat buyers: buyer_email appears more than once
  const buyerCounts = {};
  requests.forEach(r => { if (r.buyer_email) buyerCounts[r.buyer_email] = (buyerCounts[r.buyer_email] || 0) + 1; });
  const repeatBuyers = Object.values(buyerCounts).filter(c => c > 1).length;
  const conversionRate = requests.length > 0 ? Math.round((completed.length / requests.length) * 100) : 0;

  const recentRequests = requests.slice(0, 6);

  return (
    <div className="p-7">
      <div className="mb-7">
        <h1 className="text-[22px] font-heading font-bold text-foreground">Platform Overview</h1>
        <p className="text-muted-foreground text-[13px] mt-0.5">Real-time snapshot of Vetter operations.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={ClipboardList} label="Total Requests" value={requests.length} color="bg-primary/10 text-primary" />
        <MetricCard icon={CheckCircle2} label="Completed Jobs" value={completed.length} color="bg-chart-3/15 text-chart-3" sub={`${conversionRate}% conversion`} />
        <MetricCard icon={Users} label="Active Vetters" value={activeVetters.length} color="bg-accent/15 text-accent" sub={`${pendingApps.length} pending review`} />
        <MetricCard icon={DollarSign} label="Revenue Released" value={`$${totalRevenue.toLocaleString()}`} color="bg-amber-50 text-amber-600" />
        <MetricCard icon={TrendingUp} label="Avg Order Value" value={`$${avgOrderValue}`} color="bg-violet-50 text-violet-600" />
        <MetricCard icon={Repeat} label="Repeat Buyers" value={repeatBuyers} color="bg-rose-50 text-rose-600" />
        <MetricCard icon={Star} label="Avg Vetter Rating" value={activeVetters.length > 0 ? (activeVetters.filter(v => v.rating).reduce((s, v) => s + v.rating, 0) / activeVetters.filter(v => v.rating).length || 0).toFixed(1) : "—"} color="bg-amber-50 text-amber-500" />
        <MetricCard icon={Clock} label="Pending Review" value={pendingApps.length} color="bg-orange-50 text-orange-500" sub="Vetter applications" />
      </div>

      <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <p className="font-heading font-semibold text-foreground text-[14px]">Recent Requests</p>
          <Link to="/admin/requests" className="text-[12px] text-primary hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-border/40">
          {recentRequests.map(req => (
            <div key={req.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{req.title}</p>
                <p className="text-[11px] text-muted-foreground">{req.buyer_email}</p>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                req.status === "completed" ? "bg-chart-3/15 text-chart-3" :
                req.status === "pending" ? "bg-muted text-muted-foreground" :
                "bg-primary/10 text-primary"
              }`}>{req.status.replace("_", " ")}</span>
              <span className="text-[12px] font-semibold text-accent">${SERVICE_PRICES[req.service_type] || 39}</span>
            </div>
          ))}
          {recentRequests.length === 0 && (
            <p className="text-muted-foreground text-[13px] text-center py-8">No requests yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}