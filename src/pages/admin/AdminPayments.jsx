import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-600",
  held: "bg-blue-50 text-blue-600",
  released: "bg-chart-3/15 text-chart-3",
  refunded: "bg-muted text-muted-foreground",
  failed: "bg-destructive/10 text-destructive",
};

export default function AdminPayments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["admin-all-payments"],
    queryFn: () => base44.entities.Payment.list("-created_date", 200),
  });

  const releaseMutation = useMutation({
    mutationFn: (id) => base44.entities.Payment.update(id, { status: "released" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-payments"] });
      toast({ title: "Payment released." });
    },
  });

  const refundMutation = useMutation({
    mutationFn: (id) => base44.entities.Payment.update(id, { status: "refunded" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-payments"] });
      toast({ title: "Payment refunded." });
    },
  });

  const totalReleased = payments.filter(p => p.status === "released").reduce((s, p) => s + (p.amount || 0), 0);
  const totalHeld = payments.filter(p => p.status === "held").reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-[22px] font-heading font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground text-[13px] mt-0.5">Review, release, or refund payments across the platform.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-7">
        <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
          <p className="text-[22px] font-heading font-bold text-foreground">${totalReleased.toLocaleString()}</p>
          <p className="text-[12px] text-muted-foreground">Total Released</p>
        </div>
        <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
          <p className="text-[22px] font-heading font-bold text-foreground">${totalHeld.toLocaleString()}</p>
          <p className="text-[12px] text-muted-foreground">Currently Held</p>
        </div>
        <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
          <p className="text-[22px] font-heading font-bold text-foreground">{payments.length}</p>
          <p className="text-[12px] text-muted-foreground">Total Transactions</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-card rounded-xl animate-pulse" />)}</div>
      ) : payments.length === 0 ? (
        <div className="py-20 text-center">
          <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No payments recorded yet.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border/40 bg-muted/40">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Payer</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Payee</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Amount</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[160px]">{p.payer_email}</td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[160px]">{p.payee_email || "—"}</td>
                  <td className="px-4 py-3 font-bold text-foreground">${p.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || ""}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.created_date ? format(new Date(p.created_date), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {p.status === "held" && (
                        <Button size="sm" className="h-7 text-[11px] rounded-lg" onClick={() => releaseMutation.mutate(p.id)}>Release</Button>
                      )}
                      {["held","pending"].includes(p.status) && (
                        <Button size="sm" variant="outline" className="h-7 text-[11px] rounded-lg text-destructive border-destructive/30 hover:bg-destructive/5"
                          onClick={() => refundMutation.mutate(p.id)}>Refund</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}