import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, ChevronDown } from "lucide-react";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/8 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-5 pt-20 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span className="text-[12px] font-semibold text-primary">Trusted Verification Platform</span>
        </div>

        {/* Headline */}
        <h1 className="font-heading font-bold text-foreground text-[38px] sm:text-[52px] leading-[1.1] tracking-tight mb-5">
          Buy anything safely.{" "}
          <span className="text-primary">Get it Vetted</span>{" "}
          first.
        </h1>

        {/* Subheadline */}
        <p className="text-muted-foreground text-[17px] sm:text-[19px] leading-relaxed mb-10 max-w-xl mx-auto">
          Local experts verify items before you pay—no more scams, no more regrets.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/requests/new"
            className="inline-flex items-center gap-2 h-13 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground text-[15px] font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
          >
            Request a Vetter
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 h-13 px-6 py-3.5 rounded-xl border border-border bg-card text-[15px] font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            How it works
            <ChevronDown className="w-4 h-4" />
          </a>
        </div>

        {/* Social proof micro-copy */}
        <p className="text-[12px] text-muted-foreground mt-6">
          ✓ No credit card required &nbsp;&nbsp;✓ Available in your city &nbsp;&nbsp;✓ 5-star vetters
        </p>
      </div>
    </section>
  );
}