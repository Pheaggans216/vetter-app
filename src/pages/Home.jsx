import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import CategoryGrid from "@/components/home/CategoryGrid";
import TrustBanner from "@/components/home/TrustBanner";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <TrustBanner />
      <CategoryGrid />
      <HowItWorks />
      <div className="px-5 pb-8 pt-2 text-center space-y-1">
        <Link to="/faq">
          <p className="text-[12px] text-muted-foreground hover:text-primary transition-colors">
            Common questions about how Vetter works →
          </p>
        </Link>
        <p className="text-[11px] text-muted-foreground/60 max-w-[280px] mx-auto leading-snug">
          Vetter verifies items professionally. We do not guarantee transaction outcomes or act as an escrow service.
        </p>
      </div>
    </div>
  );
}