import { ShieldCheck, UserCheck, DollarSign, ArrowRight } from "lucide-react";

const bullets = [
  { icon: ShieldCheck, text: "Avoid scams and fake listings" },
  { icon: UserCheck, text: "Real person, in-person verification" },
  { icon: DollarSign, text: "Only pay after you're satisfied" },
];

export default function StepIntro({ onNext }) {
  return (
    <div className="px-5 pt-8 pb-10 flex flex-col min-h-[calc(100vh-72px)]">
      {/* Icon */}
      <div className="flex justify-center mb-8">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg">
          <ShieldCheck className="w-9 h-9 text-primary" />
        </div>
      </div>

      {/* Text */}
      <div className="text-center mb-10">
        <h1 className="font-heading font-bold text-foreground text-[30px] leading-tight mb-3">
          Verify Before You Buy
        </h1>
        <p className="text-muted-foreground text-[16px] leading-relaxed max-w-sm mx-auto">
          A local Vetter will inspect the item and confirm it's real, safe, and as described—before you pay.
        </p>
      </div>

      {/* Bullets */}
      <div className="space-y-3 mb-10">
        {bullets.map((b, i) => {
          const Icon = b.icon;
          return (
            <div key={i} className="flex items-center gap-3.5 p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <span className="text-[14px] font-medium text-foreground">{b.text}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-auto">
        <button
          onClick={onNext}
          className="w-full h-13 rounded-xl bg-primary text-primary-foreground text-[16px] font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
        >
          Start Request
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-center text-[12px] text-muted-foreground mt-3">Free to submit · No commitment</p>
      </div>
    </div>
  );
}