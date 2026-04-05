import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VetterMatchCard from "./VetterMatchCard";
import { Sparkles, Search, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Category → specialty mapping
const CATEGORY_SPECIALTY_MAP = {
  cars_and_motorcycles: ["mechanic"],
  electronics: ["electronics_technician"],
  appliances: ["appliance_expert"],
  jewelry_and_watches: ["jeweler", "watch_specialist"],
  luxury_fashion_and_handbags: ["luxury_authenticator"],
  furniture: ["furniture_expert"],
  tools_and_equipment: ["contractor"],
  rental_or_property_verification: ["property_verifier", "contractor"],
  other: [],
};

function scoreVetter(vetter) {
  let score = 0;
  if (vetter.rating) score += vetter.rating * 10;
  if (vetter.years_of_experience) score += vetter.years_of_experience * 2;
  if (vetter.total_inspections) score += Math.min(vetter.total_inspections, 50);
  if (vetter.identity_verified) score += 5;
  if (vetter.background_checked) score += 5;
  if (vetter.certified_specialist) score += 8;
  return score;
}

export default function MatchingPanel({ request, onMatched }) {
  const [selectedVetter, setSelectedVetter] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: allVetters = [], isLoading } = useQuery({
    queryKey: ["vetters-active"],
    queryFn: () => base44.entities.VetterProfile.filter({ status: "active", available: true }),
  });

  // Filter by service type and specialty
  const relevantSpecialties = CATEGORY_SPECIALTY_MAP[request.category] || [];

  const matched = allVetters
    .filter((v) => {
      const offersService = v.service_types?.includes(request.service_type);
      const hasSpecialty =
        relevantSpecialties.length === 0 ||
        v.specialties?.some((s) => relevantSpecialties.includes(s));
      return offersService && hasSpecialty;
    })
    .sort((a, b) => scoreVetter(b) - scoreVetter(a));

  // Also show vetters in same state even if specialty doesn't perfectly match
  const nearby = allVetters
    .filter((v) => v.state === request.location_state && !matched.find((m) => m.id === v.id))
    .sort((a, b) => scoreVetter(b) - scoreVetter(a));

  const topSuggestions = matched.slice(0, 3);
  const browseList = [...matched, ...nearby].slice(0, 20);

  const assignMutation = useMutation({
    mutationFn: () =>
      base44.entities.VettingRequest.update(request.id, {
        vetter_email: selectedVetter.user_email,
        status: "matched",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vetting-request", request.id] });
      queryClient.invalidateQueries({ queryKey: ["vetting-requests"] });
      setConfirmed(true);
      onMatched?.();
      toast({ title: "Vetter assigned!", description: `${selectedVetter.display_name} has been notified.` });
    },
  });

  if (confirmed) {
    return (
      <div className="p-5 bg-card rounded-2xl border border-border/60 shadow-sm text-center">
        <CheckCircle2 className="w-10 h-10 text-accent mx-auto mb-3" />
        <p className="font-heading font-bold text-foreground text-[16px] mb-1">Vetter Assigned!</p>
        <p className="text-muted-foreground text-[13px]">
          {selectedVetter?.display_name} has been notified and will confirm shortly.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-5 bg-card rounded-2xl border border-border/60 flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <p className="text-[13px] text-muted-foreground">Finding the best Vetters near you...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[14px] font-heading font-bold text-foreground mb-0.5">Find your Vetter</p>
        <p className="text-[12px] text-muted-foreground">
          Real people. Real proof. Select a verified local expert to inspect this item.
        </p>
      </div>

      <Tabs defaultValue="suggested">
        <TabsList className="w-full rounded-xl h-9 mb-4">
          <TabsTrigger value="suggested" className="flex-1 text-[12px] gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Top Matches
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex-1 text-[12px] gap-1">
            <Search className="w-3.5 h-3.5" /> Browse All
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggested">
          {topSuggestions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-[13px]">
                No Vetters matched exactly — try browsing all available Vetters nearby.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topSuggestions.map((v, i) => (
                <VetterMatchCard
                  key={v.id}
                  vetter={v}
                  serviceType={request.service_type}
                  onSelect={setSelectedVetter}
                  selected={selectedVetter?.id === v.id}
                  isTop={i === 0}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse">
          {browseList.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-[13px]">No Vetters available in your area yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {browseList.map((v, i) => (
                <VetterMatchCard
                  key={v.id}
                  vetter={v}
                  serviceType={request.service_type}
                  onSelect={setSelectedVetter}
                  selected={selectedVetter?.id === v.id}
                  isTop={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedVetter && (
        <div className="sticky bottom-20 left-0 right-0">
          <Button
            onClick={() => assignMutation.mutate()}
            disabled={assignMutation.isPending}
            size="lg"
            className="w-full rounded-xl h-12 text-[15px] font-semibold shadow-lg"
          >
            {assignMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Assigning...</>
            ) : (
              <>Confirm — {selectedVetter.display_name}</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}