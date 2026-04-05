import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle2, Clock, MapPin, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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

function JobCard({ job, onAccept, accepting }) {
  return (
    <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 mr-3">
          <h4 className="font-heading font-semibold text-foreground text-[15px] truncate">{job.title}</h4>
          <p className="text-muted-foreground text-[12px] mt-0.5">{CATEGORY_LABELS[job.category] || job.category}</p>
        </div>
        <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary text-[11px]">
          {SERVICE_LABELS[job.service_type]}
        </Badge>
      </div>
      <div className="flex items-center gap-3 mb-3">
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
      {onAccept && (
        <Button
          size="sm"
          onClick={() => onAccept(job)}
          disabled={accepting}
          className="w-full rounded-xl h-9 text-[13px] font-semibold"
        >
          {accepting ? "Accepting..." : "Accept Job"}
        </Button>
      )}
      {!onAccept && (
        <div className="flex items-center gap-1 mt-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
          <span className="text-[12px] text-accent font-medium">Accepted</span>
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
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

export default function Jobs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: available = [], isLoading: loadingAvail } = useQuery({
    queryKey: ["jobs-available"],
    queryFn: () => base44.entities.VettingRequest.filter({ status: "pending" }, "-created_date"),
    enabled: !!user,
  });

  const { data: myJobs = [], isLoading: loadingMine } = useQuery({
    queryKey: ["jobs-mine", user?.email],
    queryFn: () => base44.entities.VettingRequest.filter({ vetter_email: user?.email }, "-created_date"),
    enabled: !!user?.email,
  });

  const acceptMutation = useMutation({
    mutationFn: (job) =>
      base44.entities.VettingRequest.update(job.id, { vetter_email: user.email, status: "matched" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs-available"] });
      queryClient.invalidateQueries({ queryKey: ["jobs-mine"] });
      toast({ title: "Job accepted!", description: "The buyer has been notified." });
    },
  });

  const active = myJobs.filter((j) => ["matched", "scheduled", "in_progress"].includes(j.status));
  const completed = myJobs.filter((j) => j.status === "completed");

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-xl font-heading font-bold text-foreground mb-5">Jobs</h1>

      <Tabs defaultValue="available">
        <TabsList className="w-full rounded-xl mb-5 h-10">
          <TabsTrigger value="available" className="flex-1 text-[13px]">
            Available {available.length > 0 && `(${available.length})`}
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-1 text-[13px]">
            Active {active.length > 0 && `(${active.length})`}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 text-[13px]">
            Done
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {loadingAvail ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 bg-card rounded-2xl animate-pulse" />)}</div>
          ) : available.length === 0 ? (
            <EmptyState message="No available jobs right now. Check back soon." />
          ) : (
            <div className="space-y-3">
              {available.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onAccept={(j) => acceptMutation.mutate(j)}
                  accepting={acceptMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          {loadingMine ? (
            <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-28 bg-card rounded-2xl animate-pulse" />)}</div>
          ) : active.length === 0 ? (
            <EmptyState message="No active jobs. Accept a job from the Available tab." />
          ) : (
            <div className="space-y-3">
              {active.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completed.length === 0 ? (
            <EmptyState message="Completed jobs will appear here." />
          ) : (
            <div className="space-y-3">
              {completed.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}