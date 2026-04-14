import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import NotificationBell from "@/components/notifications/NotificationBell";
import ModeSwitcher from "@/components/ModeSwitcher";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import {
  Briefcase, MessageCircle, User, MapPin, ArrowRight,
  CheckCircle2, Clock, AlertCircle, DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending_review: { label: "Pending Review", color: "bg-amber-50 border-amber-200 text-amber-700", icon: Clock },
  active: { label: "Active & Approved", color: "bg-green-50 border-green-200 text-green-700", icon: CheckCircle2 },
  inactive: { label: "Inactive", color: "bg-muted border-border text-muted-foreground", icon: AlertCircle },
};

const SERVICE_PRICES = {
  standard_verification: 39,
  specialist_vetting: 89,
  secure_exchange_presence: 149,
};

export default function VetterDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const firstName = user?.full_name?.split(" ")[0] || "there";

  const { data: profiles = [], isLoading: loadingProfile } = useQuery({
    queryKey: ["vetter-dashboard-profile", user?.email],
    queryFn: () => base44.entities.VetterProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });
  const profile = profiles[0];

  const { data: pendingJobs = [] } = useQuery({
    queryKey: ["vetter-dashboard-jobs", user?.email],
    queryFn: () => base44.entities.VettingRequest.filter({ vetter_email: user?.email, status: "matched" }, "-created_date", 5),
    enabled: !!user?.email,
  });

  const { data: activeJobs = [] } = useQuery({
    queryKey: ["vetter-dashboard-active", user?.email],
    queryFn: () => base44.entities.VettingRequest.filter({ vetter_email: user?.email, status: "scheduled" }, "-created_date", 3),
    enabled: !!user?.email,
  });

  const availabilityMutation = useMutation({
    mutationFn: (available) => base44.entities.VetterProfile.update(profile.id, { available }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vetter-dashboard-profile"] }),
  });

  const statusCfg = STATUS_CONFIG[profile?.status] || STATUS_CONFIG["pending_review"];
  const StatusIcon = statusCfg.icon;
  const isAvailable = profile?.available !== false;
  const isApproved = profile?.status === "active";

  if (loadingProfile) {
    return (
      <div className="px-5 pt-6 space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-card border border-border/60 animate-pulse" />)}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-5 pt-16 text-center">
        <h2 className="font-heading font-bold text-foreground text-lg mb-2">No Vetter profile yet</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-[240px] mx-auto">
          Complete your application to start accepting jobs.
        </p>
        <Link to="/vetter/onboarding">
          <button className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-[14px]">
            Start Application
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[13px] text-muted-foreground font-medium mb-0.5">Vetter Dashboard</p>
          <h1 className="text-[24px] font-heading font-bold text-foreground leading-tight">
            Hey, {firstName} 👋
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ModeSwitcher compact />
          <NotificationBell />
          <Link to="/vetter/profile">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-border/60">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
              ) : (
                <span className="text-primary font-bold text-[15px]">
                  {profile.display_name?.[0]?.toUpperCase() || "V"}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Application status */}
      <div className={cn("flex items-center gap-3 px-4 py-3 rounded-2xl border mb-4", statusCfg.color)}>
        <StatusIcon className="w-4 h-4 shrink-0" />
        <div className="flex-1">
          <p className="text-[13px] font-semibold">Application: {statusCfg.label}</p>
          {!isApproved && (
            <p className="text-[11px] opacity-75 mt-0.5">You'll receive an email once approved.</p>
          )}
        </div>
        <Link to="/vetter/profile">
          <ArrowRight className="w-4 h-4 opacity-60" />
        </Link>
      </div>

      {/* Availability toggle */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 mb-4 transition-all",
        isAvailable && isApproved ? "bg-green-50 border-green-200" : "bg-muted/50 border-border/60"
      )}>
        <div>
          <p className="font-heading font-semibold text-foreground text-[14px]">
            {isApproved ? (isAvailable ? "Available for jobs" : "Currently offline") : "Availability"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {isApproved ? "Toggle to go online / offline" : "Available after approval"}
          </p>
        </div>
        <button
          onClick={() => isApproved && availabilityMutation.mutate(!isAvailable)}
          disabled={!isApproved || availabilityMutation.isPending}
          className={cn(
            "relative w-12 h-6 rounded-full transition-colors duration-200",
            isApproved && isAvailable ? "bg-green-500" : "bg-muted-foreground/30",
            !isApproved && "opacity-40 cursor-not-allowed"
          )}
        >
          <span className={cn(
            "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
            isAvailable ? "translate-x-6" : "translate-x-0.5"
          )} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <StatBox value={profile.rating?.toFixed(1) || "—"} label="Rating" />
        <StatBox value={profile.total_inspections || 0} label="Jobs Done" />
        <StatBox value={`${profile.service_radius_miles || 25}mi`} label="Radius" />
      </div>

      {/* Shortcut grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <ShortcutCard icon={Briefcase} label="Jobs" to="/jobs" badge={pendingJobs.length} />
        <ShortcutCard icon={MessageCircle} label="Messages" to="/messages" />
        <ShortcutCard icon={DollarSign} label="Earnings" to="/earnings" />
      </div>

      {/* Service area */}
      {(profile.city || profile.state) && (
        <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-2xl border border-border/60 mb-4">
          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-[13px] text-foreground">
            Serving within <span className="font-semibold">{profile.service_radius_miles || 25} miles</span> of{" "}
            {[profile.city, profile.state].filter(Boolean).join(", ")}
          </p>
        </div>
      )}

      {/* Incoming jobs */}
      {pendingJobs.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">New Requests</p>
            <Link to="/jobs" className="text-[12px] text-primary font-semibold">View all →</Link>
          </div>
          <div className="space-y-2.5 mb-4">
            {pendingJobs.slice(0, 3).map(job => (
              <Link key={job.id} to="/jobs">
                <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-2xl border border-border/60 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground truncate">{job.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      ~${SERVICE_PRICES[job.service_type] || 39} · {[job.location_city, job.location_state].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                    New
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Active jobs */}
      {activeJobs.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">Active Jobs</p>
          </div>
          <div className="space-y-2.5">
            {activeJobs.map(job => (
              <Link key={job.id} to={`/jobs/${job.id}/report`}>
                <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-2xl border border-border/60 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground truncate">{job.title}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">{job.service_type?.replace(/_/g, " ")}</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700">
                    Scheduled
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatBox({ value, label }) {
  return (
    <div className="flex flex-col items-center py-3 bg-card rounded-xl border border-border/60">
      <span className="font-heading font-bold text-foreground text-[16px]">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

function ShortcutCard({ icon: Icon, label, to, badge = 0 }) {
  return (
    <Link to={to}>
      <div className="relative flex flex-col items-center gap-2 py-4 px-2 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
        {badge > 0 && (
          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary-foreground">{badge}</span>
          </div>
        )}
        <Icon className="w-5 h-5 text-primary" />
        <span className="text-[11px] font-semibold text-foreground">{label}</span>
      </div>
    </Link>
  );
}