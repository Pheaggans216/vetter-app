import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { hasAppRole } from "@/lib/roleState";

export default function RoleRoute({ allowedRoles = [], requireAdmin = false, redirectTo = "/" }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.isAdmin;

  if (requireAdmin) {
    return isAdmin ? <Outlet /> : <Navigate to={redirectTo} replace />;
  }

  const hasAccess = allowedRoles.some((role) => hasAppRole(user, role));
  return hasAccess ? <Outlet /> : <Navigate to={redirectTo} replace />;
}
