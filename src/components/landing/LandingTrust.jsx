import { ShieldCheck, Star, Zap } from "lucide-react";

const stats = [
  { icon: ShieldCheck, value: "10,000+", label: "Transactions Protected" },
  { icon: Star, value: "4.9 / 5", label: "Average Vetter Rating" },
  { icon: Zap, value: "< 2 hrs", label: "Average Response Time" },
];

export default function LandingTrust() {
  return (
    <section className="py-20 px-5">
      <div className="max-w-4xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-16">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center p-5 bg-card rounded-2xl border border-border/60 shadow-sm">
                <Icon className="w-5 h-5 text-primary mb-2" />
                <span className="font-heading font-bold text-foreground text-[22px] sm:text-[28px]">{s.value}</span>
                <span className="text-muted-foreground text-[11px] sm:text-[12px] mt-0.5 leading-snug">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Testimonial placeholder */}
        <div className="text-center mb-12">
          <p className="text-[12px] font-semibold text-primary uppercase tracking-widest mb-3">Built for trust</p>
          <h2 className="font-heading font-bold text-foreground text-[28px] sm:text-[34px] leading-tight mb-4">
            Built for safe marketplace buying
          </h2>
          <p className="text-muted-foreground text-[15px] max-w-lg mx-auto leading-relaxed">
            Whether it's a used car, a luxury watch, or expensive electronics — Vetter connects you with local experts who protect your purchase.
          </p>
        </div>

        {/* Testimonial cards placeholder */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { quote: "Saved me from a $3,000 mistake on a fake MacBook Pro.", name: "Alex T.", role: "Buyer" },
            { quote: "The Vetter showed up within an hour. I bought with confidence.", name: "Maria S.", role: "Buyer" },
            { quote: "Game-changer for high-value purchases. Should've existed years ago.", name: "James R.", role: "Buyer" },
          ].map((t, i) => (
            <div key={i} className="p-5 bg-card rounded-2xl border border-border/60 shadow-sm">
              <div className="flex gap-0.5 mb-3">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-[13px] text-foreground leading-relaxed mb-3 italic">"{t.quote}"</p>
              <div>
                <p className="text-[12px] font-semibold text-foreground">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}