import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import CategoryGrid from "@/components/home/CategoryGrid";
import TrustBanner from "@/components/home/TrustBanner";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <TrustBanner />
      <CategoryGrid />
      <HowItWorks />
    </div>
  );
}