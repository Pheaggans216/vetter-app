import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Zap, Check, Loader2, Lock, MapPin, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const TIERS = [
  {
    id: "basic",
    label: "Basic Check",
    price: 39,
    badge: null,
    description: "Perfect for low-risk purchases. A certified Vetter confirms the item exists, verifies the seller, and provides photo proof.",
    bestFor: "Items under $500",
    tasks: [
      "Confirm item exists in person",
      "Photo & video proof",
      "Verify seller identity",
      "Confirm meetup location",
    ],
  },
  {
    id: "standard",
    label: "Standard Verification",
    price: 89,
    badge: "Most Popular",
    description: "Our most popular tier. Includes everything in Basic plus functional testing, a written condition report, and red flag assessment.",
    bestFor: "$500–$5,000 items",
    tasks: [
      "Everything in Basic",
      "Test item functionality",
      "Condition photos uploaded",
      "Written condition notes",
      "Red flag assessment",
    ],
  },
  {
    id: "expert",
    label: "Expert Verification",
    price: 199,
    badge: null,
    description: "Full specialist inspection for high-value items. Includes market value insight and a clear Buy / Caution / Pass recommendation.",
    bestFor: "$5,000+ items",
    tasks: [
      "Everything in Standard",
      "Specialist inspection notes",
      "Market value range",
      "Buy / Caution / Pass verdict",
    ],
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

export default function VettingRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [tier, setTier] = useState("standard");
  const [isRush, setIsRush] = useState(false);
  const [valueTier, setValueTier] = useState("under_1k");
  const [feeSplit, setFeeSplit] = useState("buyer_pays_all");

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => base44.entities.Listing.filter({ id }),
    enabled: !!id,
  });
  const listing = listings[0];

  useEffect(() => {
    if (listing) {
      setValueTier(getValueTierFromPrice(listing.price));
      if (listing.seller_pays_upfront) setFeeSplit("seller_pays_all");
      else if (listing.seller_splits_cost) setFeeSplit("split_with_seller");
    }
  }, [listing?.id]);

  const selectedTier = TIERS.find(t => t.id === tier);
  const basePrice = selectedTier?.price || 89;
  const rushFee = isRush ? 25 : 0;
  const highValueFee = VALUE_TIERS.find(v => v.id === valueTier)?.fee || 0;
  const totalPrice = basePrice + rushFee + highValueFee;
  const buyerPays =
    feeSplit === "seller_pays_all" ? 0
    : feeSplit === "split_with_seller" ? Math.ceil(totalPrice / 2)
    : totalPrice;

  const bookMutation = useMutation({
    mutationFn: async () => {
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

      await base44.entities.Listing.update(listing.id, { vetting_status: "vetter_requested" });

      if (buyerPays === 0) {
        await base44.entities.VetterJob.update(job.id, { status: "payment_secured", payment_status: "held" });
        await base44.entities.Listing.update(listing.id, { vetting_status: "payment_secured" });
        return { redirectUrl: null };
      }

      const res = await base44.functions.invoke("create-checkout", {
        jobId: job.id,
        amount: buyerPays,
        tierLabel: selectedTier?.label || tier,
        buyerEmail: user?.email,
        buyerName: user?.full_name,
      });

      if (!res.data?.redirectUrl) {
        throw new Error(res.data?.error || "Failed to create payment session");
      }

      return { redirectUrl: res.data.redirectUrl };
    },
    onSuccess: ({ redirectUrl }) => {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        queryClient.invalidateQueries({ queryKey: ["listing", id] });
        queryClient.invalidateQueries({ queryKey: ["listing-job", id] });
        toast({ title: "Vetter booked!", description: "A Vetter will be matched to your request." });
        navigate(`/listings/${id}`);
      }
    },
  });

  if (isLoading) return (
    <div className="px-5 pt-4 space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-28 bg-card rounded-2xl animate-pulse border border-border/60" />)}
    </div>
  );

  if (!listing) return (
    <div className="px-5 pt-10 text-center">
      <p className="text-muted-foreground">Listing not found.</p>
      <Link to="/listings"><Button variant="outline" className="mt-4 rounded-xl">Back to Listings</Button></Link>
    </div>
  );

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-5 py-3 flex items-center gap-3">
        <Link to={`/listings/${id}`}>
          <button className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground">Vetting for</p>
          <p className="text-[14px] font-heading font-bold text-foreground truncate">{listing.title}</p>
        </div>
        <span className="text-[15px] font-bold text-accent shrink-0">${listing.price?.toLocaleString()}</span>
      </div>

      <div className="px-5 pt-5 space-y-6">

        {/* Intro */}
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/15">
          <p className="text-[14px] font-heading font-bold text-primary mb-1">Don't buy blind. 🛡</p>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            A certified Vetter will inspect this item in person before you pay. Choose a tier below based on the item's value and risk.
          </p>
          {(listing.location_city || listing.location_state) && (
            <p className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {[listing.location_city, listing.location_state].filter(Boolean).join(", ")}
            </p>
          )}
        </div>

        {/* Tier selection */}
        <div>
          <p className="text-[13px] font-heading font-bold text-foreground mb-3">1. Choose Your Verification Tier</p>
          <div className="space-y-3">
            {TIERS.map(t => (
              <button
                key={t.id}
                onClick={() => setTier(t.id)}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left transition-all relative",
                  tier === t.id ? "border-primary bg-primary/5" : "border-border/60 bg-card"
                )}
              >
                {t.badge && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                    {t.badge}
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0",
                    tier === t.id ? "border-primary bg-primary" : "border-border"
                  )}>
                    {tier === t.id && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 pr-12">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-heading font-bold text-[15px] text-foreground">{t.label}</p>
                      <p className="font-bold text-[17px] text-accent">${t.price}</p>
                    </div>
                    <p className="text-[12px] text-muted-foreground mb-2 leading-relaxed">{t.description}</p>
                    <p className="text-[11px] text-primary font-semibold mb-2">Best for: {t.bestFor}</p>
                    <div className="space-y-1">
                      {t.tasks.map((task, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                          <p className="text-[11px] text-muted-foreground">{task}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        <div>
          <p className="text-[13px] font-heading font-bold text-foreground mb-3">2. Add-Ons</p>

          {/* Item value */}
          <p className="text-[12px] text-muted-foreground mb-2">Item value (for high-value protection fee)</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {VALUE_TIERS.map(v => (
              <button
                key={v.id}
                onClick={() => setValueTier(v.id)}
                className={cn(
                  "p-3 rounded-xl border-2 text-left transition-all",
                  valueTier === v.id ? "border-primary bg-primary/5" : "border-border/60 bg-card"
                )}
              >
                <p className="text-[12px] font-semibold text-foreground">{v.label}</p>
                <p className={cn("text-[11px] font-medium", v.fee > 0 ? "text-amber-600" : "text-accent")}>
                  {v.fee > 0 ? `+$${v.fee}` : "Included"}
                </p>
              </button>
            ))}
          </div>

          {/* Rush toggle */}
          <button
            onClick={() => setIsRush(!isRush)}
            className={cn(
              "w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all",
              isRush ? "border-amber-400 bg-amber-50" : "border-border/60 bg-card"
            )}
          >
            <Zap className={cn("w-5 h-5 shrink-0", isRush ? "text-amber-500" : "text-muted-foreground")} />
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-foreground">Rush Same-Day Service</p>
              <p className="text-[12px] text-muted-foreground">Prioritized vetter dispatch for today</p>
            </div>
            <div className={cn("flex items-center gap-1", isRush ? "text-amber-600" : "text-muted-foreground")}>
              <p className="font-bold text-[14px]">+$25</p>
              {isRush && <Check className="w-4 h-4" />}
            </div>
          </button>
        </div>

        {/* Fee split (if seller offers it) */}
        {(listing.seller_splits_cost || listing.seller_pays_upfront) && (
          <div>
            <p className="text-[13px] font-heading font-bold text-foreground mb-3">3. Who Pays the Vetter?</p>
            <div className="space-y-2">
              {[
                { id: "buyer_pays_all", label: "I'll pay the full fee", sub: `You pay $${totalPrice}` },
                ...(listing.seller_splits_cost ? [{ id: "split_with_seller", label: "Split with seller", sub: `You pay $${Math.ceil(totalPrice / 2)}, seller pays $${Math.floor(totalPrice / 2)}` }] : []),
                ...(listing.seller_pays_upfront ? [{ id: "seller_pays_all", label: "Seller pays (Vetted Included)", sub: "You pay $0 — seller pre-paid" }] : []),
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFeeSplit(opt.id)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                    feeSplit === opt.id ? "border-primary bg-primary/5" : "border-border/60 bg-card"
                  )}
                >
                  <div className={cn("w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0",
                    feeSplit === opt.id ? "border-primary bg-primary" : "border-border")}>
                    {feeSplit === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{opt.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cost Summary */}
        <div className="p-4 bg-muted/50 rounded-2xl border border-border/40">
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">Cost Summary</p>
          <div className="space-y-1.5">
            <CostRow label={selectedTier?.label} value={`$${basePrice}`} />
            {rushFee > 0 && <CostRow label="Rush Same-Day Fee" value={`+$${rushFee}`} />}
            {highValueFee > 0 && <CostRow label="High-Value Protection" value={`+$${highValueFee}`} />}
            <div className="border-t border-border/50 pt-2 mt-2">
              <CostRow label="Total Verification Cost" value={`$${totalPrice}`} bold />
              {feeSplit !== "buyer_pays_all" && (
                <CostRow label="Your share to pay" value={`$${buyerPays}`} bold highlight />
              )}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            💳 Payment is held securely and only released to the Vetter after you confirm the report.
          </p>
        </div>

        {/* Trust signals */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: ShieldCheck, label: "Certified Vetters" },
            { icon: Lock, label: "Secure Payment" },
            { icon: Star, label: "Reviewed Reports" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 p-3 bg-card rounded-xl border border-border/60">
              <Icon className="w-4 h-4 text-primary" />
              <p className="text-[10px] text-muted-foreground text-center font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Book button */}
        <Button
          size="lg"
          onClick={() => bookMutation.mutate()}
          disabled={bookMutation.isPending}
          className="w-full rounded-xl h-12 text-[15px] font-semibold gap-2"
        >
          {bookMutation.isPending
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
            : <><Lock className="w-5 h-5" /> Book a Vetter — ${buyerPays > 0 ? buyerPays : "Free"}</>
          }
        </Button>

        <p className="text-center text-[11px] text-muted-foreground pb-2">
          By booking you agree to our vetting terms. Cancel up to 2 hours before the appointment for a full refund.
        </p>
      </div>
    </div>
  );
}

function CostRow({ label, value, bold, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <p className={cn("text-[13px] text-muted-foreground", bold && "font-bold text-foreground")}>{label}</p>
      <p className={cn("text-[13px] font-semibold", highlight ? "text-primary text-[15px]" : "text-foreground", bold && "font-bold")}>{value}</p>
    </div>
  );
}