import { Search, UserCheck, ClipboardCheck } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Search,
    title: "Share the listing",
    description: "Paste the URL of any secondhand listing. Tell us what to look for and where the item is located.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: UserCheck,
    title: "We match you with a local pro",
    description: "A verified, background-checked professional in your area is assigned to the job.",
    color: "bg-accent/15 text-accent",
  },
  {
    icon: ClipboardCheck,
    title: "Receive a clear report",
    description: "You get a photo-documented inspection report with a straightforward recommendation: buy, negotiate, or pass.",
    color: "bg-chart-3/15 text-chart-3",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-5 py-6">
      <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
        How it works
      </h3>
      <p className="text-[13px] text-muted-foreground mb-4">Reduce risk before you commit. It's that simple.</p>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex items-start gap-4 p-4 bg-card rounded-2xl border border-border/60 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center shrink-0`}>
              <step.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-semibold text-foreground text-[15px] mb-0.5">
                {step.title}
              </p>
              <p className="text-muted-foreground text-[13px] leading-relaxed">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}