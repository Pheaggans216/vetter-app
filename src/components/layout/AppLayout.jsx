import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import BottomNav from "./BottomNav";
import { motion, AnimatePresence } from "framer-motion";

const FULL_SCREEN_PAGES = ["/map"];

export default function AppLayout() {
  const { user } = useAuth();
  const userRole = user?.role || "buyer";
  const location = useLocation();
  const isFullScreen = FULL_SCREEN_PAGES.includes(location.pathname);

  if (isFullScreen) {
    return (
      <div className="h-screen flex flex-col bg-background font-body overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
        <BottomNav userRole={userRole} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <main className="pb-20 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav userRole={userRole} />
    </div>
  );
}