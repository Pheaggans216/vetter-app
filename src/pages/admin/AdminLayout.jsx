import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  LayoutDashboard, Users, ClipboardList, ShieldAlert,
  CreditCard, BarChart2, Shield, LogOut, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, path: "/admin" },
  { label: "Vetter Applications", icon: Users, path: "/admin/vetters" },
  { label: "Job Requests", icon: ClipboardList, path: "/admin/requests" },
  { label: "Disputes", icon: ShieldAlert, path: "/admin/disputes" },
  { label: "Payments", icon: CreditCard, path: "/admin/payments" },
  { label: "Flagged Users", icon: ShieldAlert, path: "/admin/flagged" },
  { label: "Metrics", icon: BarChart2, path: "/admin/metrics" },
];

export default function AdminLayout() {
  const location = useLocation();
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-heading font-bold text-foreground text-lg mb-1">Access Restricted</p>
          <p className="text-muted-foreground text-sm">Admin access only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border/60 bg-card flex flex-col">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-border/40">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-heading font-bold text-foreground text-[15px]">Admin</span>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/40">
          <div className="px-3 py-2">
            <p className="text-[11px] font-semibold text-foreground truncate">{user?.full_name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}