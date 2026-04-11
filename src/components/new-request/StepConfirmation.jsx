import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function StepConfirmation({ onTrack }) {
  return (
    <div className="px-5 pt-16 pb-10 flex flex-col items-center text-center min-h-screen">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-7 shadow-xl shadow-primary/30"
      >
        <CheckCircle2 className="w-11 h-11 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <h2 className="font-heading font-bold text-foreground text-[28px] leading-tight mb-3">
          Request Submitted! 🎉
        </h2>
        <p className="text-muted-foreground text-[15px] leading-relaxed mb-3 max-w-xs mx-auto">
          A Vetter will contact you shortly with updates.
        </p>
        <p className="text-[13px] text-muted-foreground max-w-[260px] mx-auto leading-relaxed mb-10">
          You'll receive a notification once your Vetter is confirmed and ready to inspect.
        </p>

        <button
          onClick={onTrack}
          className="inline-flex items-center gap-2 h-13 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground text-[15px] font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
        >
          Track your request
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[12px] text-muted-foreground mt-5">
          ✓ You'll be notified via email &nbsp;·&nbsp; ✓ Cancel anytime
        </p>
      </motion.div>
    </div>
  );
}