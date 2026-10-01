import { Link } from "react-router-dom";
import { MapPin, ShieldCheck, Video, BadgeCheck } from "lucide-react";

const points = [
  { icon: MapPin, title: "Safe exchange zones", desc: "Choose to meet at a police safe exchange zone, a free, camera-monitored lot. We'll point you to the nearest one." },
  { icon: ShieldCheck, title: "Security escorts for big deals", desc: "Buying something worth $5,000 or more? Request a licensed security officer to stand by during the exchange." },
  { icon: BadgeCheck, title: "Verified Vetters", desc: "Every Vetter is identity-verified before they take a job, and every report is tied to the item's serial number." },
  { icon: Video, title: "Don't go alone", desc: "Out of town or uneasy? Your Vetter goes in your place and can show you everything on a live video call." },
];

export default function LandingSafety() {
  return (
    <section className="py-20 px-5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[12px] font-semibold text-primary uppercase tracking-widest mb-3">Safety first</p>
          <h2 className="font-heading font-bold text-foreground text-[28px] sm:text-[36px] leading-tight">
            Get the deal without the danger
          </h2>
          <p className="text-muted-foreground text-[15px] mt-3 max-w-md mx-auto">
            Marketplace meetups can turn into robberies. Vetter helps you meet safely, or skip the meetup altogether.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {points.map(p => (
            <div key={p.title} className="p-5 bg-card rounded-2xl border border-border/60 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <p.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-heading font-bold text-foreground text-[15px]">{p.title}</p>
                <p className="text-muted-foreground text-[13px] mt-1 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/get-it-vetted" className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 h-11 text-[14px] font-semibold">
            Get It Vetted Safely
          </Link>
        </div>
      </div>
    </section>
  );
}
