import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, LogOut, ShoppingBag, Wrench, Tag, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const ROLES = [
  {
    value: "buyer",
    label: "Buyer",
    description: "Verify items before buying from marketplace sellers",
    icon: ShoppingBag,
    color: "bg-primary/10 text-primary border-primary/20",
  },
  {
    value: "seller",
    label: "Seller",
    description: "Prove your listings are legit and build buyer trust",
    icon: Tag,
    color: "bg-accent/15 text-accent border-accent/20",
  },
  {
    value: "vetter",
    label: "Vetter",
    description: "Inspect items in person and earn money",
    icon: Wrench,
    color: "bg-chart-3/15 text-chart-3 border-chart-3/20",
  },
];

export default function Onboarding() {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, logout, refreshUser } = useAuth();

  const toggleRole = (value) => {
    setSelectedRoles((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
    );
  };

  const handleContinue = async () => {
    if (selectedRoles.length === 0) return;
    setSaving(true);
    setError(null);

    const timeout = setTimeout(() => {
      setSaving(false);
      setError("This is taking too long. Please try again.");
    }, 8000);

    try {
      // Primary role = first selected (for legacy compat); active_mode = first selected
      const primaryRole = selectedRoles[0];
      await base44.auth.updateMe({
        app_role: primaryRole,
        app_roles: selectedRoles,
        active_mode: primaryRole,
        onboarded: true,
      });
      await refreshUser();
      clearTimeout(timeout);
      setSaving(false);

      if (selectedRoles.includes("vetter")) {
        navigate("/vetter/onboarding");
      } else if (primaryRole === "seller") {
        navigate("/dashboard/seller");
      } else {
        navigate("/dashboard/buyer");
      }
    } catch (err) {
      clearTimeout(timeout);
      setSaving(false);
      const msg = err?.data?.message || err?.message || String(err);
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
        <div className="flex items-center justify-between gap-3 mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          {isAuthenticated && (
            <button
              onClick={() => logout(false)}
              className="inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-8">
          <img
            src="https://media.base44.com/images/public/69d2a34ea0832e2ee10bd09e/1703aad83_image.png"
            alt="Vetter"
            className="h-13 w-auto"
            style={{ mixBlendMode: "multiply" }}
          />
        </div>

        <h2 className="text-[24px] font-heading font-bold text-foreground mb-2">
          How will you use Vetter?
        </h2>
        <p className="text-muted-foreground text-[14px] mb-1">
          Select <strong>one or more</strong> roles. You can add more roles anytime from your profile.
        </p>
        <p className="text-muted-foreground text-[13px] mb-8 opacity-75">
          You won't need a separate account to switch between roles.
        </p>

        <div className="space-y-3">
          {ROLES.map((role) => {
            const isSelected = selectedRoles.includes(role.value);
            return (
              <motion.button
                key={role.value}
                onClick={() => toggleRole(role.value)}
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
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-foreground text-[15px]">
                      {role.label}
                    </p>
                    <p className="text-muted-foreground text-[13px] mt-0.5">
                      {role.description}
                    </p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                    isSelected ? "bg-primary border-primary" : "border-border"
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
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
        disabled={selectedRoles.length === 0 || saving}
        size="lg"
        className="w-full rounded-xl h-12 text-[15px] font-semibold shadow-sm mt-8"
      >
        {saving ? "Setting up..." : `Continue${selectedRoles.length > 1 ? ` with ${selectedRoles.length} roles` : ""}`}
      </Button>
    </div>
  );
}
