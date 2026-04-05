import { ShieldCheck, Star, Lock } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "Verified Pros" },
  { icon: Star, label: "4.9 Avg Rating" },
  { icon: Lock, label: "Secure Payments" },
];

export default function TrustBanner() {
  return (
    <section className="px-5 py-5">
      <div className="flex items-center justify-around py-4 px-3 bg-card rounded-2xl border border-border/60 shadow-sm">
        {badges.map((badge) => (
          <div key={badge.label} className="flex flex-col items-center gap-1.5">
            <badge.icon className="w-5 h-5 text-accent" />
            <span className="text-[11px] font-medium text-muted-foreground text-center">
              {badge.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}