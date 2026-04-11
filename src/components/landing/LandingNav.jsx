import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        <img src="https://media.base44.com/images/public/69d2a34ea0832e2ee10bd09e/efeafb0c3_Vetter_logo_with_ram_s_head_symbol.png"

        alt="Vetter" className="h-11 w-auto"

        style={{ mixBlendMode: 'multiply' }} />
        
        <div className="flex items-center gap-4">
          <a href="#how-it-works" className="hidden sm:block text-[13px] text-muted-foreground hover:text-foreground transition-colors font-medium">
            How it Works
          </a>
          <Link to="/vetter/onboarding" className="hidden sm:block text-[13px] text-muted-foreground hover:text-foreground transition-colors font-medium">
            Become a Vetter
          </Link>
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors">
            
            Sign Up
          </button>
        </div>
      </div>
    </nav>);

}