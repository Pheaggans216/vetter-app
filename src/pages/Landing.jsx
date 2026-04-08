import LandingNav from "@/components/landing/LandingNav";
import LandingHero from "@/components/landing/LandingHero";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingWhyVetter from "@/components/landing/LandingWhyVetter";
import LandingCategories from "@/components/landing/LandingCategories";
import LandingPlatforms from "@/components/landing/LandingPlatforms";
import LandingBecomeVetter from "@/components/landing/LandingBecomeVetter";
import LandingSecureExchange from "@/components/landing/LandingSecureExchange";
import LandingTestimonials from "@/components/landing/LandingTestimonials";
import LandingFAQ from "@/components/landing/LandingFAQ";
import LandingFooterCTA from "@/components/landing/LandingFooterCTA";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background font-body">
      <LandingNav />
      <LandingHero />
      <LandingHowItWorks />
      <LandingWhyVetter />
      <LandingPlatforms />
      <LandingCategories />
      <LandingSecureExchange />
      <LandingBecomeVetter />
      <LandingTestimonials />
      <LandingFAQ />
      <LandingFooterCTA />
    </div>
  );
}