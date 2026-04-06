import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

const faqs = [
  {
    q: "What does a Vetter do?",
    a: "A Vetter is a verified local professional — a mechanic, electronics technician, jeweler, or other specialist — who meets the item and seller in person. They physically inspect the item, document its condition with photos, check that it matches the listing, and deliver a written report with a clear recommendation: buy, negotiate, or pass.",
  },
  {
    q: "What if the item is not as described?",
    a: "If the Vetter finds that the item doesn't match the listing — hidden damage, incorrect specs, signs of tampering — their report will document this clearly. You can use the report to negotiate a fair price, request a different listing, or simply walk away. Vetter does not mediate disputes between buyers and sellers, but the report gives you documented evidence.",
  },
  {
    q: "What if I decide not to buy after receiving the report?",
    a: "That's completely fine — and it's exactly what the service is for. The inspection fee is non-refundable once the Vetter has completed their visit, since their time and travel have already been spent. Think of it as paying for information, not for a guaranteed purchase. The report belongs to you regardless of your decision.",
  },
  {
    q: "How are Vetters approved?",
    a: "Every Vetter goes through an identity verification process before being listed. Depending on their specialty, they may also submit professional certifications, undergo background screening, and be reviewed by our team. Vetters maintain their standing through consistent ratings from buyers. You can see each Vetter's credentials, reviews, and completed inspection count before you choose them.",
  },
  {
    q: "What is Secure Exchange Presence?",
    a: "Secure Exchange Presence is an optional service for higher-value transactions. Instead of — or in addition to — an inspection, a verified professional attends the physical handoff between you and the seller. Their presence creates accountability on both sides, discourages fraud or pressure, and ensures the exchange happens calmly and safely. This service starts at $149 and is available for approved Vetters only.",
  },
  {
    q: "Does Vetter guarantee the transaction outcome?",
    a: "No. Vetter provides an independent, professional inspection to help you make a more informed decision. We do not guarantee the condition of items after purchase, mediate disputes, or act as an escrow service. The Vetter's report reflects their professional assessment at the time of inspection. Vetter is a due-diligence tool — not a warranty.",
  },
  {
    q: "What if I'm not satisfied with the inspection report?",
    a: "If you believe the Vetter did not complete the inspection as agreed, please contact our support team. We take quality seriously and review every complaint. That said, we do not offer refunds based on disagreement with a Vetter's professional assessment — their independence is what gives the report its value.",
  },
  {
    q: "How long does an inspection take?",
    a: "Most standard inspections are completed within 24–48 hours of matching, depending on the Vetter's schedule and the item's location. Rush requests can sometimes be accommodated. Your Vetter will confirm a meeting time directly with the seller or arrange access to the item.",
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left"
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
        <div className="px-4 pb-4">
          <p className="text-[13px] text-muted-foreground leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="px-5 pt-4 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-heading font-bold text-foreground">Common Questions</h1>
      </div>

      <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/15 mb-6">
        <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-[13px] text-foreground leading-relaxed">
          Vetter helps you make informed decisions about secondhand purchases.{" "}
          <span className="text-muted-foreground">
            We verify — we don't guarantee. The goal is to reduce risk before you commit.
          </span>
        </p>
      </div>

      <div className="space-y-2">
        {faqs.map((item) => (
          <FAQItem key={item.q} {...item} />
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-2xl">
        <p className="text-[12px] text-muted-foreground leading-relaxed text-center">
          Still have questions?{" "}
          <a href="mailto:support@vetter.app" className="text-primary underline underline-offset-2">
            Contact our support team
          </a>
          . We typically respond within one business day.
        </p>
      </div>
    </div>
  );
}