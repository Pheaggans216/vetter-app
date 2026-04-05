import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Calendar, MapPin, Clock } from "lucide-react";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";

export default function Schedule() {
  const { user } = useAuth();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["scheduled-jobs", user?.email],
    queryFn: () => base44.entities.VettingRequest.filter(
      { vetter_email: user?.email, status: "scheduled" },
      "scheduled_date"
    ),
    enabled: !!user?.email,
  });

  const groupJobs = () => {
    const today = [];
    const tomorrow = [];
    const thisWeek = [];
    const later = [];

    jobs.forEach((job) => {
      if (!job.scheduled_date) return later.push(job);
      const date = new Date(job.scheduled_date);
      if (isToday(date)) today.push(job);
      else if (isTomorrow(date)) tomorrow.push(job);
      else if (isThisWeek(date)) thisWeek.push(job);
      else later.push(job);
    });

    return [
      { label: "Today", jobs: today },
      { label: "Tomorrow", jobs: tomorrow },
      { label: "This Week", jobs: thisWeek },
      { label: "Upcoming", jobs: later },
    ].filter((g) => g.jobs.length > 0);
  };

  const groups = groupJobs();

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-xl font-heading font-bold text-foreground mb-6">Schedule</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-card rounded-2xl border border-border/60 animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-heading font-semibold text-foreground mb-1">No upcoming inspections</p>
          <p className="text-muted-foreground text-sm max-w-[240px]">
            Scheduled jobs will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {group.label}
              </h3>
              <div className="space-y-2">
                {group.jobs.map((job) => (
                  <div key={job.id} className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
                    <h4 className="font-heading font-semibold text-foreground text-[14px] mb-2">
                      {job.title}
                    </h4>
                    <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                      {job.scheduled_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(job.scheduled_date), "MMM d")}
                        </span>
                      )}
                      {job.scheduled_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {job.scheduled_time}
                        </span>
                      )}
                      {job.location_city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location_city}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}