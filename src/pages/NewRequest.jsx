import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "react-router-dom";
import SecureExchangeCard from "@/components/secure-exchange/SecureExchangeCard";

const platforms = [
  { value: "facebook_marketplace", label: "Facebook Marketplace" },
  { value: "craigslist", label: "Craigslist" },
  { value: "ebay", label: "eBay" },
  { value: "offerup", label: "OfferUp" },
  { value: "other", label: "Other" },
];

const categories = [
  { value: "cars_and_motorcycles", label: "Cars & Motorcycles" },
  { value: "electronics", label: "Electronics" },
  { value: "appliances", label: "Appliances" },
  { value: "jewelry_and_watches", label: "Jewelry & Watches" },
  { value: "luxury_fashion_and_handbags", label: "Luxury Fashion & Handbags" },
  { value: "furniture", label: "Furniture" },
  { value: "tools_and_equipment", label: "Tools & Equipment" },
  { value: "rental_or_property_verification", label: "Property Verification" },
  { value: "other", label: "Other" },
];

// Categories that inherently suggest higher-value transactions
const HIGH_VALUE_CATEGORIES = ["cars_and_motorcycles", "jewelry_and_watches", "luxury_fashion_and_handbags"];
const HIGH_VALUE_PRICE_THRESHOLD = 500;

function getSecureExchangeTrigger(form) {
  const price = Number(form.listing_price);
  if (price >= HIGH_VALUE_PRICE_THRESHOLD) {
    return `💡 Suggested for transactions over $${HIGH_VALUE_PRICE_THRESHOLD}.`;
  }
  if (HIGH_VALUE_CATEGORIES.includes(form.category)) {
    return "💡 Suggested for this item category.";
  }
  return null;
}

export default function NewRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const defaultCategory = urlParams.get("category") || "";

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: defaultCategory,
    listing_url: "",
    listing_platform: "",
    listing_price: "",
    location_city: "",
    location_state: "",
    notes: "",
  });

  const [secureExchange, setSecureExchange] = useState(false);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const trigger = useMemo(() => getSecureExchangeTrigger(form), [form.listing_price, form.category]);
  const showSecureExchange = !!trigger || secureExchange;

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.VettingRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vetting-requests"] });
      navigate("/requests");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      listing_price: form.listing_price ? Number(form.listing_price) : undefined,
      buyer_email: user?.email,
      status: "pending",
      service_type: secureExchange ? "secure_exchange_presence" : "standard_verification",
    });
  };

  return (
    <div className="px-5 pt-4 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/requests">
          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-heading font-bold text-foreground">New Request</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label className="text-[13px] font-medium">Item Title *</Label>
          <Input
            placeholder="e.g. 2019 MacBook Pro 15-inch"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="rounded-xl h-11"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-[13px] font-medium">Platform *</Label>
            <Select value={form.listing_platform} onValueChange={(v) => updateField("listing_platform", v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] font-medium">Category *</Label>
            <Select value={form.category} onValueChange={(v) => updateField("category", v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[13px] font-medium">Listing URL</Label>
          <Input
            placeholder="https://..."
            value={form.listing_url}
            onChange={(e) => updateField("listing_url", e.target.value)}
            className="rounded-xl h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[13px] font-medium">Listed Price ($)</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={form.listing_price}
            onChange={(e) => updateField("listing_price", e.target.value)}
            className="rounded-xl h-11"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-[13px] font-medium">City</Label>
            <Input
              placeholder="City"
              value={form.location_city}
              onChange={(e) => updateField("location_city", e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] font-medium">State</Label>
            <Input
              placeholder="State"
              value={form.location_state}
              onChange={(e) => updateField("location_state", e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[13px] font-medium">Description</Label>
          <Textarea
            placeholder="What should the vetter look for? Any specific concerns?"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="rounded-xl min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[13px] font-medium">Additional Notes</Label>
          <Textarea
            placeholder="Any other details..."
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            className="rounded-xl min-h-[80px]"
          />
        </div>

        {/* Secure Exchange — shown contextually */}
        {showSecureExchange && (
          <SecureExchangeCard
            selected={secureExchange}
            onToggle={() => setSecureExchange((v) => !v)}
            trigger={trigger}
          />
        )}

        {/* Manual opt-in if not auto-triggered */}
        {!showSecureExchange && (
          <button
            type="button"
            onClick={() => setSecureExchange(true)}
            className="w-full text-left p-3 rounded-xl border border-border/60 bg-card hover:border-primary/30 transition-colors"
          >
            <p className="text-[13px] text-muted-foreground">
              Need a safety presence for the exchange?{" "}
              <span className="text-primary font-medium">Learn about Secure Exchange →</span>
            </p>
          </button>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending || !form.title || !form.listing_platform || !form.category}
          className="w-full rounded-xl h-12 text-[15px] font-semibold shadow-sm"
        >
          {mutation.isPending ? "Submitting..." : "Submit Request"}
          {!mutation.isPending && <Send className="w-4 h-4 ml-2" />}
        </Button>
      </form>
    </div>
  );
}