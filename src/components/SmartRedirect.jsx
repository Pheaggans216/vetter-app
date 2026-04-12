/**
 * SmartRedirect — shown at "/" for logged-in users.
 * NEW users (onboarded=false or no app_role) always go to /onboarding.
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
    if (!user.onboarded || !user.app_role) {
      navigate("/onboarding", { replace: true });
      return;
    }

    // Route by role
    if (user.app_role === "vetter") {
      navigate("/vetter/dashboard", { replace: true });
    } else if (user.app_role === "seller") {
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