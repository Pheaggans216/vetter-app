import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Briefcase, Check, X, FileText, ChevronRight, Clock, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const TIER_LABELS = { basic: "Basic Check", standard: "Standard Verification", expert: "Expert Verification" };
const TIER_TASKS = {
  basic: ["Confirm item exists", "Photo/video proof", "Verify seller identity", "Confirm meetup/location"],
  standard: ["Confirm item exists", "Photo/video proof", "Verify seller identity", "Test functionality", "Upload condition photos", "Written condition notes", "Red flag assessment"],
  expert: ["All Standard tasks", "Specialist inspection notes", "Market value range", "Buy / Caution / Pass recommendation"],
};

const STATUS_LABELS = {
  pending_payment: "Awaiting Payment",
  payment_secured: "Payment Secured",
  matching: "Finding Vetter",
  vetter_assigned: "Vetter Assigned",
  in_progress: "In Progress",
  report_ready: "Report Ready",
  completed: "Completed",
  disputed: "Disputed",
  cancelled: "Cancelled",
};

function JobCard({ job, onAccept, onDecline, actionPending }) {
  const isPending = job.status === "payment_secured" && !job.vetter_email;
  const isMyJob = true;

  return (
    <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{TIER_LABELS[job.tier]}</p>
          <p className="text-[14px] font-heading font-semibold text-foreground">
            {[job.location_city, job.location_state].filter(Boolean).join(", ") || "Location TBD"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[18px] font-bold text-accent">${job.vetter_payout}</p>
          <p className="text-[10px] text-muted-foreground">your payout</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {job.is_rush && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
            <Zap className="w-3 h-3" /> Rush
          </span>
        )}
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold">
          <DollarSign className="w-3 h-3" /> Total: ${job.total_price}
        </span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
          {STATUS_LABELS[job.status] || job.status}
        </span>
      </div>

      {/* Required tasks */}
      <div className="mb-3">
        <p className="text-[11px] text-muted-foreground mb-1.5">Required tasks:</p>
        <div className="space-y-1">
          {(TIER_TASKS[job.tier] || []).map((task, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <p className="text-[12px] text-muted-foreground">{task}</p>
            </div>
          ))}
        </div>
      </div>

      {job.time_window && (
        <div className="flex items-center gap-1.5 mb-3 text-[12px] text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          {job.time_window}
        </div>
      )}

      {/* Actions */}
      {isPending && onAccept && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onDecline(job)} disabled={actionPending}
            className="flex-1 rounded-xl h-9 text-[13px] border-destructive/30 text-destructive hover:bg-destructive/5">
            <X className="w-3.5 h-3.5 mr-1" /> Decline
          </Button>
          <Button size="sm" onClick={() => onAccept(job)} disabled={actionPending}
            className="flex-1 rounded-xl h-9 text-[13px] font-semibold">
            <Check className="w-3.5 h-3.5 mr-1" /> Accept Job
          </Button>
        </div>
      )}

      {job.status === "vetter_assigned" || job.status === "in_progress" ? (
        <Link to={`/vetter/jobs/${job.id}/report`}>
          <Button size="sm" className="w-full rounded-xl h-9 text-[13px] font-semibold gap-1.5 mt-1">
            <FileText className="w-3.5 h-3.5" /> Submit Report
          </Button>
        </Link>
      ) : null}
    </div>
  );
}

export default function VetterJobs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["vetter-jobs-mine", user?.email],
    queryFn: async () => {
      const all = await base44.entities.VetterJob.list("-created_date");
      // Show payment_secured (unassigned) jobs + jobs assigned to this vetter
      return all.filter(j => (j.status === "payment_secured" && !j.vetter_email) || j.vetter_email === user?.email);
    },
    enabled: !!user?.email,
  });

  const acceptMutation = useMutation({
    mutationFn: async (job) => {
      await base44.entities.VetterJob.update(job.id, { vetter_email: user.email, status: "vetter_assigned" });
      await base44.entities.Listing.update(job.listing_id, { vetting_status: "vetter_assigned" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vetter-jobs-mine"] });
      toast({ title: "Job accepted!", description: "The buyer has been notified." });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (job) => {
      // Reset to matching so another vetter can take it
      await base44.entities.VetterJob.update(job.id, { status: "payment_secured" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vetter-jobs-mine"] });
      toast({ title: "Job declined" });
    },
  });

  const available = jobs.filter(j => j.status === "payment_secured" && !j.vetter_email);
  const active = jobs.filter(j => ["vetter_assigned", "in_progress"].includes(j.status) && j.vetter_email === user?.email);
  const done = jobs.filter(j => ["report_ready", "completed"].includes(j.status) && j.vetter_email === user?.email);

  const actionPending = acceptMutation.isPending || declineMutation.isPending;

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-xl font-heading font-bold text-foreground mb-5">Vetter Jobs</h1>

      <Tabs defaultValue="available">
        <TabsList className="w-full rounded-xl mb-5 h-10">
          <TabsTrigger value="available" className="flex-1 text-[12px]">
            Available {available.length > 0 && `(${available.length})`}
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-1 text-[12px]">
            Active {active.length > 0 && `(${active.length})`}
          </TabsTrigger>
          <TabsTrigger value="done" className="flex-1 text-[12px]">Done</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {isLoading ? <LoadingSkeleton /> : available.length === 0 ? (
            <Empty message="No jobs available right now. Check back soon." />
          ) : (
            <div className="space-y-3">
              {available.map(j => (
                <JobCard key={j.id} job={j}
                  onAccept={(job) => acceptMutation.mutate(job)}
                  onDecline={(job) => declineMutation.mutate(job)}
                  actionPending={actionPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          {active.length === 0 ? <Empty message="No active jobs. Accept a job from Available." /> : (
            <div className="space-y-3">
              {active.map(j => <JobCard key={j.id} job={j} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="done">
          {done.length === 0 ? <Empty message="Completed jobs will appear here." /> : (
            <div className="space-y-3">
              {done.map(j => <JobCard key={j.id} job={j} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Empty({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
        <Briefcase className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-sm max-w-[200px]">{message}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map(i => <div key={i} className="h-44 bg-card rounded-2xl border border-border/60 animate-pulse" />)}
    </div>
  );
}