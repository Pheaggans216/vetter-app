import { Search, UserCheck, ClipboardCheck } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Share the listing",
    description:
      "Found something on Facebook Marketplace, Craigslist, or eBay? Paste the URL and tell us what you need inspected.",
    color: "bg-primary/10 text-primary",
  },
  {
    step: "02",
    icon: UserCheck,
    title: "We match you with a local pro",
    description:
      "A verified, background-checked specialist is assigned near the item's location — no travel required on your end.",
    color: "bg-accent/15 text-accent",
  },
  {
    step: "03",
    icon: ClipboardCheck,
    title: "Receive a clear report",
    description:
      "You get a photo-documented inspection report with a straightforward recommendation: buy, negotiate, or pass.",
    color: "bg-chart-3/15 text-chart-3",
  },
];

export default function LandingHowItWorks() {
  return (
    <section className="bg-card border-y border-border/40 py-20">
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-[30px] font-heading font-bold text-foreground mb-3">How it works</h2>
          <p className="text-muted-foreground text-[15px] max-w-[400px] mx-auto">
            Three steps to reduce risk before you commit.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col gap-4 p-6 rounded-2xl bg-background border border-border/60 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="text-[28px] font-heading font-bold text-border">{s.step}</span>
              </div>
              <div>
                <p className="font-heading font-bold text-foreground text-[16px] mb-1.5">{s.title}</p>
                <p className="text-muted-foreground text-[13px] leading-relaxed">{s.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}