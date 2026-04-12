import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Star, MapPin, Clock, Briefcase, Award,
  CheckCircle2, User, Zap, Wrench, ClipboardCheck, ToggleLeft, ToggleRight,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const SPECIALTY_LABELS = {
  mechanic: "Mechanic", electronics_technician: "Electronics Tech", appliance_expert: "Appliance Expert",
  jeweler: "Jeweler", watch_specialist: "Watch Specialist", luxury_authenticator: "Luxury Auth.",
  contractor: "Contractor", furniture_expert: "Furniture Expert", property_verifier: "Property Verifier",
  security_professional: "Security Pro", other: "Other",
};

const SERVICE_LABELS = {
  standard_verification: "Standard Verification",
  specialist_vetting: "Specialist Vetting",
  secure_exchange_presence: "Secure Exchange Presence",
};

const STATUS_CONFIG = {
  pending_review: { label: "Pending Review", color: "bg-amber-50 border-amber-200 text-amber-700", emoji: "🕐" },
  active: { label: "Active", color: "bg-green-50 border-green-200 text-green-700", emoji: "✅" },
  inactive: { label: "Inactive", color: "bg-muted border-border text-muted-foreground", emoji: "⏸" },
  approved: { label: "Approved", color: "bg-green-50 border-green-200 text-green-700", emoji: "✅" },
  rejected: { label: "Rejected", color: "bg-red-50 border-red-200 text-red-700", emoji: "❌" },
};

export default function VetterProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["vetter-profile", user?.email],
    queryFn: () => base44.entities.VetterProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const profile = profiles[0];

  const availabilityMutation = useMutation({
    mutationFn: (available) => base44.entities.VetterProfile.update(profile.id, { available }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vetter-profile"] }),
  });

  if (isLoading) {
    return (
      <div className="px-5 pt-6 space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-card rounded-2xl border border-border/60 animate-pulse" />)}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-5 pt-16 pb-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <User className="w-7 h-7 text-muted-foreground" />
        </div>
        <h2 className="font-heading font-bold text-foreground text-lg mb-2">No profile yet</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-[240px]">
          Complete your Vetter onboarding to build your expert profile.
        </p>
        <Link to="/vetter/onboarding">
          <Button className="rounded-xl">Start Onboarding</Button>
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[profile.status] || STATUS_CONFIG["pending_review"];
  const isApproved = profile.status === "active" || profile.status === "approved";
  const isAvailable = profile.available !== false;

  return (
    <div className="pb-8">
      {/* Account settings link */}
      <div className="px-5 pt-4 flex justify-end">
        <Link to="/profile" className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-3.5 h-3.5" />
          Account Settings
        </Link>
      </div>
      {/* Hero */}
      <div className="px-5 pt-6 pb-5 bg-card border-b border-border/60">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-2xl">
                {profile.display_name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-bold text-foreground text-[18px]">{profile.display_name}</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[13px] text-muted-foreground">
                {[profile.city, profile.state].filter(Boolean).join(", ") || "Location not set"}
              </span>
            </div>
          </div>
        </div>

        {/* Application status badge */}
        <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-semibold mb-4", statusCfg.color)}>
          <span>{statusCfg.emoji}</span>
          Application: {statusCfg.label}
        </div>

        {/* Availability toggle — always visible, only enabled when approved */}
        <div className={cn(
          "flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all",
          isAvailable && isApproved ? "bg-green-50 border-green-200" : "bg-muted/50 border-border/60"
        )}>
          <div>
            <p className="font-heading font-semibold text-foreground text-[14px]">
              {isApproved ? (isAvailable ? "Available for jobs" : "Offline") : "Availability"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isApproved ? "Toggle to receive new requests" : "Available after approval"}
            </p>
          </div>
          <button
            onClick={() => isApproved && availabilityMutation.mutate(!isAvailable)}
            disabled={!isApproved || availabilityMutation.isPending}
            className={cn(
              "relative w-12 h-6 rounded-full transition-colors duration-200",
              isApproved && isAvailable ? "bg-green-500" : "bg-muted-foreground/30",
              !isApproved && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
              isAvailable ? "translate-x-6" : "translate-x-0.5"
            )} />
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <StatBox value={profile.rating?.toFixed(1) || "—"} label="Rating" />
          <StatBox value={profile.total_inspections || 0} label="Inspections" />
          <StatBox value={profile.avg_response_time || "—"} label="Response" />
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-5 space-y-4">
        {/* Onboarding completion summary */}
        <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm space-y-2">
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">Profile Completion</p>
          <CompletionRow label="Name" done={!!profile.display_name} />
          <CompletionRow label="Location" done={!!(profile.city || profile.zip_code)} />
          <CompletionRow label="Specialties" done={profile.specialties?.length > 0} />
          <CompletionRow label="Services" done={profile.service_types?.length > 0} />
          <CompletionRow label="Experience" done={!!profile.work_history || profile.years_of_experience > 0} />
          <CompletionRow label="ID Document" done={!!profile.id_document_url} />
        </div>

        {profile.bio && (
          <Section title="About">
            <p className="text-[13px] text-muted-foreground leading-relaxed">{profile.bio}</p>
          </Section>
        )}

        {profile.specialties?.length > 0 && (
          <Section title="Specialties">
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map((s) => (
                <Badge key={s} variant="secondary" className="rounded-full text-[12px]">
                  {SPECIALTY_LABELS[s] || s}
                </Badge>
              ))}
            </div>
          </Section>
        )}

        {profile.service_types?.length > 0 && (
          <Section title="Services Offered">
            <div className="space-y-2">
              {profile.service_types.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-[13px] text-foreground font-medium">{SERVICE_LABELS[s] || s}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {(profile.work_history || profile.years_of_experience > 0) && (
          <Section title="Experience">
            {profile.work_history && (
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-2">{profile.work_history}</p>
            )}
            {profile.years_of_experience > 0 && (
              <p className="text-[12px] font-semibold text-foreground">{profile.years_of_experience} years of experience</p>
            )}
          </Section>
        )}

        <Section title="Service Area">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-[13px] text-muted-foreground">
              Within {profile.service_radius_miles || 25} miles of {profile.city || "your location"}
            </span>
          </div>
        </Section>
      </div>
    </div>
  );
}

function StatBox({ value, label }) {
  return (
    <div className="flex flex-col items-center py-2.5 bg-background rounded-xl border border-border/60">
      <span className="font-heading font-bold text-foreground text-[16px]">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
      <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">{title}</p>
      {children}
    </div>
  );
}

function CompletionRow({ label, done }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-foreground">{label}</span>
      <span className={cn("text-[12px] font-semibold", done ? "text-green-600" : "text-muted-foreground")}>
        {done ? "✓ Done" : "Missing"}
      </span>
    </div>
  );
}