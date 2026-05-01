import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Calendar, MapPin, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";

const TIER_LABELS = { basic: "Basic Check", standard: "Standard Verification", expert: "Expert Verification" };
const STATUS_LABELS = { vetter_assigned: "Assigned", in_progress: "In Progress" };

export default function Schedule() {
  const { user } = useAuth();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["scheduled-jobs", user?.email],
    queryFn: () => base44.entities.VetterJob.filter(
      { vetter_email: user?.email },
      "created_date"
    ),
    enabled: !!user?.email,
    select: (data) => data.filter(j => ["vetter_assigned", "in_progress"].includes(j.status)),
  });



  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-xl font-heading font-bold text-foreground mb-6">Schedule</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-card rounded-2xl border border-border/60 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-heading font-semibold text-foreground mb-1">No active jobs</p>
          <p className="text-muted-foreground text-sm max-w-[240px]">
            Jobs you accept will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-heading font-semibold text-foreground text-[14px]">
                  {TIER_LABELS[job.tier] || job.tier}
                </h4>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {STATUS_LABELS[job.status] || job.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
                {(job.location_city || job.location_state) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {[job.location_city, job.location_state].filter(Boolean).join(", ")}
                  </span>
                )}
                {job.time_window && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {job.time_window}
                  </span>
                )}
                <span className="flex items-center gap-1 text-accent font-semibold">
                  <DollarSign className="w-3.5 h-3.5" />
                  ${job.vetter_payout} payout
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}