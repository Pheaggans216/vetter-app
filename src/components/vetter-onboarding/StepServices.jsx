import { cn } from "@/lib/utils";
import { Search, Award, ShieldCheck } from "lucide-react";

const SERVICES = [
  {
    value: "standard_verification",
    label: "Standard Verification",
    price: "Starts at $39",
    description: "General inspection and condition report for common marketplace items.",
    icon: Search,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    value: "specialist_vetting",
    label: "Specialist Vetting",
    price: "Starts at $89",
    description: "In-depth technical inspection requiring expert knowledge in your specialty.",
    icon: Award,
    color: "text-accent",
    bg: "bg-accent/15",
  },
  {
    value: "secure_exchange_presence",
    label: "Secure Exchange Presence",
    price: "Starts at $149",
    description: "Physical presence during the exchange to ensure a safe, verified handoff for both parties. Requires background screening and approval.",
    icon: ShieldCheck,
    color: "text-chart-3",
    bg: "bg-chart-3/15",
    requiresApproval: true,
  },
];

export default function StepServices({ profile, update }) {
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
      <h2 className="text-[22px] font-heading font-bold text-foreground mb-1">Services you offer</h2>
      <p className="text-muted-foreground text-[14px] mb-6">
        Select the service types you're able to provide. You can offer multiple.
      </p>
      <div className="space-y-3">
        {SERVICES.map((s) => {
          const selected = profile.service_types?.includes(s.value);
          return (
            <button
              key={s.value}
              onClick={() => toggle(s.value)}
              className={cn(
                "w-full p-4 rounded-2xl border-2 text-left transition-all",
                selected ? "border-primary bg-primary/5" : "border-border/60 bg-card hover:border-border"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.bg)}>
                  <s.icon className={cn("w-5 h-5", s.color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-heading font-semibold text-foreground text-[14px]">{s.label}</p>
                    <span className={cn("text-[12px] font-semibold", s.color)}>{s.price}</span>
                  </div>
                  <p className="text-muted-foreground text-[12px] leading-relaxed">{s.description}</p>
                  {s.requiresApproval && selected && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <ShieldCheck className="w-3 h-3 text-chart-3" />
                      <span className="text-[11px] text-chart-3 font-medium">Subject to additional approval during review</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}