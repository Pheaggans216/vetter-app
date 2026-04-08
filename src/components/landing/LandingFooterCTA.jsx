import { ArrowRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LandingFooterCTA() {
  return (
    <section className="bg-foreground py-20">
      <div className="max-w-5xl mx-auto px-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
          <Shield className="w-6 h-6 text-primary-foreground" />
        </div>
        <h2 className="text-[32px] font-heading font-bold text-primary-foreground mb-4 leading-tight">
          Don't buy blind.<br />Buy with confidence.
        </h2>
        <p className="text-primary-foreground/60 text-[15px] max-w-[400px] mx-auto mb-8 leading-relaxed">
          One inspection can save you hundreds — or thousands. Get a trusted professional on your side before money changes hands.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Link to="/requests/new">
            <Button size="lg" className="rounded-xl h-12 px-7 text-[15px] font-semibold bg-primary-foreground text-foreground hover:bg-primary-foreground/90 w-full sm:w-auto">
              Request a Vetter
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/vetter/onboarding">
            <Button variant="outline" size="lg" className="rounded-xl h-12 px-7 text-[15px] border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto">
              Become a Vetter
            </Button>
          </Link>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-foreground/40" />
            <span className="text-primary-foreground/40 text-[13px] font-heading font-bold">Vetter</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/faq"><span className="text-primary-foreground/40 text-[12px] hover:text-primary-foreground/70 transition-colors">FAQ</span></Link>
            <Link to="/requests/new"><span className="text-primary-foreground/40 text-[12px] hover:text-primary-foreground/70 transition-colors">Submit a request</span></Link>
            <Link to="/vetter/onboarding"><span className="text-primary-foreground/40 text-[12px] hover:text-primary-foreground/70 transition-colors">Become a Vetter</span></Link>
          </div>
          <p className="text-primary-foreground/30 text-[11px]">
            Vetter verifies. We do not guarantee outcomes.
          </p>
        </div>
      </div>
    </section>
  );
}