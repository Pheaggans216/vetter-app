import { Award, DollarSign, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const perks = [
  { icon: DollarSign, title: "Earn $39–$149 per job", description: "Set your own availability and service radius. Work as much or as little as you like." },
  { icon: Calendar, title: "Flexible scheduling", description: "Accept only the jobs that fit your calendar. No quotas, no minimums." },
  { icon: Award, title: "Build a verified reputation", description: "Every completed job adds to your public profile. Strong Vetters get priority matching." },
];

export default function LandingBecomeVetter() {
  return (
    <section className="max-w-5xl mx-auto px-5 py-20">
      <div className="grid sm:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-[12px] font-semibold text-primary uppercase tracking-widest mb-3">For professionals</p>
          <h2 className="text-[30px] font-heading font-bold text-foreground mb-4 leading-tight">
            Turn your expertise into income.
          </h2>
          <p className="text-muted-foreground text-[15px] leading-relaxed mb-6">
            If you're a mechanic, jeweler, electronics tech, or any hands-on professional — Vetter gives you a platform to monetize what you already know. Help buyers in your community make confident decisions.
          </p>
          <Link to="/vetter/onboarding">
            <Button size="lg" className="rounded-xl h-12 px-6 text-[15px] font-semibold">
              Apply to become a Vetter
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>

        <div className="space-y-4">
          {perks.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.1 }}
              className="flex items-start gap-4 p-4 bg-card rounded-2xl border border-border/60 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground text-[14px] mb-0.5">{p.title}</p>
                <p className="text-muted-foreground text-[13px] leading-relaxed">{p.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}