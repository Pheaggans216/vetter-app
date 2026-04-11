import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, ShieldCheck, Award, Zap, User, X, CheckCircle2 } from "lucide-react";

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

const TRUST_BADGES = [
  { key: "identity_verified", label: "ID Verified", icon: User, color: "bg-primary/10 text-primary" },
  { key: "background_checked", label: "Background Checked", icon: ShieldCheck, color: "bg-accent/15 text-accent" },
  { key: "certified_specialist", label: "Certified", icon: Award, color: "bg-chart-3/15 text-chart-3" },
  { key: "secure_exchange_approved", label: "Secure Exchange", icon: Zap, color: "bg-amber-50 text-amber-600" },
];

function AvailabilityPill({ available }) {
  if (available === false) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
        Offline
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-chart-3/15 text-[11px] font-semibold text-chart-3">
      <span className="w-1.5 h-1.5 rounded-full bg-chart-3 inline-block" />
      Available now
    </span>
  );
}

export default function VetterDetailPanel({ vetter, distanceMi, serviceType, onSelect, onClose, selected }) {
  if (!vetter) return null;

  const price = Math.min(...(vetter.service_types || []).map(s => SERVICE_PRICES[s] || 39).filter(Boolean), 999);
  const activeBadges = TRUST_BADGES.filter(b => vetter[b.key]);
  const eta = distanceMi ? `~${Math.round(distanceMi * 3 + 10)} min` : "~15 min";

  return (
    <AnimatePresence>
      <motion.div
        key={vetter.id}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl border-t border-border/60 z-30 max-h-[72vh] overflow-y-auto"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="px-5 pb-6 pt-2">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border border-border/60">
              {vetter.avatar_url
                ? <img src={vetter.avatar_url} alt="" className="w-full h-full object-cover" />
                : <span className="text-primary font-bold text-xl">{vetter.display_name?.[0]?.toUpperCase()}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading font-bold text-foreground text-[17px] leading-tight">{vetter.display_name}</h3>
                  <p className="text-muted-foreground text-[13px] mt-0.5">
                    {vetter.specialties?.map(s => SPECIALTY_LABELS[s] || s).slice(0, 2).join(" · ") || "General Inspector"}
                  </p>
                </div>
                <AvailabilityPill available={vetter.available} />
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <Stat label="Rating" value={vetter.rating ? `⭐ ${vetter.rating.toFixed(1)}` : "New"} />
            <Stat label="Jobs" value={vetter.total_inspections || 0} />
            <Stat label="Distance" value={distanceMi ? `${distanceMi.toFixed(1)} mi` : "Nearby"} />
            <Stat label="ETA" value={eta} />
          </div>

          {/* Price row */}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-2xl mb-4">
            <div>
              <p className="text-[11px] text-muted-foreground">Starting from</p>
              <p className="text-[20px] font-heading font-bold text-foreground">${price}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">Response time</p>
              <p className="text-[14px] font-semibold text-foreground">{vetter.avg_response_time || "Under 2 hrs"}</p>
            </div>
          </div>

          {/* Trust badges */}
          {activeBadges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {activeBadges.map(b => (
                <div key={b.key} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${b.color}`}>
                  <b.icon className="w-3 h-3" />
                  {b.label}
                </div>
              ))}
            </div>
          )}

          {/* Bio */}
          {vetter.bio && (
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 line-clamp-3">{vetter.bio}</p>
          )}

          {/* Why suggested note */}
          <div className="px-3 py-2.5 bg-primary/5 rounded-xl border border-primary/10 mb-5">
            <p className="text-[12px] text-primary leading-snug">
              Matched based on expertise, proximity to the item, and verification status.
            </p>
          </div>

          <Button
            onClick={() => onSelect(vetter)}
            size="lg"
            className="w-full rounded-xl h-12 text-[15px] font-semibold shadow-sm"
            variant={selected ? "secondary" : "default"}
          >
            {selected ? <><CheckCircle2 className="w-4 h-4 mr-2" />Selected</> : "Request This Vetter"}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center py-2.5 bg-card rounded-xl border border-border/60">
      <span className="text-[13px] font-bold text-foreground">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}