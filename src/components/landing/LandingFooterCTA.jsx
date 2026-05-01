import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function LandingFooterCTA() {
  return (
    <section className="py-20 px-5">
      <div className="max-w-2xl mx-auto">
        {/* CTA Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent p-10 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
          <ShieldCheck className="w-10 h-10 text-white/80 mx-auto mb-5" />
          <h2 className="font-heading font-bold text-white text-[26px] sm:text-[32px] leading-tight mb-3">
            Found it online?{" "}
            <span className="text-white/90">Get it Vetted.</span>
          </h2>
          <p className="text-white/75 text-[15px] leading-relaxed mb-8 max-w-md mx-auto">
            Paste any listing link from Facebook Marketplace, Craigslist, eBay, or OfferUp. A local expert verifies it before you pay.
          </p>
          <Link
            to="/get-it-vetted"
            className="inline-flex items-center gap-2 h-13 px-8 py-3.5 rounded-xl bg-white text-primary text-[15px] font-bold hover:bg-white/90 transition-all shadow-lg hover:-translate-y-0.5"
          >
            Paste Listing Link
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-white/50 text-[12px] mt-5">Works with any marketplace · Vetters near you · Cancel anytime</p>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <Link to="/faq" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
          <Link to="/vetter/onboarding" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">Become a Vetter</Link>
          <Link to="/map" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">Find Vetters</Link>
        </div>
        <p className="text-center text-[11px] text-muted-foreground/50 mt-4">© 2026 Vetter. All rights reserved.</p>
      </div>
    </section>
  );
}