import { MapPin, ShieldCheck, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const pillars = [
  { icon: MapPin, value: "Now launching in Atlanta" },
  { icon: ShieldCheck, value: "Background-checked local Vetters" },
  { icon: Lock, value: "Payment held until you approve the report" },
];

export default function LandingTrust() {
  return (
    <section className="py-20 px-5">
      <div className="max-w-4xl mx-auto">
        {/* Trust pillars */}
        <div className="grid sm:grid-cols-3 gap-4 mb-16">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center p-5 bg-card rounded-2xl border border-border/60 shadow-sm">
                <Icon className="w-5 h-5 text-primary mb-2" />
                <span className="font-heading font-semibold text-foreground text-[14px] sm:text-[15px] leading-snug">{p.value}</span>
              </div>
            );
          })}
        </div>

        {/* Founding Vetters wanted */}
        <div className="text-center bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl border border-primary/15 p-10 sm:p-12">
          <p className="text-[12px] font-semibold text-primary uppercase tracking-widest mb-3">Now hiring</p>
          <h2 className="font-heading font-bold text-foreground text-[28px] sm:text-[34px] leading-tight mb-4">
            Founding Vetters wanted
          </h2>
          <p className="text-muted-foreground text-[15px] max-w-lg mx-auto leading-relaxed mb-7">
            We're building Vetter in Atlanta first. If you're a mechanic, jeweler, electronics tech, or any hands-on professional — help your community buy with confidence and earn on your own schedule.
          </p>
          <Link to="/vetter/onboarding">
            <Button size="lg" className="rounded-xl h-12 px-7 text-[15px] font-semibold gap-2">
              Become a Vetter
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}