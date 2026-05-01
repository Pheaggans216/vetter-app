import { Link2, UserCheck, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Link2,
    step: "01",
    title: "Paste any listing link",
    desc: "Found something on Facebook Marketplace, Craigslist, eBay, or OfferUp? Just paste the link — or enter details manually.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: UserCheck,
    step: "02",
    title: "Choose your verification level",
    desc: "Pick Basic, Standard, or Expert based on the item's value and risk. A certified local Vetter gets matched to your request.",
    color: "bg-accent/15 text-accent",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Vetter inspects it. You decide.",
    desc: "Your Vetter meets the seller, inspects the item in person, and sends you a full report before you pay a cent.",
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
            Paste a listing from any marketplace and let a local expert verify it before you pay.
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