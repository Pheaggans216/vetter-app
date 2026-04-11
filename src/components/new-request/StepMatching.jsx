import { useEffect, useState } from "react";
import { CheckCircle2, Star, ArrowRight, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAKE_VETTERS = [
  { name: "Marcus T.", speciality: "Electronics & Vehicles", reviews: 47, distance: "1.2 mi away" },
  { name: "Sara J.", speciality: "Luxury Goods & Jewelry", reviews: 62, distance: "0.8 mi away" },
  { name: "Daniel R.", speciality: "General Inspection", reviews: 38, distance: "2.0 mi away" },
];

export default function StepMatching({ onNext, city, state }) {
  const [phase, setPhase] = useState("searching"); // searching | found
  const vetter = FAKE_VETTERS[Math.floor(Math.random() * FAKE_VETTERS.length)];

  useEffect(() => {
    const t = setTimeout(() => setPhase("found"), 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="px-5 pt-12 pb-10 flex flex-col items-center min-h-[calc(100vh-72px)]">
      <AnimatePresence mode="wait">
        {phase === "searching" ? (
          <motion.div
            key="searching"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center text-center"
          >
            {/* Pulsing ring animation */}
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-primary/30 animate-ping" style={{ animationDelay: "0.3s" }} />
              <div className="absolute inset-4 rounded-full bg-primary flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h2 className="font-heading font-bold text-foreground text-[24px] mb-2">
              Finding a trusted Vetter...
            </h2>
            <p className="text-muted-foreground text-[14px]">
              Searching near {city || "your area"}{state ? `, ${state}` : ""}
            </p>
            <div className="flex gap-1.5 mt-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="found"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center text-center w-full"
          >
            {/* Success badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5 shadow-lg shadow-primary/30"
            >
              <CheckCircle2 className="w-9 h-9 text-white" />
            </motion.div>

            <h2 className="font-heading font-bold text-foreground text-[26px] mb-1">Vetter Found ✅</h2>
            <p className="text-muted-foreground text-[14px] mb-8">A verified expert is ready near you</p>

            {/* Vetter card */}
            <div className="w-full p-5 bg-card rounded-2xl border border-border/60 shadow-md mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                  {vetter.name[0]}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-foreground text-[17px]">{vetter.name}</h3>
                    <span className="text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">Verified</span>
                  </div>
                  <p className="text-muted-foreground text-[12px]">{vetter.speciality}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => <Star key={s} className="w-3.5 h-3.5 fill-primary text-primary" />)}
                  <span className="text-[12px] text-muted-foreground ml-1">({vetter.reviews} reviews)</span>
                </div>
                <span className="text-[12px] text-muted-foreground">{vetter.distance}</span>
              </div>
            </div>

            <button
              onClick={onNext}
              className="w-full h-13 rounded-xl bg-primary text-primary-foreground text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}