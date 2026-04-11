import { Search, MapPin, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Find an item you want to buy",
    desc: "Spot something on Facebook Marketplace, Craigslist, OfferUp, or any platform.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: MapPin,
    step: "02",
    title: "Request a Vetter in your area",
    desc: "Submit your request and we'll match you with a verified local expert.",
    color: "bg-accent/15 text-accent",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Vetter verifies before you pay",
    desc: "Your Vetter inspects the item in person and sends you a detailed report.",
    color: "bg-chart-3/15 text-chart-3",
  },
];

export default function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[12px] font-semibold text-primary uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="font-heading font-bold text-foreground text-[28px] sm:text-[36px] leading-tight">
            How Vetter works
          </h2>
          <p className="text-muted-foreground text-[15px] mt-3 max-w-md mx-auto">
            Three easy steps between you and a safe, confident purchase.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="relative p-6 bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[28px] font-heading font-bold text-border leading-none pt-1">{s.step}</span>
                </div>
                <h3 className="font-heading font-bold text-foreground text-[16px] mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-[13px] leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}