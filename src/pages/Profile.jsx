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
import { Badge } from "@/components/ui/badge";
import { Shield, LogOut, User, Settings, ChevronRight, HelpCircle, FileText, Bell, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const roleLabels = {
  buyer: "Buyer",
  seller: "Seller",
  vetter: "Vetter",
  admin: "Admin",
};

const menuItems = [
  { icon: User, label: "Edit Profile", href: "/profile/edit" },
  { icon: Gift, label: "Invite & Earn", href: "/referrals" },
  { icon: HelpCircle, label: "Help & Support", href: "/faq" },
  { icon: Bell, label: "Notifications", href: null, comingSoon: true },
  { icon: Settings, label: "Settings", href: null, comingSoon: true },
  { icon: FileText, label: "Terms of Service", href: null, comingSoon: true },
];

export default function Profile() {
  const { user } = useAuth();
  const role = user?.role || "buyer";
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await base44.auth.logout();
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

      {/* Vetter profile shortcut */}
      {(role === "vetter") && (
        <Link to="/vetter/profile" className="flex items-center gap-3 px-4 py-3.5 bg-card rounded-2xl border border-border/60 shadow-sm mb-5 hover:bg-muted/50 transition-colors">
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