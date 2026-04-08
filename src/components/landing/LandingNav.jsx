import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-border/40">
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="font-heading font-bold text-foreground text-[17px] tracking-tight">Vetter</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/vetter/onboarding">
            <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground hidden sm:flex">
              Become a Vetter
            </Button>
          </Link>
          <Link to="/requests/new">
            <Button size="sm" className="rounded-lg h-8 px-4 text-[13px] font-semibold">
              Request a Vetter
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}