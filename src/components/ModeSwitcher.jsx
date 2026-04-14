import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ShoppingBag, Tag, Wrench, Shield, ChevronDown, Check } from "lucide-react";

const MODE_CONFIG = {
  buyer: { label: "Buyer", icon: ShoppingBag, color: "text-primary", bg: "bg-primary/10" },
  seller: { label: "Seller", icon: Tag, color: "text-accent", bg: "bg-accent/10" },
  vetter: { label: "Vetter", icon: Wrench, color: "text-chart-3", bg: "bg-chart-3/10" },
  pro_security: { label: "Pro Security", icon: Shield, color: "text-purple-600", bg: "bg-purple-50" },
};

const MODE_ROUTES = {
  buyer: "/dashboard/buyer",
  seller: "/dashboard/seller",
  vetter: "/vetter/dashboard",
  pro_security: "/dashboard/buyer", // fallback until pro_security dashboard exists
};

export default function ModeSwitcher({ compact = false }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Derive available modes: use app_roles if set, fall back to legacy app_role
  const availableModes = user?.app_roles?.length
    ? user.app_roles
    : user?.app_role
    ? [user.app_role]
    : ["buyer"];

  const currentMode = user?.active_mode || user?.app_role || "buyer";
  const current = MODE_CONFIG[currentMode] || MODE_CONFIG.buyer;
  const CurrentIcon = current.icon;

  // Only show switcher if user has more than one mode
  if (availableModes.length <= 1) return null;

  const handleSwitch = async (mode) => {
    if (mode === currentMode || switching) return;
    setSwitching(true);
    setOpen(false);
    await base44.auth.updateMe({ active_mode: mode, app_role: mode });
    await refreshUser();
    setSwitching(false);
    navigate(MODE_ROUTES[mode] || "/dashboard/buyer");
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 bg-card",
            "text-[12px] font-semibold text-foreground hover:bg-muted/50 transition-colors"
          )}
        >
          <CurrentIcon className={cn("w-3.5 h-3.5", current.color)} />
          {current.label}
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
        {open && (
          <Dropdown
            availableModes={availableModes}
            currentMode={currentMode}
            onSwitch={handleSwitch}
            onClose={() => setOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 border-border/60 bg-card",
          "hover:border-primary/30 transition-all"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", current.bg)}>
            <CurrentIcon className={cn("w-4 h-4", current.color)} />
          </div>
          <div className="text-left">
            <p className="text-[11px] text-muted-foreground font-medium">Current Mode</p>
            <p className="text-[14px] font-heading font-bold text-foreground">{current.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {switching ? (
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-[11px] text-muted-foreground">Switch</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </>
          )}
        </div>
      </button>

      {open && (
        <Dropdown
          availableModes={availableModes}
          currentMode={currentMode}
          onSwitch={handleSwitch}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function Dropdown({ availableModes, currentMode, onSwitch, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-card border border-border/60 rounded-2xl shadow-lg overflow-hidden">
        {availableModes.map((mode) => {
          const cfg = MODE_CONFIG[mode] || MODE_CONFIG.buyer;
          const Icon = cfg.icon;
          const isActive = mode === currentMode;
          return (
            <button
              key={mode}
              onClick={() => onSwitch(mode)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left",
                isActive && "bg-primary/5"
              )}
            >
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", cfg.bg)}>
                <Icon className={cn("w-4 h-4", cfg.color)} />
              </div>
              <span className="flex-1 text-[14px] font-medium text-foreground">{cfg.label}</span>
              {isActive && <Check className="w-4 h-4 text-primary" />}
            </button>
          );
        })}
      </div>
    </>
  );
}