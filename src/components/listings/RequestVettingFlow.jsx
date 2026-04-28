import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { X, ShieldCheck, Zap, Star, Check, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const TIERS = [
  {
    id: "basic",
    label: "Basic Check",
    price: 39,
    badge: null,
    description: "Item exists · Photo/video proof · Seller identity · Location verified",
    bestFor: "Items under $500",
    tasks: ["Confirm item exists", "Photo/video proof", "Verify seller identity", "Confirm meetup/location"],
  },
  {
    id: "standard",
    label: "Standard Verification",
    price: 89,
    badge: "Most Popular",
    description: "Everything in Basic · Functional testing · Condition report · Red flag assessment",
    bestFor: "$500–$5,000 items",
    tasks: ["All Basic tasks", "Test item functionality", "Upload condition photos", "Written condition notes", "Red flag assessment"],
  },
  {
    id: "expert",
    label: "Expert Verification",
    price: 199,
    badge: null,
    description: "Everything in Standard · Specialist vetter · Deep inspection · Market value insight",
    bestFor: "$5,000+ items",
    tasks: ["All Standard tasks", "Specialist inspection notes", "Market value range", "Buy / Caution / Pass recommendation"],
  },
];

const VALUE_TIERS = [
  { id: "under_1k", label: "Under $1,000", fee: 0 },
  { id: "1k_5k", label: "$1,000–$5,000", fee: 25 },
  { id: "5k_20k", label: "$5,000–$20,000", fee: 50 },
  { id: "over_20k", label: "$20,000+", fee: 100 },
];

function getValueTierFromPrice(price) {
  if (!price) return "under_1k";
  if (price < 1000) return "under_1k";
  if (price < 5000) return "1k_5k";
  if (price < 20000) return "5k_20k";
  return "over_20k";
}

export default function RequestVettingFlow({ listing, onClose, onSuccess }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0); // 0: tier, 1: addons, 2: payment split, 3: pay, 4: confirmed
  const [tier, setTier] = useState("standard");
  const [isRush, setIsRush] = useState(false);
  const [valueTier, setValueTier] = useState(getValueTierFromPrice(listing.price));
  const [feeSplit, setFeeSplit] = useState(() => {
    if (listing.seller_pays_upfront) return "seller_pays_all";
    if (listing.seller_splits_cost) return "split_with_seller";
    return "buyer_pays_all";
  });

  const selectedTier = TIERS.find(t => t.id === tier);
  const basePrice = selectedTier?.price || 89;
  const rushFee = isRush ? 25 : 0;
  const highValueFee = VALUE_TIERS.find(v => v.id === valueTier)?.fee || 0;
  const distanceFee = 0; // auto-calculated later by admin
  const totalPrice = basePrice + rushFee + highValueFee + distanceFee;
  const buyerPays = feeSplit === "seller_pays_all" ? 0 : feeSplit === "split_with_seller" ? Math.ceil(totalPrice / 2) : totalPrice;

  const mutation = useMutation({
    mutationFn: async () => {
      // Create the VetterJob first
      const job = await base44.entities.VetterJob.create({
        listing_id: listing.id,
        buyer_email: user.email,
        seller_email: listing.seller_email,
        tier,
        base_price: basePrice,
        rush_fee: rushFee,
        high_value_fee: highValueFee,
        distance_fee: 0,
        total_price: totalPrice,
        vetter_payout: Math.round(totalPrice * 0.8),
        platform_fee: Math.round(totalPrice * 0.2),
        fee_split: feeSplit,
        is_rush: isRush,
        item_value_tier: valueTier,
        location_city: listing.location_city,
        location_state: listing.location_state,
        status: "pending_payment",
        payment_status: "unpaid",
      });

      // Update listing status
      await base44.entities.Listing.update(listing.id, { vetting_status: "vetter_requested" });

      // If seller pays — no checkout needed
      if (buyerPays === 0) {
        await base44.entities.VetterJob.update(job.id, {
          status: "payment_secured",
          payment_status: "held",
        });
        await base44.entities.Listing.update(listing.id, { vetting_status: "payment_secured" });
        return { job, redirectUrl: null };
      }

      // Create Wix Payments checkout session
      const selectedTierLabel = TIERS.find(t => t.id === tier)?.label || tier;
      const res = await base44.functions.invoke('create-checkout', {
        jobId: job.id,
        amount: buyerPays,
        tierLabel: selectedTierLabel,
        buyerEmail: user?.email,
        buyerName: user?.full_name,
      });

      if (!res.data?.redirectUrl) {
        throw new Error(res.data?.error || 'Failed to create payment session');
      }

      return { job, redirectUrl: res.data.redirectUrl };
    },
    onSuccess: ({ redirectUrl }) => {
      if (redirectUrl) {
        // Redirect to Wix Payments hosted checkout
        window.location.href = redirectUrl;
      } else {
        // Seller paid — go to confirmed screen
        setStep(4);
      }
    },
  });

  const handlePay = () => mutation.mutate();

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mt-auto bg-background rounded-t-3xl max-h-[92vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="px-5 pb-8 pt-2">
          {step === 4 ? (
            <ConfirmedScreen onDone={onSuccess} total={totalPrice} buyerPays={buyerPays} />
          ) : (
            <>
              {/* Step header */}
              <div className="mb-5">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">
                  Step {step + 1} of 3
                </p>
                <h2 className="text-[18px] font-heading font-bold text-foreground">
                  {step === 0 && "Choose Verification Tier"}
                  {step === 1 && "Add-Ons"}
                  {step === 2 && "Who Pays the Vetter?"}
                </h2>
              </div>

              {/* Step 0: Tier selection */}
              {step === 0 && (
                <div className="space-y-3 mb-6">
                  {TIERS.map(t => (
                    <button key={t.id} onClick={() => setTier(t.id)}
                      className={cn("w-full p-4 rounded-2xl border-2 text-left transition-all relative",
                        tier === t.id ? "border-primary bg-primary/5" : "border-border/60 bg-card")}>
                      {t.badge && (
                        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                          {t.badge}
                        </span>
                      )}
                      <div className="flex items-start gap-3">
                        <div className={cn("w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0",
                          tier === t.id ? "border-primary bg-primary" : "border-border")}>
                          {tier === t.id && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-heading font-bold text-[15px] text-foreground">{t.label}</p>
                            <p className="font-bold text-[17px] text-accent">${t.price}</p>
                          </div>
                          <p className="text-[12px] text-muted-foreground mb-1.5">{t.description}</p>
                          <p className="text-[11px] text-primary font-medium">Best for: {t.bestFor}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 1: Add-ons */}
              {step === 1 && (
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-[13px] font-semibold text-foreground mb-3">Item Value (for protection fee)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {VALUE_TIERS.map(v => (
                        <button key={v.id} onClick={() => setValueTier(v.id)}
                          className={cn("p-3 rounded-xl border-2 text-left transition-all",
                            valueTier === v.id ? "border-primary bg-primary/5" : "border-border/60 bg-card")}>
                          <p className="text-[12px] font-semibold text-foreground">{v.label}</p>
                          <p className={cn("text-[11px] font-medium", v.fee > 0 ? "text-amber-600" : "text-accent")}>
                            {v.fee > 0 ? `+$${v.fee}` : "Included"}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => setIsRush(!isRush)}
                    className={cn("w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all",
                      isRush ? "border-amber-400 bg-amber-50" : "border-border/60 bg-card")}>
                    <Zap className={cn("w-5 h-5 shrink-0", isRush ? "text-amber-500" : "text-muted-foreground")} />
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-foreground">Rush Same-Day Service</p>
                      <p className="text-[12px] text-muted-foreground">Prioritized vetter dispatch for today</p>
                    </div>
                    <p className={cn("font-bold text-[15px]", isRush ? "text-amber-600" : "text-muted-foreground")}>+$25</p>
                  </button>

                  {/* Price summary */}
                  <div className="p-4 bg-muted/50 rounded-2xl">
                    <PriceRow label={`${selectedTier?.label}`} value={`$${basePrice}`} />
                    {rushFee > 0 && <PriceRow label="Rush Fee" value={`+$${rushFee}`} />}
                    {highValueFee > 0 && <PriceRow label="High-Value Protection" value={`+$${highValueFee}`} />}
                    <div className="border-t border-border/40 mt-2 pt-2">
                      <PriceRow label="Total" value={`$${totalPrice}`} bold />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Fee split */}
              {step === 2 && (
                <div className="space-y-3 mb-6">
                  <p className="text-[13px] text-muted-foreground mb-2">
                    Total verification cost: <span className="font-bold text-foreground">${totalPrice}</span>
                  </p>

                  {[
                    { id: "buyer_pays_all", label: "I'll pay the full Vetter fee", sub: `You pay $${totalPrice}`, icon: ShieldCheck },
                    ...(listing.seller_splits_cost ? [{ id: "split_with_seller", label: "Ask seller to split fee", sub: `You pay $${Math.ceil(totalPrice / 2)}, seller pays $${Math.floor(totalPrice / 2)}`, icon: ShieldCheck }] : []),
                    ...(listing.seller_pays_upfront ? [{ id: "seller_pays_all", label: "Seller is paying (Vetted Included)", sub: "You pay $0 — seller pre-paid", icon: ShieldCheck }] : []),
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setFeeSplit(opt.id)}
                      className={cn("w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all",
                        feeSplit === opt.id ? "border-primary bg-primary/5" : "border-border/60 bg-card")}>
                      <div className={cn("w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0",
                        feeSplit === opt.id ? "border-primary bg-primary" : "border-border")}>
                        {feeSplit === opt.id && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{opt.label}</p>
                        <p className="text-[12px] text-muted-foreground mt-0.5">{opt.sub}</p>
                      </div>
                    </button>
                  ))}

                  <div className="p-4 bg-muted/50 rounded-2xl mt-4">
                    <PriceRow label="Your total to pay" value={`$${buyerPays}`} bold />
                    <p className="text-[11px] text-muted-foreground mt-2">Payment is held securely until verification is complete.</p>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-2">
                {step > 0 && (
                  <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1 rounded-xl h-11">Back</Button>
                )}
                {step < 2 ? (
                  <Button onClick={() => setStep(s => s + 1)} className="flex-1 rounded-xl h-11 font-semibold">Continue</Button>
                ) : (
                  <Button onClick={handlePay} disabled={mutation.isPending} className="flex-1 rounded-xl h-11 font-semibold gap-2">
                    {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Lock className="w-4 h-4" /> Secure Payment — ${buyerPays}</>}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfirmedScreen({ onDone, total, buyerPays }) {
  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-[20px] font-heading font-bold text-foreground mb-2">Payment Secured!</h2>
      <p className="text-[14px] text-muted-foreground leading-relaxed mb-2">
        Your payment is secure. A Vetter will now be matched to this request.
      </p>
      <p className="text-[12px] text-muted-foreground mb-6">
        Payment is held securely until verification is complete. You'll be notified once a Vetter is assigned.
      </p>
      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/15 mb-6 text-left">
        <p className="text-[12px] text-muted-foreground mb-1">Payment held</p>
        <p className="text-[20px] font-bold text-foreground">${buyerPays}</p>
        <p className="text-[11px] text-muted-foreground mt-1">Released to Vetter after you confirm the report.</p>
      </div>
      <Button onClick={onDone} size="lg" className="w-full rounded-xl h-12 text-[15px] font-semibold">
        <ShieldCheck className="w-5 h-5 mr-2" /> Track Verification
      </Button>
    </div>
  );
}

function PriceRow({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <p className={cn("text-[13px] text-muted-foreground", bold && "font-bold text-foreground")}>{label}</p>
      <p className={cn("text-[13px] font-semibold text-foreground", bold && "text-[15px]")}>{value}</p>
    </div>
  );
}