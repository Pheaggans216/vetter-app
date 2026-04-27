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
import { ArrowLeft, Plus, X, Upload, Tag, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

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

export default function NewListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    price: "",
    description: "",
    photos: [],
    location_city: "",
    location_state: "",
    location_zip: "",
    meetup_notes: "",
    preferred_availability: "",
    seller_splits_cost: false,
    seller_pays_upfront: false,
  });

  const update = (patch) => setForm(prev => ({ ...prev, ...patch }));

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Listing.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      toast({ title: "Listing created!", description: "Your item is now live on the marketplace." });
      navigate("/listings");
    },
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      update({ photos: [...form.photos, file_url] });
    }
    setUploading(false);
  };

  const removePhoto = (i) => update({ photos: form.photos.filter((_, idx) => idx !== i) });

  const handleSubmit = () => {
    if (!form.title || !form.category || !form.price) {
      toast({ title: "Missing required fields", description: "Please fill in title, category, and price.", variant: "destructive" });
      return;
    }
    mutation.mutate({
      ...form,
      price: Number(form.price),
      seller_email: user.email,
      vetting_status: "not_vetted",
      active: true,
    });
  };

  const canSubmit = form.title && form.category && form.price;

  return (
    <div className="px-5 pt-4 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/listings">
          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[17px] font-heading font-bold text-foreground">List an Item</h1>
          <p className="text-[12px] text-muted-foreground">Get it verified. Sell with confidence.</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Basic Info */}
        <Section title="Item Details">
          <div className="space-y-3">
            <div>
              <Label className="text-[13px] mb-1.5 block">Title *</Label>
              <Input value={form.title} onChange={e => update({ title: e.target.value })} placeholder="e.g. 2019 Honda Civic" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-[13px] mb-1.5 block">Category *</Label>
              <Select value={form.category} onValueChange={v => update({ category: v })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[13px] mb-1.5 block">Price *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input type="number" value={form.price} onChange={e => update({ price: e.target.value })} placeholder="0" className="rounded-xl pl-7" />
              </div>
            </div>
            <div>
              <Label className="text-[13px] mb-1.5 block">Description</Label>
              <Textarea value={form.description} onChange={e => update({ description: e.target.value })} placeholder="Describe the item condition, history, included accessories..." className="rounded-xl min-h-[90px]" />
            </div>
          </div>
        </Section>

        {/* Photos */}
        <Section title="Photos">
          <div className="grid grid-cols-4 gap-2">
            {form.photos.map((url, i) => (
              <div key={i} className="relative aspect-square">
                <img src={url} alt="" className="w-full h-full object-cover rounded-xl border border-border/60" />
                <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              {uploading ? <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" /> : <><Upload className="w-5 h-5 text-muted-foreground mb-1" /><span className="text-[10px] text-muted-foreground">Add Photo</span></>}
            </label>
          </div>
        </Section>

        {/* Location */}
        <Section title="Location & Meetup">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[12px] mb-1 block">City</Label>
                <Input value={form.location_city} onChange={e => update({ location_city: e.target.value })} placeholder="City" className="rounded-xl" />
              </div>
              <div>
                <Label className="text-[12px] mb-1 block">State</Label>
                <Input value={form.location_state} onChange={e => update({ location_state: e.target.value })} placeholder="State" className="rounded-xl" />
              </div>
            </div>
            <div>
              <Label className="text-[12px] mb-1 block">ZIP Code</Label>
              <Input value={form.location_zip} onChange={e => update({ location_zip: e.target.value })} placeholder="ZIP" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-[12px] mb-1 block">Meetup Notes</Label>
              <Input value={form.meetup_notes} onChange={e => update({ meetup_notes: e.target.value })} placeholder="e.g. Public parking lot, Starbucks on Main St" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-[12px] mb-1 block">Preferred Availability</Label>
              <Input value={form.preferred_availability} onChange={e => update({ preferred_availability: e.target.value })} placeholder="e.g. Weekdays after 5pm, Saturday mornings" className="rounded-xl" />
            </div>
          </div>
        </Section>

        {/* Vetter Cost Options */}
        <Section title="Vetter Cost Options">
          <p className="text-[12px] text-muted-foreground mb-3">Choose how the verification cost is handled.</p>
          <div className="space-y-2.5">
            <ToggleOption
              icon={Tag}
              label="I'll split the Vetter fee"
              description="Buyer and seller each pay half the verification cost."
              active={form.seller_splits_cost && !form.seller_pays_upfront}
              onClick={() => update({ seller_splits_cost: !form.seller_splits_cost, seller_pays_upfront: false })}
              color="accent"
            />
            <ToggleOption
              icon={ShieldCheck}
              label="Vetted Included — I'll pay upfront"
              description="I'll cover the full vetting cost to build buyer trust."
              active={form.seller_pays_upfront}
              onClick={() => update({ seller_pays_upfront: !form.seller_pays_upfront, seller_splits_cost: false })}
              color="primary"
            />
          </div>
          {!form.seller_splits_cost && !form.seller_pays_upfront && (
            <p className="text-[11px] text-muted-foreground mt-2.5 px-1">Default: buyer pays the full vetting fee.</p>
          )}
        </Section>

        <Button onClick={handleSubmit} disabled={!canSubmit || mutation.isPending} size="lg" className="w-full rounded-xl h-12 text-[15px] font-semibold">
          {mutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Listing...</> : <><CheckCircle2 className="w-4 h-4 mr-2" />Publish Listing</>}
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[13px] font-heading font-bold text-foreground mb-3">{title}</p>
      <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">{children}</div>
    </div>
  );
}

function ToggleOption({ icon: Icon, label, description, active, onClick, color }) {
  return (
    <button onClick={onClick} className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
      active
        ? color === "primary" ? "border-primary bg-primary/5" : "border-accent bg-accent/5"
        : "border-border/60 bg-background"
    }`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
        active ? color === "primary" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className={`text-[13px] font-semibold ${active ? color === "primary" ? "text-primary" : "text-accent" : "text-foreground"}`}>{label}</p>
        <p className="text-[12px] text-muted-foreground mt-0.5">{description}</p>
      </div>
    </button>
  );
}