import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, LogOut, User, Settings, ChevronRight, HelpCircle, FileText, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const roleLabels = {
  buyer: "Buyer",
  seller: "Seller",
  vetter: "Vetter",
  admin: "Admin",
};

const menuItems = [
  { icon: User, label: "Edit Profile", href: "#" },
  { icon: Bell, label: "Notifications", href: "#" },
  { icon: Settings, label: "Settings", href: "#" },
  { icon: FileText, label: "Terms of Service", href: "#" },
  { icon: HelpCircle, label: "Help & Support", href: "#" },
];

export default function Profile() {
  const { user } = useAuth();
  const role = user?.role || "buyer";

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="px-5 pt-6 pb-8">
      <h1 className="text-xl font-heading font-bold text-foreground mb-6">Profile</h1>

      {/* Profile Card */}
      <div className="p-5 bg-card rounded-2xl border border-border/60 shadow-sm mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <span className="text-primary font-bold text-lg">
                {user?.full_name?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-bold text-foreground text-[16px] truncate">
              {user?.full_name || "Welcome"}
            </h2>
            <p className="text-muted-foreground text-[13px] truncate">{user?.email}</p>
            <Badge variant="secondary" className="mt-1.5 text-[11px] font-medium bg-primary/10 text-primary">
              <Shield className="w-3 h-3 mr-1" />
              {roleLabels[role]}
            </Badge>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden mb-5">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left",
              i !== menuItems.length - 1 && "border-b border-border/40"
            )}
          >
            <item.icon className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-[14px] font-medium text-foreground">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        onClick={handleLogout}
        className="w-full rounded-xl h-11 text-destructive border-destructive/20 hover:bg-destructive/5 font-medium"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}