import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { DollarSign, TrendingUp, CheckCircle2 } from "lucide-react";

export default function Earnings() {
  const { user } = useAuth();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["vetter-payments", user?.email],
    queryFn: () => base44.entities.Payment.filter({ payee_email: user?.email }, "-created_date"),
    enabled: !!user?.email,
  });

  const totalEarned = payments
    .filter((p) => p.status === "released")
    .reduce((sum, p) => sum + (p.amount - (p.platform_fee || 0)), 0);

  const pendingAmount = payments
    .filter((p) => p.status === "held")
    .reduce((sum, p) => sum + (p.amount - (p.platform_fee || 0)), 0);

  const completedCount = payments.filter((p) => p.status === "released").length;

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-xl font-heading font-bold text-foreground mb-6">Earnings</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-chart-3/15 flex items-center justify-center mb-2">
            <DollarSign className="w-4 h-4 text-chart-3" />
          </div>
          <p className="text-[22px] font-heading font-bold text-foreground">
            ${totalEarned.toFixed(2)}
          </p>
          <p className="text-[12px] text-muted-foreground">Total earned</p>
        </div>
        <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
          <p className="text-[22px] font-heading font-bold text-foreground">
            ${pendingAmount.toFixed(2)}
          </p>
          <p className="text-[12px] text-muted-foreground">Pending</p>
        </div>
      </div>

      <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-[16px] font-heading font-bold text-foreground">{completedCount}</p>
          <p className="text-[12px] text-muted-foreground">Completed inspections</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Recent Transactions
      </h3>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-card rounded-2xl border border-border/60 animate-pulse" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">No transactions yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.slice(0, 10).map((payment) => (
            <div
              key={payment.id}
              className="p-3 bg-card rounded-xl border border-border/60 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-[13px] font-medium text-foreground">
                  {payment.description || "Vetting Service"}
                </p>
                <p className="text-[11px] text-muted-foreground capitalize">{payment.status}</p>
              </div>
              <p className="text-[14px] font-semibold text-foreground">
                ${(payment.amount - (payment.platform_fee || 0)).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}