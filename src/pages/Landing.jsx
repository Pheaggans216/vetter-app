import { motion } from "framer-motion";
import LandingNav from "@/components/landing/LandingNav";
import LandingHero from "@/components/landing/LandingHero";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingWhyVetter from "@/components/landing/LandingWhyVetter";
import LandingTrust from "@/components/landing/LandingTrust";
import LandingFooterCTA from "@/components/landing/LandingFooterCTA";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background font-body overflow-x-hidden">
      <LandingNav />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
      >
        <LandingHero />
        <LandingHowItWorks />
        <LandingWhyVetter />
        <LandingTrust />
        <LandingFooterCTA />
      </motion.div>
    </div>
  );
}