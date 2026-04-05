import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { DollarSign, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

const SERVICE_PRICES = {
  standard_verification: 39,
  specialist_vetting: 89,
  secure_exchange_presence: 149,
};

export default function Earnings() {
  const { user } = useAuth();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["earnings-jobs", user?.email],
    queryFn: () => base44.entities.VettingRequest.filter({ vetter_email: user?.email }, "-created_date"),
    enabled: !!user?.email,
  });

  const completed = jobs.filter((j) => j.status === "completed");
  const active = jobs.filter((j) => ["matched", "scheduled", "in_progress"].includes(j.status));

  const totalEarned = completed.reduce((sum, j) => sum + (SERVICE_PRICES[j.service_type] || 39), 0);
  const pending = active.reduce((sum, j) => sum + (SERVICE_PRICES[j.service_type] || 39), 0);

  return (
    <div className="px-5 pt-6 pb-8">
      <h1 className="text-xl font-heading font-bold text-foreground mb-5">Earnings</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <EarningsCard
          icon={DollarSign}
          label="Total Earned"
          value={`$${totalEarned}`}
          color="text-accent"
          bg="bg-accent/15"
        />
        <EarningsCard
          icon={Clock}
          label="Pending"
          value={`$${pending}`}
          color="text-primary"
          bg="bg-primary/10"
        />
        <EarningsCard
          icon={CheckCircle2}
          label="Completed"
          value={completed.length}
          color="text-chart-3"
          bg="bg-chart-3/15"
        />
        <EarningsCard
          icon={TrendingUp}
          label="Active Jobs"
          value={active.length}
          color="text-foreground"
          bg="bg-muted"
        />
      </div>

      <h2 className="text-[14px] font-semibold text-foreground mb-3">Recent Activity</h2>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-card rounded-2xl animate-pulse" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground text-sm">No jobs yet. Accept your first job to start earning.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.slice(0, 10).map((job) => (
            <div key={job.id} className="flex items-center justify-between p-3.5 bg-card rounded-2xl border border-border/60">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-[13px] font-medium text-foreground truncate">{job.title}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{job.status.replace("_", " ")}</p>
              </div>
              <span className={`text-[14px] font-bold ${job.status === "completed" ? "text-accent" : "text-muted-foreground"}`}>
                {job.status === "completed" ? "+" : "~"}${SERVICE_PRICES[job.service_type] || 39}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EarningsCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
      <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-2`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-[18px] font-heading font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}