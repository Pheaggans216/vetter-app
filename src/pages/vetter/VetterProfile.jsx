import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Star, MapPin, Clock, Briefcase, Award,
  CheckCircle2, Edit, User, Zap
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

const STATUS_BADGES = [
  { key: "identity_verified", label: "Identity Verified", icon: User, color: "bg-primary/10 text-primary border-primary/20" },
  { key: "background_checked", label: "Background Checked", icon: ShieldCheck, color: "bg-accent/15 text-accent border-accent/20" },
  { key: "certified_specialist", label: "Certified Specialist", icon: Award, color: "bg-chart-3/15 text-chart-3 border-chart-3/20" },
  { key: "secure_exchange_approved", label: "Secure Exchange Approved", icon: Zap, color: "bg-chart-4/10 text-chart-4 border-chart-4/20" },
];

export default function VetterProfile() {
  const { user } = useAuth();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["vetter-profile", user?.email],
    queryFn: () => base44.entities.VetterProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const profile = profiles[0];

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

  const activeBadges = STATUS_BADGES.filter((b) => profile[b.key]);

  return (
    <div className="pb-8">
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
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="font-heading font-bold text-foreground text-[18px]">{profile.display_name}</h1>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[13px] text-muted-foreground">
                    {[profile.city, profile.state].filter(Boolean).join(", ") || "Location not set"}
                  </span>
                </div>
              </div>
              <Link to="/vetter/onboarding">
                <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 shrink-0">
                  <Edit className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatBox value={profile.rating?.toFixed(1) || "—"} label="Rating" icon={Star} />
          <StatBox value={profile.total_inspections || 0} label="Inspections" icon={CheckCircle2} />
          <StatBox value={profile.avg_response_time || "< 2h"} label="Response" icon={Clock} />
        </div>

        {/* Status badges */}
        {activeBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeBadges.map((b) => (
              <div
                key={b.key}
                className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold", b.color)}
              >
                <b.icon className="w-3 h-3" />
                {b.label}
              </div>
            ))}
          </div>
        )}

        {profile.status === "pending_review" && (
          <div className="mt-3 px-3 py-2 bg-muted rounded-xl">
            <p className="text-[12px] text-muted-foreground text-center">
              🕐 Your profile is under review. Expect approval within 24–48 hours.
            </p>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-5 pt-5 space-y-4">
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

        {profile.work_history && (
          <Section title="Experience">
            <div className="flex items-start gap-3">
              <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-[13px] text-muted-foreground leading-relaxed">{profile.work_history}</p>
            </div>
            {profile.years_of_experience > 0 && (
              <p className="text-[12px] font-semibold text-foreground mt-2">
                {profile.years_of_experience} years of experience
              </p>
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

function StatBox({ value, label, icon: Icon }) {
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