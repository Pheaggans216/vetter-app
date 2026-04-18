import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

function normalizeVetterStatus(profile) {
  if (!profile) return "not_started";
  if (profile.status === "active" || profile.status === "approved") return "approved";
  return "pending_review";
}

const LoadingFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

export default function VetterStatusRoute({ allowPendingReview = false }) {
  const { user } = useAuth();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["vetter-profile-route", user?.email],
    queryFn: () => base44.entities.VetterProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  if (isLoading) {
    return <LoadingFallback />;
  }

  const status = normalizeVetterStatus(profiles[0]);

  if (status === "not_started") {
    return <Navigate to="/vetter/onboarding" replace />;
  }

  if (status === "pending_review" && !allowPendingReview) {
    return <Navigate to="/vetter/application-received" replace />;
  }

  return <Outlet />;
}
