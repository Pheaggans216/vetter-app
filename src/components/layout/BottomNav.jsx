import { Link, useLocation } from "react-router-dom";
import { Home, FileText, MessageCircle, User, Briefcase, Calendar, DollarSign, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const buyerTabs = [
  { label: "Home", icon: Home, path: "/dashboard" },
  { label: "Requests", icon: FileText, path: "/requests" },
  { label: "Find Vetters", icon: MapPin, path: "/map" },
  { label: "Messages", icon: MessageCircle, path: "/messages" },
  { label: "Profile", icon: User, path: "/profile" },
];

const vetterTabs = [
  { label: "Home", icon: Home, path: "/vetter/dashboard" },
  { label: "Jobs", icon: Briefcase, path: "/jobs" },
  { label: "Schedule", icon: Calendar, path: "/schedule" },
  { label: "Earnings", icon: DollarSign, path: "/earnings" },
  { label: "Messages", icon: MessageCircle, path: "/messages" },
  { label: "Profile", icon: User, path: "/vetter/profile" },
];

export default function BottomNav({ userRole }) {
  const location = useLocation();
  const tabs = (userRole === "vetter" || userRole === "admin") ? vetterTabs : buyerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || 
            (tab.path !== "/dashboard" && tab.path !== "/vetter/dashboard" && location.pathname.startsWith(tab.path));
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[64px]",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
              <span className={cn(
                "text-[11px] font-body",
                isActive ? "font-semibold" : "font-medium"
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}