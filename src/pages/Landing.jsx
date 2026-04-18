import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import LandingNav from "@/components/landing/LandingNav";
import LandingHero from "@/components/landing/LandingHero";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingWhyVetter from "@/components/landing/LandingWhyVetter";
import LandingTrust from "@/components/landing/LandingTrust";
import LandingFooterCTA from "@/components/landing/LandingFooterCTA";

export default function Landing() {
  const { user, isAuthenticated } = useAuth();
  const showOnboardingNotice = isAuthenticated && !user?.onboarded;

  return (
    <div className="min-h-screen bg-background font-body overflow-x-hidden">
      <LandingNav />
      {showOnboardingNotice && (
        <div className="border-b border-border/40 bg-card/80">
          <div className="max-w-5xl mx-auto px-5 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] font-semibold text-foreground">Finish onboarding when you're ready.</p>
              <p className="text-[12px] text-muted-foreground">
                You can stay on the public homepage or continue setting up your account.
              </p>
            </div>
            <Link
              to="/onboarding"
              className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors"
            >
              Continue Onboarding
            </Link>
          </div>
        </div>
      )}
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
