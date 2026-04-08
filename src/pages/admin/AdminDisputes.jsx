import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

// Disputes = requests that are cancelled or flagged (notes contain "dispute")
export default function AdminDisputes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["admin-disputes"],
    queryFn: () => base44.entities.VettingRequest.filter({ status: "cancelled" }, "-updated_date", 100),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.VettingRequest.update(id, { notes: "Resolved by admin." }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-disputes"] });
      toast({ title: "Marked as reviewed." });
    },
  });

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-[22px] font-heading font-bold text-foreground">Disputes</h1>
        <p className="text-muted-foreground text-[13px] mt-0.5">Cancelled or contested requests that may need admin intervention.</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />)}</div>
      ) : requests.length === 0 ? (
        <div className="py-20 text-center">
          <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No disputes or cancelled requests.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border/40 bg-muted/40">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Item</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Buyer</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Vetter</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Notes</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground truncate max-w-[180px]">{req.title}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-[12px] truncate max-w-[140px]">{req.buyer_email}</td>
                  <td className="px-4 py-3 text-muted-foreground text-[12px] truncate max-w-[140px]">{req.vetter_email || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-[12px] max-w-[200px]">
                    <p className="truncate">{req.notes || "No notes."}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-[12px]">
                    {req.updated_date ? format(new Date(req.updated_date), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" className="h-7 text-[11px] rounded-lg"
                      onClick={() => resolveMutation.mutate({ id: req.id })}
                      disabled={resolveMutation.isPending || req.notes === "Resolved by admin."}>
                      {req.notes === "Resolved by admin." ? "Reviewed" : "Mark Reviewed"}
                    </Button>
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