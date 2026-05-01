import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Link2, ShieldCheck, Check, Loader2, Lock, Zap, Upload, X, Star, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const PLATFORMS = [
  { value: "facebook_marketplace", label: "Facebook Marketplace" },
  { value: "craigslist", label: "Craigslist" },
  { value: "ebay", label: "eBay" },
  { value: "offerup", label: "OfferUp" },
  { value: "other", label: "Other Marketplace" },
];

const CATEGORIES = [
  { value: "cars_and_motorcycles", label: "Cars & Motorcycles" },
  { value: "electronics", label: "Electronics" },
  { value: "appliances", label: "Appliances" },
  { value: "jewelry_and_watches", label: "Jewelry & Watches" },
  { value: "luxury_fashion_and_handbags", label: "Luxury Fashion" },
  { value: "furniture", label: "Furniture" },
  { value: "tools_and_equipment", label: "Tools & Equipment" },
  { value: "rental_or_property_verification", label: "Property Verification" },
  { value: "other", label: "Other" },
];

const TIERS = [
  {
    id: "basic",
    label: "Basic Check",
    price: 39,
    badge: null,
    description: "Confirm the item exists, verify the seller, and get photo proof.",
    bestFor: "Items under $500",
    tasks: ["Confirm item exists in person", "Photo & video proof", "Verify seller identity", "Confirm meetup location"],
  },
  {
    id: "standard",
    label: "Standard Verification",
    price: 89,
    badge: "Most Popular",
    description: "Everything in Basic plus functional testing, condition report, and red flag assessment.",
    bestFor: "$500–$5,000 items",
    tasks: ["Everything in Basic", "Test item functionality", "Condition photos", "Written condition notes", "Red flag assessment"],
  },
  {
    id: "expert",
    label: "Expert Verification",
    price: 199,
    badge: null,
    description: "Full specialist inspection with market value insight and a clear Buy / Caution / Pass verdict.",
    bestFor: "$5,000+ items",
    tasks: ["Everything in Standard", "Specialist inspection notes", "Market value range", "Buy / Caution / Pass verdict"],
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

function detectPlatform(url) {
  if (!url) return "other";
  if (url.includes("facebook.com") || url.includes("fb.com")) return "facebook_marketplace";
  if (url.includes("craigslist.org")) return "craigslist";
  if (url.includes("ebay.com")) return "ebay";
  if (url.includes("offerup.com")) return "offerup";
  return "other";
}

// Step 0: Paste URL
function StepPasteLink({ url, setUrl, onNext, onSkip }) {
  return (
    <div className="space-y-6">
      <div className="text-center pb-2">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Link2 className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-[22px] font-heading font-bold text-foreground mb-2">
          Paste the listing link
        </h1>
        <p className="text-[14px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Found something on Facebook Marketplace, Craigslist, eBay, or OfferUp? Paste the link and we'll take it from there.
        </p>
      </div>

      <div className="flex gap-2 items-center p-1 bg-muted/40 rounded-2xl border border-border/60">
        <div className="flex items-center gap-2 px-3 text-muted-foreground shrink-0">
          <Link2 className="w-4 h-4" />
        </div>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://www.facebook.com/marketplace/..."
          className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground outline-none py-3 pr-3"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {["facebook_marketplace", "craigslist", "ebay", "offerup"].map(p => {
          const labels = { facebook_marketplace: "Facebook", craigslist: "Craigslist", ebay: "eBay", offerup: "OfferUp" };
          return (
            <button
              key={p}
              onClick={() => setUrl(p === "facebook_marketplace" ? "https://www.facebook.com/marketplace/" : p === "craigslist" ? "https://craigslist.org/" : p === "ebay" ? "https://www.ebay.com/itm/" : "https://offerup.com/")}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border/60 bg-card text-[12px] font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all"
            >
              <span>{labels[p]}</span>
            </button>
          );
        })}
      </div>

      <Button
        onClick={onNext}
        disabled={!url.trim()}
        size="lg"
        className="w-full rounded-xl h-12 text-[15px] font-semibold gap-2"
      >
        <ShieldCheck className="w-5 h-5" /> Continue with this link
      </Button>

      <button onClick={onSkip} className="w-full text-center text-[13px] text-muted-foreground hover:text-foreground transition-colors py-1">
        No link? Enter item details manually →
      </button>
    </div>
  );
}

