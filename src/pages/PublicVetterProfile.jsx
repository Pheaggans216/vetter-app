import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Star, MapPin, Shield, CheckCircle2, Clock,
  Briefcase, Award, Wrench, CalendarCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const specialtyLabels = {
  mechanic: "Mechanic",
  electronics_technician: "Electronics Technician",
  appliance_expert: "Appliance Expert",
  jeweler: "Jeweler",
  watch_specialist: "Watch Specialist",
  luxury_authenticator: "Luxury Authenticator",
  contractor: "Contractor",
  furniture_expert: "Furniture Expert",
  property_verifier: "Property Verifier",
  security_professional: "Security Professional",
  other: "Other",
};

const serviceLabels = {
  standard_verification: "Standard Verification",
  specialist_vetting: "Specialist Vetting",
  secure_exchange_presence: "Secure Exchange Presence",
};

const availabilityDays = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
];

export default function PublicVetterProfile() {
  const navigate = useNavigate();
  const { id: vetterId } = useParams();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["public-vetter-profile", vetterId],
    queryFn: async () => {
      const all = await base44.entities.VetterProfile.list();
      return all.filter(p => p.id === vetterId);
    },
    enabled: !!vetterId,
  });

  const vetter = profiles[0];

  if (isLoading) {
    return (
      <div className="px-5 pt-4 space-y-4">
        <div className="h-8 w-32 bg-muted rounded-xl animate-pulse" />
        <div className="h-32 bg-card rounded-2xl border border-border/60 animate-pulse" />
        <div className="h-24 bg-card rounded-2xl border border-border/60 animate-pulse" />
        <div className="h-24 bg-card rounded-2xl border border-border/60 animate-pulse" />
      </div>
    );
  }

  if (!vetter) {
    return (
      <div className="px-5 pt-12 text-center">
        <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-heading font-bold text-foreground mb-1">Vetter Not Found</p>
        <p className="text-muted-foreground text-sm mb-5">This profile doesn't exist or has been removed.</p>
        <Button variant="outline" className="rounded-xl" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const trustBadges = [
    { label: "Identity Verified", active: vetter.identity_verified, icon: CheckCircle2 },
    { label: "Background Checked", active: vetter.background_checked, icon: Shield },
    { label: "Certified Specialist", active: vetter.certified_specialist, icon: Award },
    { label: "Secure Exchange", active: vetter.secure_exchange_approved, icon: CalendarCheck },
  ];

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <h1 className="text-lg font-heading font-bold text-foreground">Vetter Profile</h1>
      </div>

      <div className="px-5 space-y-4">
        {/* Profile Hero Card */}
        <div className="p-5 bg-card rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border border-border/40">
              {vetter.avatar_url ? (
                <img src={vetter.avatar_url} alt={vetter.display_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-xl">
                  {vetter.display_name?.[0]?.toUpperCase() || "V"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-heading font-bold text-foreground text-[17px]">{vetter.display_name}</h2>
                {vetter.verified && (
                  <Badge className="bg-primary/10 text-primary text-[10px] font-semibold gap-1 px-2 py-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </Badge>
                )}
              </div>
              {(vetter.city || vetter.state) && (
                <p className="text-muted-foreground text-[13px] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {[vetter.city, vetter.state].filter(Boolean).join(", ")}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {vetter.rating > 0 && (
                  <span className="flex items-center gap-1 text-[13px] font-semibold text-foreground">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {vetter.rating.toFixed(1)}
                    <span className="text-muted-foreground font-normal">({vetter.total_reviews || 0} reviews)</span>
                  </span>
                )}
                {vetter.total_inspections > 0 && (
                  <span className="text-[13px] text-muted-foreground flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {vetter.total_inspections} inspections
                  </span>
                )}
                {vetter.avg_response_time && (
                  <span className="text-[13px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {vetter.avg_response_time}
                  </span>
                )}
              </div>
            </div>
          </div>

          {vetter.bio && (
            <p className="text-[13px] text-muted-foreground leading-relaxed mt-4 pt-4 border-t border-border/40">
              {vetter.bio}
            </p>
          )}
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 gap-2">
          {trustBadges.map((badge) => (
            <div
              key={badge.label}
              className={cn(
                "flex items-center gap-2.5 p-3 rounded-xl border",
                badge.active
                  ? "bg-accent/5 border-accent/20 text-accent"
                  : "bg-muted/40 border-border/40 text-muted-foreground opacity-50"
              )}
            >
              <badge.icon className="w-4 h-4 shrink-0" />
              <span className="text-[12px] font-medium">{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Experience & Rate */}
        <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
          <p className="text-[13px] font-heading font-bold text-foreground mb-3">Experience & Pricing</p>
          <div className="grid grid-cols-2 gap-4">
            {vetter.years_of_experience > 0 && (
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Experience</p>
                <p className="text-[15px] font-bold text-foreground">
                  {vetter.years_of_experience} {vetter.years_of_experience === 1 ? "year" : "years"}
                </p>
              </div>
            )}
            {vetter.hourly_rate > 0 && (
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Hourly Rate</p>
                <p className="text-[15px] font-bold text-foreground">${vetter.hourly_rate}/hr</p>
              </div>
            )}
            {vetter.service_radius_miles > 0 && (
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Service Radius</p>
                <p className="text-[15px] font-bold text-foreground">{vetter.service_radius_miles} miles</p>
              </div>
            )}
          </div>
        </div>

        {/* Specialties */}
        {vetter.specialties?.length > 0 && (
          <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-primary" />
              <p className="text-[13px] font-heading font-bold text-foreground">Specialties</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {vetter.specialties.map((s) => (
                <Badge key={s} variant="secondary" className="text-[12px] bg-primary/10 text-primary font-medium">
                  {specialtyLabels[s] || s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Services Offered */}
        {vetter.service_types?.length > 0 && (
          <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-primary" />
              <p className="text-[13px] font-heading font-bold text-foreground">Services Offered</p>
            </div>
            <div className="space-y-2">
              {vetter.service_types.map((s) => (
                <div key={s} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-[13px] text-foreground">{serviceLabels[s] || s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Availability */}
        {vetter.availability && (
          <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CalendarCheck className="w-4 h-4 text-primary" />
              <p className="text-[13px] font-heading font-bold text-foreground">Weekly Availability</p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {availabilityDays.map((day) => (
                <div
                  key={day.key}
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-semibold",
                    vetter.availability[day.key]
                      ? "bg-accent text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {day.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work History */}
        {vetter.work_history && (
          <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-primary" />
              <p className="text-[13px] font-heading font-bold text-foreground">Work History</p>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{vetter.work_history}</p>
          </div>
        )}

        {/* Availability Status */}
        <div className={cn(
          "p-4 rounded-2xl border text-center",
          vetter.available
            ? "bg-accent/5 border-accent/20"
            : "bg-muted/40 border-border/40"
        )}>
          <p className={cn(
            "text-[14px] font-semibold",
            vetter.available ? "text-accent" : "text-muted-foreground"
          )}>
            {vetter.available ? "✓ Currently Available for Jobs" : "Not Currently Available"}
          </p>
        </div>
      </div>
    </div>
  );
}