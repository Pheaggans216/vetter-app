import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import BottomNav from "./BottomNav";

// Pages that need full-height layout without scroll container
const FULL_SCREEN_PAGES = ["/map"];

export default function AppLayout() {
  const { user } = useAuth();
  const userRole = user?.role || "buyer";
  const location = useLocation();
  const isFullScreen = FULL_SCREEN_PAGES.includes(location.pathname);

  if (isFullScreen) {
    return (
      <div className="h-screen flex flex-col bg-background font-body overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
        <BottomNav userRole={userRole} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <main className="pb-20 max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNav userRole={userRole} />
    </div>
  );
}