import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Briefcase } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RequestCard from "@/components/requests/RequestCard";

export default function Jobs() {
  const { user } = useAuth();

  const { data: available = [], isLoading: loadingAvailable } = useQuery({
    queryKey: ["available-jobs"],
    queryFn: () => base44.entities.VettingRequest.filter({ status: "pending" }, "-created_date"),
  });

  const { data: myJobs = [], isLoading: loadingMy } = useQuery({
    queryKey: ["my-jobs", user?.email],
    queryFn: () => base44.entities.VettingRequest.filter({ vetter_email: user?.email }, "-created_date"),
    enabled: !!user?.email,
  });

  const activeJobs = myJobs.filter((j) => !["completed", "cancelled"].includes(j.status));
  const completedJobs = myJobs.filter((j) => j.status === "completed");

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-xl font-heading font-bold text-foreground mb-5">Jobs</h1>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="w-full bg-muted rounded-xl h-10 p-1 mb-4">
          <TabsTrigger value="available" className="flex-1 rounded-lg text-[13px] font-medium">
            Available
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-1 rounded-lg text-[13px] font-medium">
            Active
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 rounded-lg text-[13px] font-medium">
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <JobList jobs={available} loading={loadingAvailable} emptyMessage="No available jobs right now. Check back soon!" />
        </TabsContent>
        <TabsContent value="active">
          <JobList jobs={activeJobs} loading={loadingMy} emptyMessage="No active jobs. Accept a job to get started." />
        </TabsContent>
        <TabsContent value="completed">
          <JobList jobs={completedJobs} loading={loadingMy} emptyMessage="No completed jobs yet." />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function JobList({ jobs, loading, emptyMessage }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-card rounded-2xl border border-border/60 animate-pulse" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
          <Briefcase className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm max-w-[240px]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <RequestCard key={job.id} request={job} />
      ))}
    </div>
  );
}