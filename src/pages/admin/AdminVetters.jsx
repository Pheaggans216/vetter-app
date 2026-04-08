import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Check, X, ExternalLink, ShieldCheck, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const STATUS_COLORS = {
  pending_review: "bg-amber-50 text-amber-600 border-amber-100",
  active: "bg-chart-3/15 text-chart-3 border-chart-3/20",
  inactive: "bg-muted text-muted-foreground border-border",
};

const SPECIALTY_LABELS = {
  mechanic: "Mechanic", electronics_technician: "Electronics Tech", appliance_expert: "Appliance Expert",
  jeweler: "Jeweler", watch_specialist: "Watch Specialist", luxury_authenticator: "Luxury Auth",
  contractor: "Contractor", furniture_expert: "Furniture Expert", property_verifier: "Property Verifier",
  security_professional: "Security Pro", other: "Other",
};

export default function AdminVetters() {
  const [filter, setFilter] = useState("pending_review");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: vetters = [], isLoading } = useQuery({
    queryKey: ["admin-vetters-list"],
    queryFn: () => base44.entities.VetterProfile.list("-created_date", 200),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.VetterProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vetters-list"] });
      toast({ title: "Vetter updated" });
    },
  });

  const filtered = vetters.filter(v => filter === "all" ? true : v.status === filter);

  const approve = (v) => updateMutation.mutate({ id: v.id, data: { status: "active", verified: true, identity_verified: true } });
  const reject = (v) => updateMutation.mutate({ id: v.id, data: { status: "inactive" } });
  const approveSecure = (v) => updateMutation.mutate({ id: v.id, data: { secure_exchange_approved: true } });

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-[22px] font-heading font-bold text-foreground">Vetter Applications</h1>
        <p className="text-muted-foreground text-[13px] mt-0.5">Review credentials and approve or reject applicants.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {["pending_review", "active", "inactive", "all"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium capitalize transition-all ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-card border border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.replace("_", " ")}
            <span className="ml-1.5 opacity-60">
              ({f === "all" ? vetters.length : vetters.filter(v => v.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 bg-card rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground text-sm">No vetters in this category.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(v => (
            <div key={v.id} className="bg-card rounded-2xl border border-border/60 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {v.avatar_url
                    ? <img src={v.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-primary font-bold">{v.display_name?.[0]}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-heading font-bold text-foreground text-[15px]">{v.display_name}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[v.status] || STATUS_COLORS.inactive}`}>
                      {v.status?.replace("_", " ")}
                    </span>
                    {v.secure_exchange_approved && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-chart-3/15 text-chart-3 border border-chart-3/20">Secure Exchange ✓</span>
                    )}
                  </div>
                  <p className="text-[12px] text-muted-foreground">{v.user_email}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {[v.city, v.state].filter(Boolean).join(", ")}
                    {v.years_of_experience ? ` · ${v.years_of_experience} yrs exp` : ""}
                    {v.specialties?.length > 0 ? ` · ${v.specialties.map(s => SPECIALTY_LABELS[s] || s).join(", ")}` : ""}
                  </p>

                  {/* Documents */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {v.id_document_url && (
                      <a href={v.id_document_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-[11px] text-muted-foreground hover:text-primary transition-colors">
                        <User className="w-3 h-3" /> ID Document <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {v.certification_urls?.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-[11px] text-muted-foreground hover:text-primary transition-colors">
                        <FileText className="w-3 h-3" /> Cert {i + 1} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {v.status === "pending_review" && (
                    <>
                      <Button size="sm" onClick={() => approve(v)} disabled={updateMutation.isPending}
                        className="h-8 text-[12px] rounded-lg gap-1">
                        <Check className="w-3.5 h-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => reject(v)} disabled={updateMutation.isPending}
                        className="h-8 text-[12px] rounded-lg gap-1 border-destructive/30 text-destructive hover:bg-destructive/5">
                        <X className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </>
                  )}
                  {v.status === "active" && !v.secure_exchange_approved && v.service_types?.includes("secure_exchange_presence") && (
                    <Button size="sm" variant="outline" onClick={() => approveSecure(v)} disabled={updateMutation.isPending}
                      className="h-8 text-[12px] rounded-lg gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Approve Secure Exchange
                    </Button>
                  )}
                  {v.status === "active" && (
                    <Button size="sm" variant="outline" onClick={() => reject(v)} disabled={updateMutation.isPending}
                      className="h-8 text-[12px] rounded-lg gap-1 text-muted-foreground">
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}