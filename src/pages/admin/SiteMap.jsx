import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  Home, FileText, MessageCircle, User, Plus, ShoppingCart,
  CreditCard, CheckCircle2, Briefcase, Calendar, DollarSign,
  ShieldCheck, ClipboardList, Users, BarChart2, Flag,
  Settings, Bell, HelpCircle, MapPin, Gift, Search,
  ChevronRight, Lock, Eye, EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    title: "Core Pages",
    color: "bg-primary/10 text-primary border-primary/20",
    items: [
      { label: "Home", path: "/home", icon: Home },
      { label: "My Requests", path: "/requests", icon: FileText },
      { label: "Find Vetters (Map)", path: "/map", icon: MapPin },
      { label: "Messages / Chat", path: "/messages", icon: MessageCircle },
      { label: "Profile", path: "/profile", icon: User },
      { label: "Referrals", path: "/referrals", icon: Gift },
      { label: "FAQ", path: "/faq", icon: HelpCircle },
    ],
  },
  {
    title: "Transaction Flow",
    color: "bg-accent/10 text-accent border-accent/20",
    items: [
      { label: "New Request", path: "/requests/new", icon: Plus },
      { label: "Requests List", path: "/requests", icon: ClipboardList },
      { label: "Request Detail (sample)", path: "/requests/sample", icon: ShoppingCart },
      { label: "Buyer Checkout", path: "/requests/new", icon: CreditCard },
    ],
  },
  {
    title: "Vetter System",
    color: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    items: [
      { label: "Vetter Jobs Dashboard", path: "/jobs", icon: Briefcase },
      { label: "Schedule", path: "/schedule", icon: Calendar },
      { label: "Earnings", path: "/earnings", icon: DollarSign },
      { label: "Vetter Profile", path: "/vetter/profile", icon: User },
      { label: "Vetter Onboarding", path: "/vetter/onboarding", icon: ShieldCheck },
      { label: "Buyer Onboarding", path: "/onboarding", icon: CheckCircle2 },
    ],
  },
  {
    title: "Admin / Internal",
    color: "bg-destructive/10 text-destructive border-destructive/20",
    adminOnly: true,
    items: [
      { label: "Admin Overview", path: "/admin", icon: BarChart2 },
      { label: "Manage Vetters", path: "/admin/vetters", icon: Users },
      { label: "Manage Requests", path: "/admin/requests", icon: FileText },
      { label: "Disputes", path: "/admin/disputes", icon: Flag },
      { label: "Payments", path: "/admin/payments", icon: CreditCard },
      { label: "Flagged Users", path: "/admin/flagged", icon: Flag },
      { label: "Metrics", path: "/admin/metrics", icon: BarChart2 },
    ],
  },
  {
    title: "Settings",
    color: "bg-muted text-muted-foreground border-border",
    items: [
      { label: "Account Settings", path: "/profile", icon: Settings },
      { label: "Notifications", path: "/profile", icon: Bell },
      { label: "Help & Support", path: "/faq", icon: HelpCircle },
    ],
  },
];

function NavCard({ item }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      className="flex items-center gap-3 px-3.5 py-3 bg-card rounded-xl border border-border/60 hover:border-primary/30 hover:bg-primary/5 transition-all group"
    >
      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      <span className="text-[13px] font-medium text-foreground flex-1 truncate">{item.label}</span>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
    </Link>
  );
}

export default function SiteMap() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showAdmin, setShowAdmin] = useState(true);

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-destructive" />
        </div>
        <h2 className="font-heading font-bold text-foreground text-lg mb-2">Access Restricted</h2>
        <p className="text-muted-foreground text-sm max-w-[240px]">
          This page is for internal/admin use only.
        </p>
      </div>
    );
  }

  const query = search.toLowerCase();

  const filteredSections = SECTIONS
    .filter((s) => showAdmin || !s.adminOnly)
    .map((s) => ({
      ...s,
      items: query
        ? s.items.filter((i) => i.label.toLowerCase().includes(query))
        : s.items,
    }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="px-5 pt-6 pb-10 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-heading font-bold text-foreground">Internal Nav</h1>
          <button
            onClick={() => setShowAdmin((v) => !v)}
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg border border-border/60"
          >
            {showAdmin ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showAdmin ? "Hide Admin" : "Show Admin"}
          </button>
        </div>
        <p className="text-[12px] text-muted-foreground">Admin-only sitemap for internal navigation.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 h-10 rounded-xl border border-border bg-card text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {filteredSections.map((section) => (
          <div key={section.title}>
            <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold mb-3", section.color)}>
              {section.title}
            </div>
            <div className="space-y-1.5">
              {section.items.map((item) => (
                <NavCard key={item.label + item.path} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}