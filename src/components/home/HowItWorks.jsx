import { Search, UserCheck, ClipboardCheck } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Search,
    title: "Submit a request",
    description: "Share the listing you found and tell us what you need inspected.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: UserCheck,
    title: "Get matched",
    description: "We connect you with a verified local professional near the item.",
    color: "bg-accent/15 text-accent",
  },
  {
    icon: ClipboardCheck,
    title: "Get your report",
    description: "Receive a detailed inspection report with photos and a recommendation.",
    color: "bg-chart-3/15 text-chart-3",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-5 py-6">
      <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
        How it works
      </h3>
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