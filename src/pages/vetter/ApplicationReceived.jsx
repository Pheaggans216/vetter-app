import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Home, User } from "lucide-react";

export default function ApplicationReceived() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm w-full text-center"
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-[26px] font-heading font-bold text-foreground mb-2">
          Application Received
        </h1>
        <p className="text-muted-foreground text-[15px] leading-relaxed mb-6">
          Your Vetter profile is under review. We'll notify you once you're approved.
        </p>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[13px] font-semibold mb-8">
          <Clock className="w-4 h-4" />
          Pending Review
        </div>

        {/* Info box */}
        <div className="bg-card border border-border/60 rounded-2xl px-5 py-4 text-left mb-8 space-y-3">
          <p className="text-[13px] font-semibold text-foreground">While you wait:</p>
          <ul className="space-y-2 text-[13px] text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              You can still use Vetter as a buyer
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Browse the map to see how vetters work
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              You'll receive an email when approved
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Link to="/" className="block">
            <button className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-[15px] hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </button>
          </Link>
          <Link to="/vetter/profile" className="block">
            <button className="w-full h-12 rounded-xl border border-border text-foreground font-semibold text-[15px] hover:bg-muted transition-colors flex items-center justify-center gap-2">
              <User className="w-4 h-4" />
              View My Profile
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}