import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import CategoryGrid from "@/components/home/CategoryGrid";
import TrustBanner from "@/components/home/TrustBanner";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Top bar with auth buttons */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-lg mx-auto px-5 h-13 flex items-center justify-between py-2">
          <img
            src="https://media.base44.com/images/public/69d2a34ea0832e2ee10bd09e/1703aad83_image.png"
            alt="Vetter"
            className="h-9 w-auto"
            style={{ mixBlendMode: 'multiply' }}
          />
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/home">
                <button className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors">
                  Dashboard
                </button>
              </Link>
            ) : (
              <>
                <button
                  onClick={() => base44.auth.redirectToLogin(window.location.href)}
                  className="h-8 px-4 rounded-lg border border-border text-foreground text-[13px] font-semibold hover:bg-muted transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => base44.auth.redirectToLogin(window.location.href)}
                  className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
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