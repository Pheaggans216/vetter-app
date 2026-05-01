import { Link, useLocation } from "react-router-dom";
import { Home, FileText, MessageCircle, User, Briefcase, Calendar, DollarSign, MapPin, ShieldCheck, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const buyerTabs = [
  { label: "Home", icon: Home, path: "/dashboard/buyer" },
  { label: "Get Vetted", icon: ShieldCheck, path: "/get-it-vetted" },
  { label: "Map", icon: MapPin, path: "/map" },
  { label: "Messages", icon: MessageCircle, path: "/messages" },
  { label: "Profile", icon: User, path: "/profile" },
];

const sellerTabs = [
  { label: "Home", icon: Home, path: "/dashboard/seller" },
  { label: "Listings", icon: ShoppingBag, path: "/listings" },
  { label: "Messages", icon: MessageCircle, path: "/messages" },
  { label: "Profile", icon: User, path: "/profile" },
];

const vetterTabs = [
  { label: "Home", icon: Home, path: "/dashboard/vetter" },
  { label: "Jobs", icon: Briefcase, path: "/vetter/jobs" },
  { label: "Schedule", icon: Calendar, path: "/schedule" },
  { label: "Earnings", icon: DollarSign, path: "/earnings" },
  { label: "Messages", icon: MessageCircle, path: "/messages" },
  { label: "Profile", icon: User, path: "/vetter/profile" },
];

export default function BottomNav({ userRole }) {
  const location = useLocation();
  const { user } = useAuth();

  const tabs = userRole === "vetter"
    ? vetterTabs
    : userRole === "seller"
    ? sellerTabs
    : buyerTabs;

  // Unread count for Messages badge
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", user?.email],
    queryFn: () => base44.entities.Conversation.list("-updated_date"),
    enabled: !!user?.email,
    refetchInterval: 30000, // refresh every 30s as a fallback
  });
  const totalUnread = conversations
    .filter((c) => c.participants?.includes(user?.email))
    .reduce((sum, c) => sum + (c.unread_count || 0), 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path ||
            (!['/dashboard/buyer', '/dashboard/seller', '/vetter/dashboard'].includes(tab.path) && location.pathname.startsWith(tab.path));
          const Icon = tab.icon;
          const isMessages = tab.path === "/messages";

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
              <div className="relative">
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                {isMessages && totalUnread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </div>
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