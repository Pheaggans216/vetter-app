import { Shield, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const benefits = [
  "A verified professional attends the physical handoff",
  "Both parties feel safe completing the transaction",
  "Deters fraud, pressure, and unsafe situations",
  "Required for high-value and cash-heavy transactions",
];

export default function LandingSecureExchange() {
  return (
    <section className="bg-card border-y border-border/40 py-20">
      <div className="max-w-5xl mx-auto px-5">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 mb-5">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-[12px] font-medium text-primary">Premium add-on</span>
            </div>

            <h2 className="text-[28px] font-heading font-bold text-foreground mb-3">
              Secure Exchange Presence
            </h2>
            <p className="text-muted-foreground text-[15px] leading-relaxed mb-6">
              For high-value transactions, some buyers and sellers choose to complete the
              exchange with a verified professional present. It creates calm, accountability,
              and peace of mind on both sides — without needing law enforcement involvement.
            </p>

            <div className="space-y-2.5 mb-8">
              {benefits.map((b) => (
                <div key={b} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span className="text-[14px] text-foreground">{b}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link to="/requests/new">
                <Button className="rounded-xl h-10 px-5 text-[14px] font-semibold">
                  Add to a request
                </Button>
              </Link>
              <Link to="/faq">
                <span className="text-[13px] text-muted-foreground hover:text-primary transition-colors">
                  Learn more →
                </span>
              </Link>
            </div>

            <p className="mt-5 text-[12px] text-muted-foreground">
              Starting at $149 · Available with approved Vetters only
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}