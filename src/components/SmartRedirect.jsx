/**
 * SmartRedirect — shown at "/" for logged-in users.
 * Supports multi-role users via active_mode; falls back to legacy app_role.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export default function SmartRedirect() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const isAdmin = user.role === "admin" || user.isAdmin;

    // Admins skip onboarding
    if (isAdmin) {
      navigate("/admin", { replace: true });
      return;
    }

    // Force onboarding if not complete OR no role assigned
    const hasRole = user.app_roles?.length > 0 || user.app_role;
    if (!user.onboarded || !hasRole) {
      navigate("/onboarding", { replace: true });
      return;
    }

    // Use active_mode first, then fall back to legacy app_role
    // If mode is unknown (e.g. legacy pro_security), default to buyer
    const rawMode = user.active_mode || user.app_role || "buyer";
    const mode = ["buyer", "seller", "vetter"].includes(rawMode) ? rawMode : "buyer";

    if (mode === "vetter") {
      navigate("/vetter/dashboard", { replace: true });
    } else if (mode === "seller") {
      navigate("/dashboard/seller", { replace: true });
    } else {
      navigate("/dashboard/buyer", { replace: true });
    }
  }, [isAuthenticated, user]);

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}