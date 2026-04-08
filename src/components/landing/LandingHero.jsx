import { ArrowRight, ShieldCheck, Star, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const stats = [
  { icon: UserCheck, label: "ID-verified professionals" },
  { icon: Star, label: "4.9 avg. buyer rating" },
  { icon: ShieldCheck, label: "Background-checked Vetters" },
];

export default function LandingHero() {
  return (
    <section className="max-w-5xl mx-auto px-5 pt-16 pb-20 text-center">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span className="text-[12px] font-medium text-primary">Real-world verification for online listings</span>
        </div>

        <h1 className="text-[42px] sm:text-[56px] leading-[1.1] font-heading font-bold text-foreground mb-5 tracking-tight">
          Verify before<br className="hidden sm:block" /> you buy.
        </h1>

        <p className="text-[17px] text-muted-foreground leading-relaxed max-w-[520px] mx-auto mb-8">
          Vetter sends trusted local professionals to inspect online marketplace items
          before money changes hands. Buy with confidence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Link to="/requests/new">
            <Button size="lg" className="rounded-xl h-12 px-7 text-[15px] font-semibold shadow-sm w-full sm:w-auto">
              Request a Vetter
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/vetter/onboarding">
            <Button variant="outline" size="lg" className="rounded-xl h-12 px-7 text-[15px] w-full sm:w-auto">
              Become a Vetter
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-muted-foreground">
              <s.icon className="w-4 h-4 text-accent" />
              <span className="text-[13px]">{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}