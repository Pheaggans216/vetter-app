import { Star, MapPin, ShieldCheck, Award, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SERVICE_PRICES = {
  standard_verification: 39,
  specialist_vetting: 89,
  secure_exchange_presence: 149,
};

const SPECIALTY_LABELS = {
  mechanic: "Mechanic", electronics_technician: "Electronics Tech", appliance_expert: "Appliance Expert",
  jeweler: "Jeweler", watch_specialist: "Watch Specialist", luxury_authenticator: "Luxury Auth.",
  contractor: "Contractor", furniture_expert: "Furniture Expert", property_verifier: "Property Verifier",
  security_professional: "Security Pro", other: "Other",
};

function tierBadge(vetter) {
  if (vetter.secure_exchange_approved) return { label: "Premium", className: "bg-amber-50 text-amber-700 border-amber-100" };
  if (vetter.certified_specialist) return { label: "Certified", className: "bg-chart-3/15 text-chart-3 border-chart-3/20" };
  return { label: "Standard", className: "bg-primary/10 text-primary border-primary/15" };
}

export default function VetterListCard({ vetter, distanceMi, onSelect, onViewOnMap, selected }) {
  const price = Math.min(...(vetter.service_types || []).map(s => SERVICE_PRICES[s] || 39).filter(Boolean), 999);
  const tier = tierBadge(vetter);

  return (
    <div className={cn(
      "p-4 bg-card rounded-2xl border-2 transition-all shadow-sm",
      selected ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/20 hover:shadow-md"
    )}>
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar + availability */}
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-border/60">
            {vetter.avatar_url
              ? <img src={vetter.avatar_url} alt="" className="w-full h-full object-cover" />
              : <span className="text-primary font-bold text-base">{vetter.display_name?.[0]?.toUpperCase()}</span>}
          </div>
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
            vetter.available ? "bg-chart-3" : "bg-gray-400"
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <p className="font-heading font-bold text-foreground text-[15px] truncate">{vetter.display_name}</p>
            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0", tier.className)}>
              {tier.label}
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground truncate">
            {vetter.specialties?.map(s => SPECIALTY_LABELS[s] || s).slice(0, 2).join(" · ") || "General Inspector"}
          </p>
        </div>
      </div>

      {/* Metrics row */}
      <div className="flex items-center gap-3 mb-3">
        {vetter.rating && (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-[12px] font-semibold text-foreground">{vetter.rating.toFixed(1)}</span>
            {vetter.total_reviews > 0 && <span className="text-[11px] text-muted-foreground">({vetter.total_reviews})</span>}
          </div>
        )}
        {distanceMi != null && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[12px] text-muted-foreground">{distanceMi.toFixed(1)} mi away</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[12px] text-muted-foreground">{vetter.avg_response_time || "< 2h"}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-[18px] font-heading font-bold text-foreground">From ${price}</span>
          <span className="text-[11px] text-muted-foreground ml-1">/ inspection</span>
        </div>
        <div className="flex gap-2">
          {onViewOnMap && (
            <Button size="sm" variant="outline" onClick={() => onViewOnMap(vetter)} className="h-8 rounded-xl text-[12px] px-3">
              Map
            </Button>
          )}
          <Button size="sm" onClick={() => onSelect(vetter)} variant={selected ? "secondary" : "default"}
            className="h-8 rounded-xl text-[12px] font-semibold px-3">
            {selected ? "Selected ✓" : "Select"}
          </Button>
        </div>
      </div>
    </div>
  );
}