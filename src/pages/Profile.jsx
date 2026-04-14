import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Shield, LogOut, User, Settings, ChevronRight, HelpCircle, FileText, Bell, Gift, ShoppingBag, Tag, Wrench, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import ModeSwitcher from "@/components/ModeSwitcher";

const ROLE_CONFIG = {
  buyer: { label: "Buyer", icon: ShoppingBag, color: "bg-primary/10 text-primary" },
  seller: { label: "Seller", icon: Tag, color: "bg-accent/10 text-accent" },
  vetter: { label: "Vetter", icon: Wrench, color: "bg-chart-3/10 text-chart-3" },
  pro_security: { label: "Pro Security", icon: Shield, color: "bg-purple-50 text-purple-600" },
  admin: { label: "Admin", icon: Shield, color: "bg-destructive/10 text-destructive" },
};

const ALL_ROLES = ["buyer", "seller", "vetter", "pro_security"];

const menuItems = [
  { icon: User, label: "Edit Profile", href: "/profile/edit" },
  { icon: Gift, label: "Invite & Earn", href: "/referrals" },
  { icon: HelpCircle, label: "Help & Support", href: "/faq" },
  { icon: Bell, label: "Notifications", href: null, comingSoon: true },
  { icon: Settings, label: "Settings", href: null, comingSoon: true },
  { icon: FileText, label: "Terms of Service", href: null, comingSoon: true },
];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [addingRole, setAddingRole] = useState(null);

  const enabledRoles = user?.app_roles?.length ? user.app_roles : user?.app_role ? [user.app_role] : ["buyer"];
  const isAdmin = user?.role === "admin";
  const currentMode = user?.active_mode || user?.app_role || "buyer";
  const unlockedRoles = ALL_ROLES.filter((r) => !enabledRoles.includes(r));

  const handleAddRole = async (roleValue) => {
    setAddingRole(roleValue);
    const newRoles = [...enabledRoles, roleValue];
    // Also update active_mode to the new role so the user lands on its dashboard
    await base44.auth.updateMe({
      app_roles: newRoles,
      app_role: user.app_role || roleValue,
      active_mode: roleValue,
    });
    await refreshUser();
    setAddingRole(null);
    if (roleValue === "vetter") {
      window.location.href = "/vetter/onboarding";
    }
  };

  const handleLogout = () => base44.auth.logout();

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const profiles = await base44.entities.VetterProfile.filter({ user_email: user?.email });
      for (const p of profiles) await base44.entities.VetterProfile.delete(p.id);
    } catch (_) {}
    base44.auth.logout();
  };

  return (
    <div className="px-5 pt-6 pb-8">
      <h1 className="text-xl font-heading font-bold text-foreground mb-6">Profile</h1>

      {/* Profile Card */}
      <div className="p-5 bg-card rounded-2xl border border-border/60 shadow-sm mb-4">
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
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="mb-4">
        <ModeSwitcher />
      </div>

      {/* Roles section */}
      <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm mb-4">
        <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          My Roles
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {enabledRoles.map((r) => {
            const cfg = ROLE_CONFIG[r] || ROLE_CONFIG.buyer;
            const Icon = cfg.icon;
            return (
              <span key={r} className={cn("flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl", cfg.color)}>
                <Icon className="w-3.5 h-3.5" />
                {cfg.label}
                {r === currentMode && <Check className="w-3 h-3 ml-0.5" />}
              </span>
            );
          })}
        </div>

        {/* Add more roles */}
        {unlockedRoles.length > 0 && (
          <div>
            <p className="text-[11px] text-muted-foreground mb-2">Add another role:</p>
            <div className="flex flex-wrap gap-2">
              {unlockedRoles.map((r) => {
                const cfg = ROLE_CONFIG[r] || ROLE_CONFIG.buyer;
                const Icon = cfg.icon;
                return (
                  <button
                    key={r}
                    onClick={() => handleAddRole(r)}
                    disabled={addingRole === r}
                    className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-xl border border-dashed border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {addingRole === r ? (
                      <div className="w-3 h-3 border border-muted-foreground/40 border-t-primary rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Vetter profile shortcut */}
      {enabledRoles.includes("vetter") && (
        <Link to="/vetter/profile" className="flex items-center gap-3 px-4 py-3.5 bg-card rounded-2xl border border-border/60 shadow-sm mb-4 hover:bg-muted/50 transition-colors">
          <User className="w-5 h-5 text-muted-foreground" />
          <span className="flex-1 text-[14px] font-medium text-foreground">My Vetter Profile</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      )}

      {/* Menu Items */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden mb-5">
        {menuItems.map((item, i) => (
          item.href ? (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors",
                i !== menuItems.length - 1 && "border-b border-border/40"
              )}
            >
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-[14px] font-medium text-foreground">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          ) : (
            <div
              key={item.label}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5",
                i !== menuItems.length - 1 && "border-b border-border/40"
              )}
            >
              <item.icon className="w-5 h-5 text-muted-foreground/50" />
              <span className="flex-1 text-[14px] font-medium text-muted-foreground">{item.label}</span>
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Soon</span>
            </div>
          )
        ))}
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        onClick={handleLogout}
        className="w-full rounded-xl h-11 text-destructive border-destructive/20 hover:bg-destructive/5 font-medium mb-3"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>

      {/* Delete Account */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="w-full text-center text-[12px] text-muted-foreground/60 hover:text-destructive transition-colors py-1">
            Delete Account
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone. All your data, requests, and history will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Yes, delete my account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}