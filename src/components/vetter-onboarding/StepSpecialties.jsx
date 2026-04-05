import { cn } from "@/lib/utils";
import { Wrench, Smartphone, Plug, Gem, Watch, Star, HardHat, Sofa, Home, Shield, MoreHorizontal } from "lucide-react";

const SPECIALTIES = [
  { value: "mechanic", label: "Mechanic", icon: Wrench },
  { value: "electronics_technician", label: "Electronics Tech", icon: Smartphone },
  { value: "appliance_expert", label: "Appliance Expert", icon: Plug },
  { value: "jeweler", label: "Jeweler", icon: Gem },
  { value: "watch_specialist", label: "Watch Specialist", icon: Watch },
  { value: "luxury_authenticator", label: "Luxury Auth.", icon: Star },
  { value: "contractor", label: "Contractor", icon: HardHat },
  { value: "furniture_expert", label: "Furniture Expert", icon: Sofa },
  { value: "property_verifier", label: "Property Verifier", icon: Home },
  { value: "security_professional", label: "Security Pro", icon: Shield },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

export default function StepSpecialties({ profile, update }) {
  const toggle = (val) => {
    const current = profile.specialties || [];
    if (current.includes(val)) {
      update({ specialties: current.filter((s) => s !== val) });
    } else {
      update({ specialties: [...current, val] });
    }
  };

  return (
    <div>
      <h2 className="text-[22px] font-heading font-bold text-foreground mb-1">Your specialties</h2>
      <p className="text-muted-foreground text-[14px] mb-6">
        Select all areas where you have professional expertise. Buyers will be matched based on this.
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        {SPECIALTIES.map((s) => {
          const selected = profile.specialties?.includes(s.value);
          return (
            <button
              key={s.value}
              onClick={() => toggle(s.value)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all text-center",
                selected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/60 bg-card hover:border-border"
              )}
            >
              <s.icon className={cn("w-5 h-5", selected ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-[11px] font-medium leading-tight", selected ? "text-primary" : "text-foreground")}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}