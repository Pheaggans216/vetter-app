import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-border/40">
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/69d2a34ea0832e2ee10bd09e/1703aad83_image.png" alt="Vetter" className="h-8 w-auto" />
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