import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Shield, ShoppingBag, Wrench, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const roles = [
  {
    value: "buyer",
    label: "Buyer",
    description: "I want to verify items before buying",
    icon: ShoppingBag,
    color: "bg-primary/10 text-primary border-primary/20",
  },
  {
    value: "seller",
    label: "Seller",
    description: "I want to prove my listings are legit",
    icon: Tag,
    color: "bg-accent/15 text-accent border-accent/20",
  },
  {
    value: "vetter",
    label: "Vetter",
    description: "I want to inspect items and earn money",
    icon: Wrench,
    color: "bg-chart-3/15 text-chart-3 border-chart-3/20",
  },
];

export default function Onboarding() {
  const [selectedRole, setSelectedRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleContinue = async () => {
    setSaving(true);
    setError(null);

    const timeout = setTimeout(() => {
      setSaving(false);
      setError("This is taking too long. Please try again.");
    }, 8000);

    try {
      await base44.functions.invoke('setUserRole', { role: selectedRole });
      await refreshUser();
      clearTimeout(timeout);
      setSaving(false);
      if (selectedRole === "vetter") {
        navigate("/vetter/onboarding");
      } else if (selectedRole === "seller") {
        navigate("/dashboard/seller");
      } else {
        navigate("/dashboard/buyer");
      }
    } catch (err) {
      clearTimeout(timeout);
      setSaving(false);
      const msg = err?.data?.message || err?.message || String(err);
      console.error("[Onboarding] updateMe failed:", msg, err);
      setError(`Something went wrong: ${msg}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1"
      >
        <div className="flex items-center gap-2 mb-8">
          <img src="https://media.base44.com/images/public/69d2a34ea0832e2ee10bd09e/1703aad83_image.png" alt="Vetter" className="h-13 w-auto" style={{ mixBlendMode: 'multiply' }} />
        </div>

        <h2 className="text-[24px] font-heading font-bold text-foreground mb-2">
          Welcome! How will you use Vetter?
        </h2>
        <p className="text-muted-foreground text-[15px] mb-8">
          Choose your primary role. You can always change this later.
        </p>

        <div className="space-y-3">
          {roles.map((role) => {
            const isSelected = selectedRole === role.value;
            return (
              <motion.button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/60 bg-card hover:border-border"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", role.color)}>
                    <role.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground text-[15px]">
                      {role.label}
                    </p>
                    <p className="text-muted-foreground text-[13px] mt-0.5">
                      {role.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {error && (
        <div className="mt-4 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-[13px] text-center">
          {error}
        </div>
      )}

      <Button
        onClick={handleContinue}
        disabled={!selectedRole || saving}
        size="lg"
        className="w-full rounded-xl h-12 text-[15px] font-semibold shadow-sm mt-8"
      >
        {saving ? "Setting up..." : "Continue"}
      </Button>
    </div>
  );
}