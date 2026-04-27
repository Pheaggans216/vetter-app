import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShieldCheck, AlertTriangle, Clock, CheckCircle2, DollarSign, Users, Star, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const VETTING_COLORS = {
  not_vetted: "bg-muted text-muted-foreground",
  vetter_requested: "bg-amber-50 text-amber-700",
  awaiting_payment: "bg-amber-50 text-amber-700",
  payment_secured: "bg-blue-50 text-blue-700",
  vetter_assigned: "bg-blue-50 text-blue-700",
  in_progress: "bg-primary/10 text-primary",
  vetted: "bg-green-50 text-green-700",
  vetted_with_caution: "bg-amber-50 text-amber-700",
  failed_verification: "bg-red-50 text-red-700",
};

const JOB_STATUS_COLORS = {
  pending_payment: "bg-muted text-muted-foreground",
  payment_secured: "bg-blue-50 text-blue-700",
  matching: "bg-purple-50 text-purple-700",
  vetter_assigned: "bg-blue-50 text-blue-700",
  in_progress: "bg-primary/10 text-primary",
  report_ready: "bg-amber-50 text-amber-700",
  completed: "bg-green-50 text-green-700",
  disputed: "bg-red-50 text-red-700",
  cancelled: "bg-muted text-muted-foreground",
};

export default function AdminListings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading: loadingListings } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: () => base44.entities.Listing.list("-created_date", 100),
  });

  const { data: jobs = [], isLoading: loadingJobs } = useQuery({
    queryKey: ["admin-vetter-jobs"],
    queryFn: () => base44.entities.VetterJob.list("-created_date", 100),
  });

  const jobMap = {};
  jobs.forEach(j => { jobMap[j.listing_id] = j; });

  const totalRevenue = jobs.filter(j => j.status === "completed").reduce((s, j) => s + (j.platform_fee || 0), 0);
  const totalVetterPayout = jobs.filter(j => j.status === "completed").reduce((s, j) => s + (j.vetter_payout || 0), 0);
  const pending = jobs.filter(j => j.status === "payment_secured" && !j.vetter_email).length;
  const disputed = jobs.filter(j => j.status === "disputed").length;
  const completed = jobs.filter(j => j.status === "completed").length;

  const disputeMutation = useMutation({
    mutationFn: ({ jobId, resolve }) =>
      base44.entities.VetterJob.update(jobId, { status: resolve ? "completed" : "cancelled" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vetter-jobs"] });
      toast({ title: "Dispute resolved" });
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-heading font-bold text-foreground">Marketplace Overview</h1>
        <p className="text-muted-foreground text-[13px] mt-0.5">All listings, verification jobs, and payouts.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-7">
        <Metric label="Listings" value={listings.length} icon={ShieldCheck} />
        <Metric label="Jobs" value={jobs.length} icon={Clock} />
        <Metric label="Awaiting Vetter" value={pending} icon={Users} color="text-amber-500" />
        <Metric label="Completed" value={completed} icon={CheckCircle2} color="text-green-600" />
        <Metric label="Disputes" value={disputed} icon={AlertTriangle} color="text-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-card rounded-2xl border border-border/60">
          <p className="text-[12px] text-muted-foreground mb-1">Platform Revenue (20%)</p>
          <p className="text-[22px] font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-card rounded-2xl border border-border/60">
          <p className="text-[12px] text-muted-foreground mb-1">Vetter Payouts (80%)</p>
          <p className="text-[22px] font-bold text-foreground">${totalVetterPayout.toLocaleString()}</p>
        </div>
      </div>

      {/* Disputes */}
      {disputed > 0 && (
        <div className="mb-6">
          <p className="text-[13px] font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" /> Open Disputes ({disputed})
          </p>
          <div className="space-y-3">
            {jobs.filter(j => j.status === "disputed").map(job => (
              <div key={job.id} className="p-4 bg-red-50 rounded-2xl border border-red-200">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">Listing: {job.listing_id}</p>
                    <p className="text-[12px] text-muted-foreground">Buyer: {job.buyer_email}</p>
                    {job.dispute_reason && <p className="text-[12px] text-red-700 mt-1">{job.dispute_reason}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-lg text-[12px]"
                      onClick={() => disputeMutation.mutate({ jobId: job.id, resolve: false })}>Refund</Button>
                    <Button size="sm" className="rounded-lg text-[12px]"
                      onClick={() => disputeMutation.mutate({ jobId: job.id, resolve: true })}>Complete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Jobs table */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm mb-6">
        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
          <p className="font-heading font-semibold text-foreground text-[14px]">All Verification Jobs</p>
          <span className="text-[12px] text-muted-foreground">{jobs.length} total</span>
        </div>
        <div className="divide-y divide-border/40 overflow-x-auto">
          {loadingJobs ? (
            <div className="py-8 text-center text-muted-foreground text-[13px]">Loading...</div>
          ) : jobs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-[13px]">No jobs yet.</div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="flex items-center gap-3 px-5 py-3 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {job.tier?.charAt(0).toUpperCase() + job.tier?.slice(1)} — {[job.location_city, job.location_state].filter(Boolean).join(", ") || "Location TBD"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Buyer: {job.buyer_email}</p>
                  {job.vetter_email && <p className="text-[11px] text-muted-foreground">Vetter: {job.vetter_email}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize", JOB_STATUS_COLORS[job.status] || "bg-muted text-muted-foreground")}>
                    {job.status?.replace(/_/g, " ")}
                  </span>
                  <span className="text-[12px] font-bold text-accent">${job.total_price}</span>
                  <span className="text-[10px] text-muted-foreground">Payout: ${job.vetter_payout}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* All Listings */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
        <div className="px-5 py-4 border-b border-border/40">
          <p className="font-heading font-semibold text-foreground text-[14px]">All Listings</p>
        </div>
        <div className="divide-y divide-border/40">
          {loadingListings ? (
            <div className="py-8 text-center text-muted-foreground text-[13px]">Loading...</div>
          ) : listings.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-[13px]">No listings yet.</div>
          ) : (
            listings.map(listing => {
              const job = jobMap[listing.id];
              return (
                <div key={listing.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{listing.title}</p>
                    <p className="text-[11px] text-muted-foreground">{listing.seller_email} · ${listing.price?.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize", VETTING_COLORS[listing.vetting_status] || "bg-muted text-muted-foreground")}>
                      {listing.vetting_status?.replace(/_/g, " ")}
                    </span>
                    {job && (
                      <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize", JOB_STATUS_COLORS[job.status] || "bg-muted text-muted-foreground")}>
                        job: {job.status?.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon, color = "text-primary" }) {
  return (
    <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
      <Icon className={cn("w-4 h-4 mb-2", color)} />
      <p className="text-[22px] font-bold text-foreground">{value}</p>
      <p className="text-[12px] text-muted-foreground">{label}</p>
    </div>
  );
}