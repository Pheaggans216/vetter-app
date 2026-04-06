import { Shield, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const BENEFITS = [
  "A verified professional is present during the exchange",
  "Both parties feel safe completing the transaction",
  "Deters fraud, pressure, or unsafe situations",
];

export default function SecureExchangeCard({ selected, onToggle, trigger }) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 overflow-hidden transition-all",
        selected ? "border-primary" : "border-primary/20"
      )}
    >
      {/* Header */}
      <div className="bg-primary/5 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-primary shrink-0" />
          <p className="text-[12px] font-semibold text-primary uppercase tracking-wide">
            Optional Premium Add-on
          </p>
        </div>
        <h3 className="font-heading font-bold text-foreground text-[16px] mb-1">
          Secure Exchange Presence
        </h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          For higher-value transactions, some users choose to complete the exchange with a verified security professional present — for peace of mind on both sides.
        </p>
      </div>

      {/* Benefits */}
      <div className="px-4 py-3 space-y-1.5 bg-card">
        {BENEFITS.map((b, i) => (
          <div key={i} className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
            <span className="text-[12px] text-muted-foreground">{b}</span>
          </div>
        ))}
      </div>

      {/* Trigger reason */}
      {trigger && (
        <div className="px-4 py-2 bg-primary/5 border-t border-primary/10">
          <p className="text-[11px] text-primary">{trigger}</p>
        </div>
      )}

      {/* CTA */}
      <div className="px-4 pb-4 pt-3 bg-card border-t border-border/40">
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all",
            selected
              ? "border-primary bg-primary/5"
              : "border-border/60 hover:border-primary/30"
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
              selected ? "border-primary bg-primary" : "border-muted-foreground"
            )}>
              {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
            <div className="text-left">
              <p className="text-[13px] font-semibold text-foreground">
                {selected ? "Added to request" : "Add Secure Exchange"}
              </p>
              <p className="text-[11px] text-muted-foreground">+$149 · Matched with approved professional</p>
            </div>
          </div>
          {!selected && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </button>
      </div>
    </div>
  );
}