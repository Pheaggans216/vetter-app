import { ArrowRight } from "lucide-react";

const platforms = [
  { name: "Facebook Marketplace", color: "bg-blue-50 text-blue-700 border-blue-100" },
  { name: "Craigslist", color: "bg-purple-50 text-purple-700 border-purple-100" },
  { name: "eBay", color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
  { name: "OfferUp", color: "bg-green-50 text-green-700 border-green-100" },
];

export default function LandingPlatforms() {
  return (
    <section className="bg-card border-y border-border/40 py-16">
      <div className="max-w-5xl mx-auto px-5 text-center">
        <h2 className="text-[26px] font-heading font-bold text-foreground mb-3">
          Works with the platforms you already use
        </h2>
        <p className="text-muted-foreground text-[15px] max-w-[480px] mx-auto mb-10">
          Vetter doesn't replace your favorite marketplaces — it works alongside them. Keep browsing where you always do. When you find something worth verifying, bring Vetter in.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {platforms.map((p) => (
            <div
              key={p.name}
              className={`px-5 py-2.5 rounded-full border text-[13px] font-semibold ${p.color}`}
            >
              {p.name}
            </div>
          ))}
        </div>
        <div className="max-w-[420px] mx-auto p-5 rounded-2xl bg-primary/5 border border-primary/15 text-left">
          <p className="text-[14px] text-foreground leading-relaxed">
            <span className="font-semibold">How it works with your marketplace:</span> You stay on your platform, find an item you like, then submit the listing URL to Vetter. We handle everything else — no need to change how you shop.
          </p>
          <div className="flex items-center gap-1.5 mt-3 text-primary text-[13px] font-medium">
            <ArrowRight className="w-3.5 h-3.5" />
            No account linking required on any marketplace
          </div>
        </div>
      </div>
    </section>
  );
}