import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const STATUS_COLORS = {
  pending: "bg-muted text-muted-foreground",
  matched: "bg-primary/10 text-primary",
  scheduled: "bg-accent/15 text-accent",
  in_progress: "bg-blue-50 text-blue-600",
  completed: "bg-chart-3/15 text-chart-3",
  cancelled: "bg-destructive/10 text-destructive",
};

const SERVICE_PRICES = { standard_verification: 39, specialist_vetting: 89, secure_exchange_presence: 149 };

export default function AdminRequests() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigningId, setAssigningId] = useState(null);
  const [assignEmail, setAssignEmail] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["admin-all-requests"],
    queryFn: () => base44.entities.VettingRequest.list("-created_date", 300),
  });

  const { data: vetters = [] } = useQuery({
    queryKey: ["admin-active-vetters"],
    queryFn: () => base44.entities.VetterProfile.filter({ status: "active" }),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, vetter_email }) =>
      base44.entities.VettingRequest.update(id, { vetter_email, status: "matched" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-requests"] });
      setAssigningId(null);
      setAssignEmail("");
      toast({ title: "Vetter manually assigned." });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.VettingRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-all-requests"] }),
  });

  const filtered = requests.filter(r => {
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.buyer_email?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-[22px] font-heading font-bold text-foreground">Job Requests</h1>
        <p className="text-muted-foreground text-[13px] mt-0.5">Manage all vetting requests across the platform.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by title or email…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 rounded-xl text-[13px]" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9 rounded-xl text-[13px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {["all","pending","matched","scheduled","in_progress","completed","cancelled"].map(s => (
              <SelectItem key={s} value={s}>{s.replace("_"," ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-card rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border/40 bg-muted/40">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Item</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Buyer</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Value</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map(req => (
                <>
                  <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground truncate max-w-[180px]">{req.title}</p>
                      <p className="text-[11px] text-muted-foreground">{req.service_type?.replace(/_/g, " ")}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[160px]">{req.buyer_email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[req.status] || ""}`}>
                        {req.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-accent">${SERVICE_PRICES[req.service_type] || 39}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {req.created_date ? format(new Date(req.created_date), "MMM d") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {req.status === "pending" && (
                          <Button size="sm" variant="outline" onClick={() => setAssigningId(assigningId === req.id ? null : req.id)}
                            className="h-7 text-[11px] rounded-lg gap-1">
                            <UserPlus className="w-3 h-3" /> Assign
                          </Button>
                        )}
                        {["matched","scheduled","in_progress"].includes(req.status) && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: req.id, status: "cancelled" })}
                            className="h-7 text-[11px] rounded-lg text-destructive border-destructive/30 hover:bg-destructive/5">
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {assigningId === req.id && (
                    <tr key={`assign-${req.id}`}>
                      <td colSpan={6} className="px-4 pb-3">
                        <div className="flex items-center gap-2 mt-1">
                          <Select value={assignEmail} onValueChange={setAssignEmail}>
                            <SelectTrigger className="w-64 h-8 rounded-lg text-[12px]">
                              <SelectValue placeholder="Select a Vetter…" />
                            </SelectTrigger>
                            <SelectContent>
                              {vetters.map(v => (
                                <SelectItem key={v.id} value={v.user_email}>{v.display_name} ({v.user_email})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" className="h-8 text-[12px] rounded-lg"
                            disabled={!assignEmail || assignMutation.isPending}
                            onClick={() => assignMutation.mutate({ id: req.id, vetter_email: assignEmail })}>
                            Confirm
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 text-[12px] rounded-lg" onClick={() => setAssigningId(null)}>Cancel</Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-[13px]">No requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}