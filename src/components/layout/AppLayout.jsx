import { Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  const { user } = useAuth();
  const userRole = user?.role || "buyer";

  return (
    <div className="min-h-screen bg-background font-body">
      <main className="pb-20 max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNav userRole={userRole} />
    </div>
  );
}