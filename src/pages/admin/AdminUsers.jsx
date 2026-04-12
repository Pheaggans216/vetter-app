import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { RotateCcw, Shield, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminUsers() {
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => base44.entities.User.list("-created_date", 100),
  });

  const resetMutation = useMutation({
    mutationFn: (userId) =>
      base44.entities.User.update(userId, { onboarded: false, app_role: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Reset successful", description: "User will be sent to onboarding on next login." });
    },
  });

  const ROLE_COLOR = {
    buyer: "bg-blue-50 text-blue-700",
    seller: "bg-purple-50 text-purple-700",
    vetter: "bg-green-50 text-green-700",
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Reset onboarding to force a user back to role selection on next login.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-14 bg-card rounded-xl border border-border/60 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">App Role</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Onboarded</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {u.role === "admin" || u.isAdmin
                          ? <Shield className="w-3.5 h-3.5 text-primary" />
                          : <User className="w-3.5 h-3.5 text-primary" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{u.full_name || "—"}</p>
                        <p className="text-muted-foreground text-[11px]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.app_role ? (
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${ROLE_COLOR[u.app_role] || "bg-muted text-muted-foreground"}`}>
                        {u.app_role}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">none</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${u.onboarded ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      {u.onboarded ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== me?.id && (
                      <button
                        onClick={() => resetMutation.mutate(u.id)}
                        disabled={resetMutation.isPending && resetMutation.variables === u.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[12px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Onboarding
                      </button>
                    )}
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