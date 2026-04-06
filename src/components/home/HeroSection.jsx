import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="px-5 pt-8 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
            Vetter
          </h1>
        </div>
        <h2 className="text-[28px] leading-tight font-heading font-bold text-foreground mb-3">
          Buy with confidence.<br />Verified in the real world.
        </h2>
        <p className="text-muted-foreground font-body text-[15px] leading-relaxed mb-6 max-w-[300px]">
          A trusted local professional inspects the item in person — so you know exactly what you're getting before money changes hands.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/requests/new">
            <Button size="lg" className="rounded-xl h-12 px-6 text-[15px] font-semibold shadow-sm w-full">
              Get an item inspected
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/faq">
            <p className="text-[12px] text-muted-foreground text-center hover:text-primary transition-colors">
              How does it work? What does a Vetter do? →
            </p>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}