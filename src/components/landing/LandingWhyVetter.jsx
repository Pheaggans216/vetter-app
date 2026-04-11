import { Ban, BadgeCheck, Users, Heart } from "lucide-react";

const benefits = [
  {
    icon: Ban,
    title: "Avoid scams and fraud",
    desc: "Stop sending money to strangers for items that don't exist or aren't as described.",
    color: "bg-destructive/10 text-destructive",
  },
  {
    icon: BadgeCheck,
    title: "Verify before you pay",
    desc: "A certified local expert physically inspects high-value items on your behalf.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Users,
    title: "Real people. Real verification.",
    desc: "Our Vetters are background-checked, identity-verified professionals in your area.",
    color: "bg-accent/15 text-accent",
  },
  {
    icon: Heart,
    title: "Peace of mind, guaranteed",
    desc: "Buy with total confidence knowing an expert has your back every step of the way.",
    color: "bg-chart-3/15 text-chart-3",
  },
];

export default function LandingWhyVetter() {
  return (
    <section className="py-20 px-5 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[12px] font-semibold text-primary uppercase tracking-widest mb-3">Why Vetter</p>
          <h2 className="font-heading font-bold text-foreground text-[28px] sm:text-[36px] leading-tight">
            Stop getting burned on Marketplace
          </h2>
          <p className="text-muted-foreground text-[15px] mt-3 max-w-md mx-auto">
            Every day, buyers lose money to deceptive listings. Vetter changes that.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="flex items-start gap-4 p-5 bg-card rounded-2xl border border-border/60 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${b.color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground text-[15px] mb-1">{b.title}</h3>
                  <p className="text-muted-foreground text-[13px] leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}