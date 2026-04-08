import { ShieldCheck, FileText, MapPin, Clock, Star, Lock } from "lucide-react";
import { motion } from "framer-motion";

const reasons = [
  {
    icon: ShieldCheck,
    title: "Verified in the real world",
    description: "Every Vetter is identity-verified and reviewed by our team before they take a single job.",
  },
  {
    icon: FileText,
    title: "Documented, honest reports",
    description: "Photo evidence, condition grading, and a clear buy / negotiate / pass recommendation — no fluff.",
  },
  {
    icon: MapPin,
    title: "Local professionals, not call centers",
    description: "Vetters are real people in your city with relevant expertise for the item you're buying.",
  },
  {
    icon: Clock,
    title: "Fast turnaround",
    description: "Most inspections are scheduled and completed within 24–48 hours of your request.",
  },
  {
    icon: Star,
    title: "Rated after every job",
    description: "Buyers rate every Vetter. Poor performers don't stay on the platform.",
  },
  {
    icon: Lock,
    title: "Independent, unbiased assessment",
    description: "Vetters have no stake in whether you buy. Their only job is an honest evaluation.",
  },
];

export default function LandingWhyVetter() {
  return (
    <section className="max-w-5xl mx-auto px-5 py-20">
      <div className="text-center mb-12">
        <h2 className="text-[30px] font-heading font-bold text-foreground mb-3">Why Vetter?</h2>
        <p className="text-muted-foreground text-[15px] max-w-[400px] mx-auto">
          Secondhand platforms are full of great deals — and real risk. Vetter closes that gap.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {reasons.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <r.icon className="w-4.5 h-4.5 text-primary" />
            </div>
            <p className="font-heading font-semibold text-foreground text-[14px] mb-1">{r.title}</p>
            <p className="text-muted-foreground text-[13px] leading-relaxed">{r.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}