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
      <LandingHero />
      <LandingHowItWorks />
      <LandingWhyVetter />
      <LandingTrust />
      <LandingFooterCTA />
    </div>
  );
}