import { cn } from "@/lib/utils";
import { CheckCircle, Wrench, ShieldCheck, ClipboardCheck } from "lucide-react";

const ROLES = [
  {
    value: "standard_verification",
    label: "Standard Vetter",
    tagline: "General item inspection & condition reports",
    description: "Inspect common marketplace items and provide a clear photo-documented report. Great for electronics, furniture, appliances, and more.",
    price: "Starts at $39",
    icon: ClipboardCheck,
    color: "text-primary",
    bg: "bg-primary/10",
    badge: "Verified Vetter",
    requirements: ["Government-issued ID", "Profile photo", "Basic experience info"],
  },
  {
    value: "specialist_vetting",
    label: "Specialist Vetter",
    tagline: "Expert technical inspections in your field",
    description: "Leverage your professional expertise — mechanic, electronics tech, jeweler, etc. — to provide in-depth specialist evaluations.",
    price: "Starts at $89",
    icon: Wrench,
    color: "text-accent",
    bg: "bg-accent/15",
    badge: "Certified Specialist",
    requirements: ["Professional certification or license", "Specialty category selection", "Proof of expertise"],
  },
  {
    value: "secure_exchange_presence",
    label: "Secure Exchange Provider",
    tagline: "Safety presence during high-value transactions",
    description: "Attend the exchange in person to ensure a safe, professional handoff. Ideal for off-duty officers or licensed security personnel.",
    price: "Starts at $149",
    icon: ShieldCheck,
    color: "text-chart-3",
    bg: "bg-chart-3/15",
    badge: "Secure Exchange Provider",
    requirements: ["Law enforcement or security credentials", "Background check", "Ability to appear in uniform or identifiable attire"],
    requiresApproval: true,
  },
];

export default function StepRoles({ profile, update }) {
  const toggle = (val) => {
    const current = profile.service_types || [];
    if (current.includes(val)) {
      update({ service_types: current.filter((s) => s !== val) });
    } else {
      update({ service_types: [...current, val] });
    }
  };

  return (
    <div>
      <h2 className="text-[22px] font-heading font-bold text-foreground mb-1">What services can you provide?</h2>
      <p className="text-muted-foreground text-[14px] mb-6">
        Select all that apply. You can offer multiple roles — each has its own verification requirements.
      </p>
      <div className="space-y-3">
        {ROLES.map((role) => {
          const selected = profile.service_types?.includes(role.value);
          return (
            <button
              key={role.value}
              onClick={() => toggle(role.value)}
              className={cn(
                "w-full p-4 rounded-2xl border-2 text-left transition-all",
                selected ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 bg-card hover:border-border"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5", role.bg)}>
                  <role.icon className={cn("w-5 h-5", role.color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <div>
                      <p className="font-heading font-semibold text-foreground text-[15px] leading-tight">{role.label}</p>
                      <p className={cn("text-[12px] font-medium mt-0.5", role.color)}>{role.tagline}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[12px] font-semibold text-muted-foreground">{role.price}</span>
                      {selected && <CheckCircle className="w-4 h-4 text-primary" />}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-[12px] leading-relaxed mt-1">{role.description}</p>

                  {selected && (
                    <div className="mt-3 pt-3 border-t border-border/40 space-y-1.5">
                      <p className="text-[11px] font-semibold text-foreground uppercase tracking-wide mb-1">Requirements</p>
                      {role.requirements.map((req) => (
                        <div key={req} className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                          <span className="text-[12px] text-muted-foreground">{req}</span>
                        </div>
                      ))}
                      {role.requiresApproval && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <ShieldCheck className="w-3 h-3 text-chart-3" />
                          <span className="text-[11px] text-chart-3 font-medium">Subject to additional approval during review</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Multi-role note */}
      {(profile.service_types?.length || 0) > 1 && (
        <div className="mt-4 px-4 py-3 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-[12px] text-primary leading-snug">
            <strong>Multi-role profile:</strong> Your profile will display a badge for each verified role, making you more visible to a wider range of buyers.
          </p>
        </div>
      )}
    </div>
  );
}