import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What does a Vetter do?",
    a: "A Vetter is a verified local professional who meets the seller, inspects the item in person, documents its condition with photos, and delivers a written report with a clear recommendation.",
  },
  {
    q: "What if the item is not as described?",
    a: "The Vetter's report will document any discrepancy clearly. You can use it to negotiate, request a different listing, or walk away — before any money changes hands.",
  },
  {
    q: "What if I decide not to buy after the report?",
    a: "That's exactly what the service is for. The inspection fee is non-refundable once the visit is complete, since the Vetter's time and travel have been spent. The report belongs to you regardless.",
  },
  {
    q: "How are Vetters approved?",
    a: "Every Vetter submits identity documents and professional credentials. Many are also background-checked. They maintain standing through consistent buyer ratings.",
  },
  {
    q: "What is Secure Exchange Presence?",
    a: "An optional add-on where a verified professional attends the physical handoff between buyer and seller — creating accountability and peace of mind on both sides. Starts at $149.",
  },
  {
    q: "Does Vetter guarantee the purchase?",
    a: "No. Vetter is a due-diligence service, not a warranty or escrow. The report reflects the Vetter's professional assessment at the time of inspection.",
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 py-4 text-left"
      >
        <span className="font-heading font-semibold text-foreground text-[14px] leading-snug">{q}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <p className="text-[13px] text-muted-foreground leading-relaxed pb-4">{a}</p>
      )}
    </div>
  );
}

export default function LandingFAQ() {
  return (
    <section className="max-w-5xl mx-auto px-5 py-20">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-[30px] font-heading font-bold text-foreground mb-3">Common questions</h2>
          <p className="text-muted-foreground text-[15px]">
            Clear answers about how Vetter works.
          </p>
        </div>
        <div className="bg-card rounded-2xl border border-border/60 px-6 shadow-sm">
          {faqs.map((item) => (
            <FAQItem key={item.q} {...item} />
          ))}
        </div>
        <p className="text-center mt-6 text-[13px] text-muted-foreground">
          More questions?{" "}
          <Link to="/faq" className="text-primary underline underline-offset-2">See the full FAQ</Link>
        </p>
      </div>
    </section>
  );
}