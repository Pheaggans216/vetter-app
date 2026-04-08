import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "I was about to wire $4,200 for a truck I found on Facebook Marketplace. The Vetter found frame rust hidden under the paint. Saved me thousands.",
    name: "Marcus T.",
    role: "Buyer · Phoenix, AZ",
    rating: 5,
  },
  {
    quote: "The report was thorough, professional, and delivered within 24 hours. I felt like I had an expert friend on my side.",
    name: "Sarah K.",
    role: "Buyer · Austin, TX",
    rating: 5,
  },
  {
    quote: "As a retired jeweler, I love that Vetter gives me a way to keep doing what I'm good at — and help people make smarter purchases.",
    name: "David R.",
    role: "Vetter · Chicago, IL",
    rating: 5,
  },
];

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
      ))}
    </div>
  );
}

export default function LandingTestimonials() {
  return (
    <section className="bg-card border-y border-border/40 py-20">
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-[30px] font-heading font-bold text-foreground mb-3">What people say</h2>
          <p className="text-muted-foreground text-[15px]">Real experiences from buyers and Vetters.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col gap-4 p-6 rounded-2xl bg-background border border-border/60 shadow-sm"
            >
              <Stars count={t.rating} />
              <p className="text-foreground text-[14px] leading-relaxed flex-1">"{t.quote}"</p>
              <div>
                <p className="font-semibold text-foreground text-[13px]">{t.name}</p>
                <p className="text-muted-foreground text-[12px]">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-[11px] text-muted-foreground mt-6">
          Testimonials are representative of early user feedback. Vetter verifies items — not transaction outcomes.
        </p>
      </div>
    </section>
  );
}