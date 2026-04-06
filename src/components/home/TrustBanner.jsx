import { ShieldCheck, Star, UserCheck, Lock } from "lucide-react";

const badges = [
  { icon: UserCheck, label: "ID-Verified Pros" },
  { icon: Star, label: "4.9 Avg Rating" },
  { icon: ShieldCheck, label: "Background Checked" },
  { icon: Lock, label: "Secure Payments" },
];

export default function TrustBanner() {
  return (
    <section className="px-5 py-5">
      <div className="grid grid-cols-4 gap-1 py-4 px-3 bg-card rounded-2xl border border-border/60 shadow-sm">
        {badges.map((badge) => (
          <div key={badge.label} className="flex flex-col items-center gap-1.5">
            <badge.icon className="w-5 h-5 text-accent" />
            <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">
              {badge.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}