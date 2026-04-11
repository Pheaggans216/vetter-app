import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useState } from "react";
import { Copy, CheckCircle2, Clock, Gift, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getReferralCode(email) {
  // Simple deterministic code from email
  return btoa(email).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase();
}

export default function Referrals() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.email ? getReferralCode(user.email) : "";
  const referralLink = `${window.location.origin}/onboarding?ref=${referralCode}`;

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ["referrals", user?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user?.email }),
    enabled: !!user?.email,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pending = referrals.filter((r) => r.status === "pending");
  const completed = referrals.filter((r) => r.status === "completed" || r.status === "rewarded");
  const totalEarned = referrals
    .filter((r) => r.status === "rewarded")
    .reduce((sum, r) => sum + (r.reward_amount || 0), 0);

  return (
    <div className="px-5 pt-6 pb-8">
      <h1 className="text-xl font-heading font-bold text-foreground mb-1">Invite & Earn</h1>
      <p className="text-[13px] text-muted-foreground mb-6">
        Share your link. Earn rewards when friends complete their first job.
      </p>

      {/* Referral Link Card */}
      <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm mb-5">
        <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Your Referral Link</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-muted rounded-xl text-[12px] text-muted-foreground truncate font-mono">
            {referralLink}
          </div>
          <Button
            size="sm"
            variant={copied ? "secondary" : "default"}
            className="rounded-xl shrink-0 h-9 px-3"
            onClick={handleCopy}
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      {/* Rewards Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard icon={Users} label="Invited" value={referrals.length} color="text-primary" />
        <StatCard icon={Clock} label="Pending" value={pending.length} color="text-amber-500" />
        <StatCard icon={Gift} label="Earned" value={`$${totalEarned}`} color="text-accent" />
      </div>

      {/* How it works */}
      <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm mb-5">
        <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">How It Works</p>
        <div className="space-y-2.5">
          <RewardRow emoji="👥" text="Friend signs up with your link" />
          <RewardRow emoji="✅" text="They complete their first paid job or verification" />
          <RewardRow emoji="💰" text="You earn $10 credit — they get a discount on their first job" />
          <RewardRow emoji="🔧" text="Refer a Vetter who completes their first job → earn $10–$20" />
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border/40">
          Rewards are only issued after completed activity — not for signups alone.
        </p>
      </div>

      {/* Referral List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-14 bg-card rounded-2xl border border-border/60 animate-pulse" />)}
        </div>
      ) : referrals.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <Gift className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground text-[14px] mb-1">No referrals yet</p>
          <p className="text-muted-foreground text-[12px] max-w-[220px]">
            Share your link above to start earning rewards.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Your Referrals</p>
          {referrals.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3.5 bg-card rounded-2xl border border-border/60">
              <div>
                <p className="text-[13px] font-medium text-foreground">{r.referred_email || "Pending signup"}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{r.referred_role || "Unknown"} · {r.status}</p>
              </div>
              <StatusBadge status={r.status} amount={r.reward_amount} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center py-3 bg-card rounded-2xl border border-border/60 shadow-sm">
      <Icon className={cn("w-4 h-4 mb-1", color)} />
      <span className="font-heading font-bold text-foreground text-[16px]">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

function RewardRow({ emoji, text }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-[14px] shrink-0">{emoji}</span>
      <p className="text-[13px] text-muted-foreground leading-snug">{text}</p>
    </div>
  );
}

function StatusBadge({ status, amount }) {
  const configs = {
    pending: { label: "Pending", className: "bg-amber-50 text-amber-600 border-amber-200" },
    completed: { label: "Completed", className: "bg-primary/10 text-primary border-primary/20" },
    rewarded: { label: amount ? `+$${amount}` : "Rewarded", className: "bg-accent/10 text-accent border-accent/20" },
  };
  const c = configs[status] || configs.pending;
  return (
    <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full border", c.className)}>
      {c.label}
    </span>
  );
}