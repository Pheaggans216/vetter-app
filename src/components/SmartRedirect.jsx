/**
 * SmartRedirect — shown at "/" for logged-in users.
 * Supports multi-role users via active_mode; falls back to legacy app_role.
 */
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { getCurrentMode, hasAnyAppRole } from "@/lib/roleState";

function normalizeVetterStatus(profile) {
  if (!profile) return "not_started";
  if (profile.status === "active" || profile.status === "approved") return "approved";
  return "pending_review";
}

export default function SmartRedirect() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const hasRole = hasAnyAppRole(user);
  const mode = getCurrentMode(user);

  const { data: vetterProfiles = [], isLoading: isLoadingVetterProfile } = useQuery({
    queryKey: ["smart-redirect-vetter-profile", user?.email],
    queryFn: () => base44.entities.VetterProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email && isAuthenticated && hasRole && mode === "vetter",
  });

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const isAdmin = user.role === "admin" || user.isAdmin;

    if (isAdmin) {
      navigate("/admin", { replace: true });
      return;
    }

    if (!user.onboarded || !hasRole) {
      navigate("/onboarding", { replace: true });
      return;
    }

    if (mode === "vetter") {
      if (isLoadingVetterProfile) return;

      const vetterStatus = normalizeVetterStatus(vetterProfiles[0]);
      if (vetterStatus === "approved") {
        navigate("/vetter/dashboard", { replace: true });
      } else if (vetterStatus === "pending_review") {
        navigate("/vetter/application-received", { replace: true });
      } else {
        navigate("/vetter/onboarding", { replace: true });
      }
    } else if (mode === "seller") {
      navigate("/dashboard/seller", { replace: true });
    } else {
      navigate("/dashboard/buyer", { replace: true });
    }
  }, [isAuthenticated, user, hasRole, mode, isLoadingVetterProfile, vetterProfiles, navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
