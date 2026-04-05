import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle2, MapPin, DollarSign, X, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const SERVICE_LABELS = {
  standard_verification: "Standard",
  specialist_vetting: "Specialist",
  secure_exchange_presence: "Secure Exchange",
};

const SERVICE_PRICES = {
  standard_verification: 39,
  specialist_vetting: 89,
  secure_exchange_presence: 149,
};

const CATEGORY_LABELS = {
  cars_and_motorcycles: "Vehicles", electronics: "Electronics", appliances: "Appliances",
  jewelry_and_watches: "Jewelry & Watches", luxury_fashion_and_handbags: "Luxury Fashion",
  furniture: "Furniture", tools_and_equipment: "Tools & Equipment",
  rental_or_property_verification: "Property", other: "Other",
};

function JobCard({ job, onAccept, onDecline, actionPending, showActions }) {
  return (
    <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 mr-3">
          <h4 className="font-heading font-semibold text-foreground text-[15px] truncate">{job.title}</h4>
          <p className="text-muted-foreground text-[12px] mt-0.5">{CATEGORY_LABELS[job.category] || job.category}</p>
        </div>
        <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary text-[11px]">
          {SERVICE_LABELS[job.service_type] || "Standard"}
        </Badge>
      </div>

      <div className="flex items-center gap-4 mb-3">
        {(job.location_city || job.location_state) && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[12px] text-muted-foreground">
              {[job.location_city, job.location_state].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5 text-accent" />
          <span className="text-[12px] font-semibold text-accent">
            ~${SERVICE_PRICES[job.service_type] || 39}
          </span>
        </div>
      </div>

      {job.description && (
        <p className="text-[12px] text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
      )}

      {showActions && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDecline(job)}
            disabled={actionPending}
            className="flex-1 rounded-xl h-9 text-[13px] border-destructive/30 text-destructive hover:bg-destructive/5"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Decline
          </Button>
          <Button
            size="sm"
            onClick={() => onAccept(job)}
            disabled={actionPending}
            className="flex-1 rounded-xl h-9 text-[13px] font-semibold"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            Accept
          </Button>
        </div>
      )}

      {!showActions && (
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
          <span className="text-[12px] text-accent font-medium capitalize">{job.status.replace("_", " ")}</span>
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
        <Briefcase className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-sm max-w-[200px]">{message}</p>
    </div>
  );
}

export default function Jobs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Jobs assigned to this vetter (matched/awaiting confirmation)
  const { data: myJobs = [], isLoading } = useQuery({
    queryKey: ["jobs-mine", user?.email],
    queryFn: () => base44.entities.VettingRequest.filter({ vetter_email: user?.email }, "-created_date"),
    enabled: !!user?.email,
  });

  const acceptMutation = useMutation({
    mutationFn: (job) =>
      base44.entities.VettingRequest.update(job.id, { status: "scheduled" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs-mine"] });
      toast({ title: "Job accepted!", description: "The buyer has been notified." });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (job) =>
      base44.entities.VettingRequest.update(job.id, { vetter_email: null, status: "pending" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs-mine"] });
      toast({
        title: "Job declined",
        description: "The buyer will be matched with another Vetter.",
        variant: "destructive",
      });
    },
  });

  const pending = myJobs.filter((j) => j.status === "matched");
  const active = myJobs.filter((j) => ["scheduled", "in_progress"].includes(j.status));
  const completed = myJobs.filter((j) => j.status === "completed");
  const actionPending = acceptMutation.isPending || declineMutation.isPending;

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-heading font-bold text-foreground">Jobs</h1>
        {pending.length > 0 && (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <span className="text-[11px] font-bold text-primary-foreground">{pending.length}</span>
          </div>
        )}
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="w-full rounded-xl mb-5 h-10">
          <TabsTrigger value="pending" className="flex-1 text-[12px]">
            New {pending.length > 0 && `(${pending.length})`}
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-1 text-[12px]">
            Active {active.length > 0 && `(${active.length})`}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 text-[12px]">Done</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {isLoading ? (
            <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-28 bg-card rounded-2xl animate-pulse" />)}</div>
          ) : pending.length === 0 ? (
            <EmptyState message="No new job requests right now." />
          ) : (
            <div className="space-y-3">
              {pending.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  showActions={true}
                  onAccept={(j) => acceptMutation.mutate(j)}
                  onDecline={(j) => declineMutation.mutate(j)}
                  actionPending={actionPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          {active.length === 0 ? (
            <EmptyState message="No active jobs. Accept a job from the New tab." />
          ) : (
            <div className="space-y-3">
              {active.map((job) => <JobCard key={job.id} job={job} showActions={false} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completed.length === 0 ? (
            <EmptyState message="Completed jobs will appear here." />
          ) : (
            <div className="space-y-3">
              {completed.map((job) => <JobCard key={job.id} job={job} showActions={false} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}