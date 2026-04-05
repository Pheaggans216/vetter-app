import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, DollarSign, ShieldCheck, Award, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const SPECIALTY_LABELS = {
  mechanic: "Mechanic", electronics_technician: "Electronics Tech", appliance_expert: "Appliance Expert",
  jeweler: "Jeweler", watch_specialist: "Watch Specialist", luxury_authenticator: "Luxury Auth.",
  contractor: "Contractor", furniture_expert: "Furniture Expert", property_verifier: "Property Verifier",
  security_professional: "Security Pro", other: "Other",
};

const SERVICE_PRICES = {
  standard_verification: 39,
  specialist_vetting: 89,
  secure_exchange_presence: 149,
};

const STATUS_BADGES = [
  { key: "identity_verified", label: "ID Verified", icon: User },
  { key: "background_checked", label: "Background Checked", icon: ShieldCheck },
  { key: "certified_specialist", label: "Certified", icon: Award },
  { key: "secure_exchange_approved", label: "Secure Exchange", icon: Zap },
];

export default function VetterMatchCard({ vetter, serviceType, onSelect, selected, isTop }) {
  const price = SERVICE_PRICES[serviceType] || 39;
  const primarySpecialty = vetter.specialties?.[0];
  const activeBadges = STATUS_BADGES.filter((b) => vetter[b.key]);

  return (
    <div
      className={cn(
        "p-4 rounded-2xl border-2 transition-all",
        selected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border/60 bg-card shadow-sm hover:border-primary/30"
      )}
    >
      {isTop && (
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-[11px] font-semibold text-amber-600">Top Match</span>
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
          {vetter.avatar_url ? (
            <img src={vetter.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary font-bold text-base">
              {vetter.display_name?.[0]?.toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-heading font-bold text-foreground text-[15px] truncate">
              {vetter.display_name}
            </p>
            <span className="text-[14px] font-bold text-accent shrink-0">
              From ${price}
            </span>
          </div>

          <p className="text-[12px] text-muted-foreground">
            {primarySpecialty ? SPECIALTY_LABELS[primarySpecialty] : "General Inspector"}
            {vetter.years_of_experience > 0 && ` · ${vetter.years_of_experience} yrs exp`}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-3">
        {vetter.rating && (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-[12px] font-semibold text-foreground">{vetter.rating.toFixed(1)}</span>
            {vetter.total_reviews > 0 && (
              <span className="text-[11px] text-muted-foreground">({vetter.total_reviews})</span>
            )}
          </div>
        )}
        {(vetter.city || vetter.state) && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[12px] text-muted-foreground">
              {[vetter.city, vetter.state].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[12px] text-muted-foreground">{vetter.avg_response_time || "< 2h"}</span>
        </div>
      </div>

      {/* Badges */}
      {activeBadges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {activeBadges.map((b) => (
            <div key={b.key} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
              <b.icon className="w-2.5 h-2.5" />
              {b.label}
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={() => onSelect(vetter)}
        size="sm"
        variant={selected ? "default" : "outline"}
        className="w-full rounded-xl h-9 text-[13px] font-semibold"
      >
        {selected ? "Selected ✓" : "Select This Vetter"}
      </Button>
    </div>
  );
}