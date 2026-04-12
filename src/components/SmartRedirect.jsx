/**
 * SmartRedirect — shown at "/" for logged-in users.
 * Detects role and redirects to the correct dashboard.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export default function SmartRedirect() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { data: vetterProfiles, isLoading } = useQuery({
    queryKey: ["smart-redirect-vetter", user?.email],
    queryFn: () => base44.entities.VetterProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      // Not logged in — show landing (handled by parent, nothing to do)
      return;
    }
    if (isLoading) return;

    const hasVetterProfile = vetterProfiles && vetterProfiles.length > 0;

    // New users who haven't completed onboarding
    if (!user?.onboarded && user?.role !== "admin") {
      navigate("/onboarding", { replace: true });
      return;
    }

    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
    } else if (hasVetterProfile || user?.role === "vetter") {
      navigate("/vetter/dashboard", { replace: true });
    } else if (user?.role === "seller") {
      navigate("/dashboard/seller", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, vetterProfiles, user]);

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}