import { useState } from "react";
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

const platforms = [
  { value: "facebook_marketplace", label: "Facebook Marketplace" },
  { value: "craigslist", label: "Craigslist" },
  { value: "ebay", label: "eBay" },
  { value: "offerup", label: "OfferUp" },
  { value: "other", label: "Other" },
];

const categories = [
  { value: "electronics", label: "Electronics" },
  { value: "vehicles", label: "Vehicles" },
  { value: "furniture", label: "Furniture" },
  { value: "collectibles", label: "Collectibles" },
  { value: "jewelry", label: "Jewelry" },
  { value: "appliances", label: "Appliances" },
  { value: "sporting_goods", label: "Sporting Goods" },
  { value: "tools", label: "Tools" },
  { value: "clothing", label: "Clothing" },
  { value: "other", label: "Other" },
];

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
    });
  };

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

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
            <Select value={form.listing_platform} onValueChange={(v) => updateField("listing_platform", v)} required>
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
            <Select value={form.category} onValueChange={(v) => updateField("category", v)} required>
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