// Step 1: Item details (manual or auto-detected)
function StepItemDetails({ form, update, uploading, onPhotoUpload, onRemovePhoto, detectedPlatform }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[13px] font-heading font-bold text-foreground mb-3">Item Details</p>
        <div className="p-4 bg-card rounded-2xl border border-border/60 space-y-3">
          <div>
            <Label className="text-[12px] mb-1.5 block">Item Title *</Label>
            <Input value={form.title} onChange={e => update({ title: e.target.value })} placeholder="e.g. 2019 Honda Civic EX" className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[12px] mb-1.5 block">Listed Price *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[13px]">$</span>
                <Input type="number" value={form.listing_price} onChange={e => update({ listing_price: e.target.value })} placeholder="0" className="rounded-xl pl-7" />
              </div>
            </div>
            <div>
              <Label className="text-[12px] mb-1.5 block">Category</Label>
              <Select value={form.category} onValueChange={v => update({ category: v })}>
                <SelectTrigger className="rounded-xl h-9 text-[12px]"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-[12px] mb-1.5 block">Marketplace Source</Label>
            <Select value={form.listing_platform} onValueChange={v => update({ listing_platform: v })}>
              <SelectTrigger className="rounded-xl h-9 text-[12px]"><SelectValue placeholder="Where did you find it?" /></SelectTrigger>
              <SelectContent>
                {PLATFORMS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[13px] font-heading font-bold text-foreground mb-3">Location & Seller</p>
        <div className="p-4 bg-card rounded-2xl border border-border/60 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[12px] mb-1.5 block">City</Label>
              <Input value={form.location_city} onChange={e => update({ location_city: e.target.value })} placeholder="City" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-[12px] mb-1.5 block">State</Label>
              <Input value={form.location_state} onChange={e => update({ location_state: e.target.value })} placeholder="State" className="rounded-xl" />
            </div>
          </div>
          <div>
            <Label className="text-[12px] mb-1.5 block">Seller Name (optional)</Label>
            <Input value={form.seller_name} onChange={e => update({ seller_name: e.target.value })} placeholder="Seller's name from the listing" className="rounded-xl" />
          </div>
        </div>
      </div>

      <div>
        <p className="text-[13px] font-heading font-bold text-foreground mb-3">Screenshots / Photos</p>
        <div className="p-4 bg-card rounded-2xl border border-border/60">
          <p className="text-[12px] text-muted-foreground mb-3">Upload listing screenshots or item photos to help the Vetter.</p>
          <div className="grid grid-cols-4 gap-2">
            {form.uploaded_screenshots.map((url, i) => (
              <div key={i} className="relative aspect-square">
                <img src={url} alt="" className="w-full h-full object-cover rounded-xl border border-border/60" />
                <button onClick={() => onRemovePhoto(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all">
              <input type="file" accept="image/*" multiple className="hidden" onChange={onPhotoUpload} />
              {uploading ? <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" /> : <><Upload className="w-5 h-5 text-muted-foreground mb-1" /><span className="text-[10px] text-muted-foreground">Add</span></>}
            </label>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[13px] font-heading font-bold text-foreground mb-3">Notes for the Vetter</p>
        <div className="p-4 bg-card rounded-2xl border border-border/60">
          <Textarea value={form.notes} onChange={e => update({ notes: e.target.value })} placeholder="Anything specific you want the Vetter to check? Red flags you noticed? Preferred meetup time?" className="rounded-xl min-h-[80px]" />
        </div>
      </div>
    </div>
  );
}

// Step 2: Tier + add-ons
function StepChooseTier({ tier, setTier, isRush, setIsRush, valueTier, setValueTier }) {
  const selectedTier = TIERS.find(t => t.id === tier);
  const basePrice = selectedTier?.price || 89;
  const rushFee = isRush ? 25 : 0;
  const highValueFee = VALUE_TIERS.find(v => v.id === valueTier)?.fee || 0;
  const total = basePrice + rushFee + highValueFee;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[13px] font-heading font-bold text-foreground mb-3">Verification Tier</p>
        <div className="space-y-3">
          {TIERS.map(t => (
            <button key={t.id} onClick={() => setTier(t.id)}
              className={cn("w-full p-4 rounded-2xl border-2 text-left transition-all relative",
                tier === t.id ? "border-primary bg-primary/5" : "border-border/60 bg-card")}>
              {t.badge && (
                <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">{t.badge}</span>
              )}
              <div className="flex items-start gap-3">
                <div className={cn("w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0",
                  tier === t.id ? "border-primary bg-primary" : "border-border")}>
                  {tier === t.id && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 pr-12">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-heading font-bold text-[15px] text-foreground">{t.label}</p>
                    <p className="font-bold text-[17px] text-accent">${t.price}</p>
                  </div>
                  <p className="text-[12px] text-muted-foreground mb-1.5 leading-relaxed">{t.description}</p>
                  <p className="text-[11px] text-primary font-semibold">Best for: {t.bestFor}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[13px] font-heading font-bold text-foreground mb-3">Item Value</p>
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
          <p className="text-[12px] text-muted-foreground">Priority vetter dispatch for today</p>
        </div>
        <p className={cn("font-bold text-[15px]", isRush ? "text-amber-600" : "text-muted-foreground")}>+$25</p>
      </button>

      {/* Summary */}
      <div className="p-4 bg-muted/50 rounded-2xl border border-border/40">
        <div className="space-y-1.5">
          <CostRow label={selectedTier?.label} value={`$${basePrice}`} />
          {rushFee > 0 && <CostRow label="Rush Same-Day Fee" value={`+$${rushFee}`} />}
          {highValueFee > 0 && <CostRow label="High-Value Protection" value={`+$${highValueFee}`} />}
          <div className="border-t border-border/50 pt-2 mt-2">
            <CostRow label="Total" value={`$${total}`} bold />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">💳 Payment held securely. Released only after you confirm the report.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[{ icon: ShieldCheck, label: "Certified Vetters" }, { icon: Lock, label: "Secure Payment" }, { icon: Star, label: "Reviewed Reports" }].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1 p-3 bg-card rounded-xl border border-border/60">
            <Icon className="w-4 h-4 text-primary" />
            <p className="text-[10px] text-muted-foreground text-center font-medium">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostRow({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <p className={cn("text-[13px] text-muted-foreground", bold && "font-bold text-foreground")}>{label}</p>
      <p className={cn("text-[13px] font-semibold text-foreground", bold && "font-bold text-[15px]")}>{value}</p>
    </div>
  );
}

export default function GetItVetted() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0); // 0: paste link, 1: item details, 2: choose tier
  const [listingUrl, setListingUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    listing_price: "",
    category: "",
    listing_platform: "other",
    listing_url: "",
    location_city: "",
    location_state: "",
    seller_name: "",
    uploaded_screenshots: [],
    notes: "",
  });
  const update = (patch) => setForm(prev => ({ ...prev, ...patch }));

  const [tier, setTier] = useState("standard");
  const [isRush, setIsRush] = useState(false);
  const [valueTier, setValueTier] = useState("under_1k");

  const selectedTier = TIERS.find(t => t.id === tier);
  const basePrice = selectedTier?.price || 89;
  const rushFee = isRush ? 25 : 0;
  const highValueFee = VALUE_TIERS.find(v => v.id === valueTier)?.fee || 0;
  const totalPrice = basePrice + rushFee + highValueFee;

  const handleUrlNext = () => {
    const detected = detectPlatform(listingUrl);
    update({ listing_url: listingUrl, listing_platform: detected });
    setStep(1);
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(prev => ({ ...prev, uploaded_screenshots: [...prev.uploaded_screenshots, file_url] }));
    }
    setUploading(false);
  };

  const handleRemovePhoto = (i) => {
    setForm(prev => ({ ...prev, uploaded_screenshots: prev.uploaded_screenshots.filter((_, idx) => idx !== i) }));
  };

  // Update value tier when price changes
  const handlePriceChange = (price) => {
    update({ listing_price: price });
    if (price) setValueTier(getValueTierFromPrice(Number(price)));
  };

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }

      // Create a Listing record to represent this external item
      const listing = await base44.entities.Listing.create({
        title: form.title,
        category: form.category || "other",
        price: Number(form.listing_price) || 0,
        description: `${form.notes || ""}\n\nOriginal listing: ${form.listing_url || ""}`.trim(),
        photos: form.uploaded_screenshots,
        location_city: form.location_city,
        location_state: form.location_state,
        seller_email: form.seller_name ? `seller-${Date.now()}@external.vetter` : `unknown-${Date.now()}@external.vetter`,
        vetting_status: "vetter_requested",
        active: true,
      });

      // Create VetterJob
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
        fee_split: "buyer_pays_all",
        is_rush: isRush,
        item_value_tier: valueTier,
        location_city: form.location_city,
        location_state: form.location_state,
        status: "pending_payment",
        payment_status: "unpaid",
      });

      const res = await base44.functions.invoke("create-checkout", {
        jobId: job.id,
        amount: totalPrice,
        tierLabel: selectedTier?.label || tier,
        buyerEmail: user?.email,
        buyerName: user?.full_name,
      });

      if (!res.data?.redirectUrl) {
        throw new Error(res.data?.error || "Failed to create payment session");
      }

      return { redirectUrl: res.data.redirectUrl };
    },
    onSuccess: (result) => {
      if (result?.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    },
  });

  const canBook = form.title.trim() && form.listing_price;

  const STEP_TITLES = ["Paste Listing Link", "Item Details", "Choose Verification Level"];

  return (
    <div className="pb-10 max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-5 py-3 flex items-center gap-3">
        {step > 0 ? (
          <button onClick={() => setStep(s => s - 1)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        ) : (
          <Link to="/">
            <button className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          </Link>
        )}
        <div className="flex-1">
          <p className="text-[11px] text-muted-foreground">Step {step + 1} of 3</p>
          <p className="text-[14px] font-heading font-bold text-foreground">{STEP_TITLES[step]}</p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-6 bg-primary" : i < step ? "w-3 bg-primary/40" : "w-3 bg-border")} />
          ))}
        </div>
      </div>

      <div className="px-5 pt-5">
        {step === 0 && (
          <StepPasteLink
            url={listingUrl}
            setUrl={setListingUrl}
            onNext={handleUrlNext}
            onSkip={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <>
            {form.listing_url && (
              <div className="mb-4 flex items-center gap-2 px-3 py-2.5 bg-primary/5 rounded-xl border border-primary/15">
                <ExternalLink className="w-4 h-4 text-primary shrink-0" />
                <p className="text-[12px] text-primary truncate flex-1">{form.listing_url}</p>
              </div>
            )}
            <StepItemDetails
              form={form}
              update={(patch) => {
                if (patch.listing_price !== undefined) {
                  handlePriceChange(patch.listing_price);
                } else {
                  update(patch);
                }
              }}
              uploading={uploading}
              onPhotoUpload={handlePhotoUpload}
              onRemovePhoto={handleRemovePhoto}
            />
            <div className="mt-6">
              <Button
                onClick={() => setStep(2)}
                disabled={!form.title.trim() || !form.listing_price}
                size="lg"
                className="w-full rounded-xl h-12 text-[15px] font-semibold gap-2"
              >
                Choose Verification Level <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Item preview */}
            <div className="mb-5 p-3.5 bg-card rounded-2xl border border-border/60 flex items-center gap-3">
              {form.uploaded_screenshots[0] ? (
                <img src={form.uploaded_screenshots[0]} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-heading font-bold text-foreground truncate">{form.title}</p>
                <p className="text-[12px] text-muted-foreground">${Number(form.listing_price).toLocaleString()} · {PLATFORMS.find(p => p.value === form.listing_platform)?.label || "Marketplace"}</p>
              </div>
            </div>

            <StepChooseTier
              tier={tier}
              setTier={setTier}
              isRush={isRush}
              setIsRush={setIsRush}
              valueTier={valueTier}
              setValueTier={setValueTier}
            />

            <div className="mt-6 space-y-3">
              <Button
                onClick={() => bookMutation.mutate()}
                disabled={!canBook || bookMutation.isPending}
                size="lg"
                className="w-full rounded-xl h-12 text-[15px] font-semibold gap-2"
              >
                {bookMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  : <><Lock className="w-5 h-5" /> Book a Vetter — ${totalPrice}</>
                }
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                Cancel up to 2 hours before the appointment for a full refund.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}