import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Flag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Flag suspicious users by setting a note on their vetter profile or request
// We surface vetters with low ratings or inactive status as potentially suspicious
export default function AdminFlagged() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: vetters = [], isLoading } = useQuery({
    queryKey: ["admin-all-vetters-flagged"],
    queryFn: () => base44.entities.VetterProfile.list("-created_date", 200),
  });

  const flagMutation = useMutation({
    mutationFn: ({ id, flag }) => base44.entities.VetterProfile.update(id, { status: flag ? "inactive" : "active" }),
    onSuccess: (_, { flag }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-vetters-flagged"] });
      toast({ title: flag ? "User flagged and deactivated." : "User reinstated." });
    },
  });

  // "Suspicious" = low rating or never had a completed inspection
  const suspicious = vetters.filter(v => (v.rating && v.rating < 3.5) || (v.status === "inactive" && v.total_inspections > 0));
  const all = vetters;

  const [view, setView] = useState("suspicious");
  const list = view === "suspicious" ? suspicious : all;

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-[22px] font-heading font-bold text-foreground">Flagged Users</h1>
        <p className="text-muted-foreground text-[13px] mt-0.5">Users with low ratings or suspicious activity patterns.</p>
      </div>

      <div className="flex gap-2 mb-5">
        <button onClick={() => setView("suspicious")}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${view === "suspicious" ? "bg-destructive text-destructive-foreground" : "bg-card border border-border/60 text-muted-foreground"}`}>
          Needs Review ({suspicious.length})
        </button>
        <button onClick={() => setView("all")}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${view === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border/60 text-muted-foreground"}`}>
          All Vetters ({all.length})
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-card rounded-xl animate-pulse" />)}</div>
      ) : list.length === 0 ? (
        <div className="py-20 text-center">
          <ShieldAlert className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No flagged users at this time.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border/40 bg-muted/40">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Rating</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Jobs</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {list.map(v => (
                <tr key={v.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{v.display_name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-[12px] truncate max-w-[180px]">{v.user_email}</td>
                  <td className="px-4 py-3">
                    {v.rating ? (
                      <span className={`font-semibold ${v.rating < 3.5 ? "text-destructive" : "text-chart-3"}`}>
                        ⭐ {v.rating.toFixed(1)}
                      </span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{v.total_inspections || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      v.status === "active" ? "bg-chart-3/15 text-chart-3" :
                      v.status === "pending_review" ? "bg-amber-50 text-amber-600" :
                      "bg-muted text-muted-foreground"
                    }`}>{v.status?.replace("_", " ")}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {v.status === "active" && (
                        <Button size="sm" variant="outline" className="h-7 text-[11px] rounded-lg gap-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                          onClick={() => flagMutation.mutate({ id: v.id, flag: true })}>
                          <Flag className="w-3 h-3" /> Flag & Deactivate
                        </Button>
                      )}
                      {v.status === "inactive" && (
                        <Button size="sm" variant="outline" className="h-7 text-[11px] rounded-lg"
                          onClick={() => flagMutation.mutate({ id: v.id, flag: false })}>
                          Reinstate
                        </Button>
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