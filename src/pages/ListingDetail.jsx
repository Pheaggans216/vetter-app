import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, ShieldCheck, MessageCircle, AlertTriangle, CheckCircle2, Clock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentMode } from "@/lib/roleState";


const CATEGORY_LABELS = {
  cars_and_motorcycles: "Cars & Motorcycles", electronics: "Electronics", appliances: "Appliances",
  jewelry_and_watches: "Jewelry & Watches", luxury_fashion_and_handbags: "Luxury Fashion",
  furniture: "Furniture", tools_and_equipment: "Tools & Equipment",
  rental_or_property_verification: "Property Verification", other: "Other",
};

const VETTING_BADGE = {
  not_vetted: { label: "Not Vetted Yet", icon: Clock, className: "bg-muted text-muted-foreground border-border" },
  vetter_requested: { label: "Vetter Requested", icon: Clock, className: "bg-amber-50 text-amber-700 border-amber-200" },
  awaiting_payment: { label: "Awaiting Payment", icon: Clock, className: "bg-amber-50 text-amber-700 border-amber-200" },
  payment_secured: { label: "Payment Secured", icon: ShieldCheck, className: "bg-blue-50 text-blue-700 border-blue-200" },
  vetter_assigned: { label: "Vetter Assigned", icon: ShieldCheck, className: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress: { label: "Verification In Progress", icon: ShieldCheck, className: "bg-primary/10 text-primary border-primary/20" },
  vetted: { label: "✓ Vetted", icon: CheckCircle2, className: "bg-green-50 text-green-700 border-green-200" },
  vetted_with_caution: { label: "⚠ Vetted With Caution", icon: AlertTriangle, className: "bg-amber-50 text-amber-700 border-amber-200" },
  failed_verification: { label: "✗ Failed Verification", icon: AlertTriangle, className: "bg-red-50 text-red-700 border-red-200" },
};

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mode = getCurrentMode(user);
  const [activePhoto, setActivePhoto] = useState(0);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => base44.entities.Listing.filter({ id }),
    enabled: !!id,
  });
  const listing = listings[0];

  const { data: jobs = [] } = useQuery({
    queryKey: ["listing-job", id],
    queryFn: () => base44.entities.VetterJob.filter({ listing_id: id }),
    enabled: !!id,
  });
  const activeJob = jobs.find(j => !["cancelled"].includes(j.status));

  const isSeller = listing?.seller_email === user?.email;
  const isBuyer = mode === "buyer";

  const messageMutation = useMutation({
    mutationFn: async () => {
      const existing = await base44.entities.Conversation.filter({ request_id: id });
      const convo = existing.find(c => c.participants?.includes(user.email) && c.participants?.includes(listing.seller_email));
      if (convo) return convo;
      return base44.entities.Conversation.create({ request_id: id, participants: [user.email, listing.seller_email], unread_count: 0 });
    },
    onSuccess: (convo) => navigate(`/messages/${convo.id}`),
  });

  if (isLoading) return (
    <div className="px-5 pt-4 space-y-4">
      <div className="h-48 bg-card rounded-2xl animate-pulse" />
      <div className="h-24 bg-card rounded-2xl animate-pulse" />
    </div>
  );

  if (!listing) return (
    <div className="px-5 pt-10 text-center">
      <p className="text-muted-foreground">Listing not found.</p>
      <Link to="/listings"><Button variant="outline" className="mt-4 rounded-xl">Back</Button></Link>
    </div>
  );

  const badge = VETTING_BADGE[listing.vetting_status] || VETTING_BADGE.not_vetted;
  const BadgeIcon = badge.icon;

  return (
    <div className="pb-10">
      {/* Photo gallery */}
      <div className="relative">
        {listing.photos?.length > 0 ? (
          <>
            <div className="h-56 overflow-hidden">
              <img src={listing.photos[activePhoto]} alt={listing.title} className="w-full h-full object-cover" />
            </div>
            {listing.photos.length > 1 && (
              <div className="flex gap-1.5 px-4 mt-2 overflow-x-auto scrollbar-none">
                {listing.photos.map((url, i) => (
                  <button key={i} onClick={() => setActivePhoto(i)}
                    className={cn("w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all",
                      i === activePhoto ? "border-primary" : "border-border/40")}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="h-48 bg-muted/40 flex items-center justify-center">
            <ShieldCheck className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        <Link to="/listings" className="absolute top-4 left-4">
          <button className="w-9 h-9 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </Link>
      </div>

      <div className="px-5 pt-4 space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-[20px] font-heading font-bold text-foreground leading-tight">{listing.title}</h1>
            <span className="text-[22px] font-bold text-accent shrink-0">${listing.price?.toLocaleString()}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-muted-foreground">{CATEGORY_LABELS[listing.category]}</span>
            {(listing.location_city || listing.location_state) && (
              <span className="flex items-center gap-0.5 text-[12px] text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {[listing.location_city, listing.location_state].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold", badge.className)}>
              <BadgeIcon className="w-3 h-3" />{badge.label}
            </span>
            {listing.seller_splits_cost && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold bg-accent/10 text-accent border-accent/20">
                <Tag className="w-3 h-3" /> Splits Vetter Fee
              </span>
            )}
            {listing.seller_pays_upfront && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold bg-primary/10 text-primary border-primary/20">
                <ShieldCheck className="w-3 h-3" /> Vetted Included
              </span>
            )}
          </div>
        </div>

        {/* Trust message for buyers */}
        {isBuyer && !["vetted", "vetted_with_caution", "failed_verification"].includes(listing.vetting_status) && (
          <div className="p-3.5 bg-primary/5 rounded-2xl border border-primary/15">
            <p className="text-[13px] font-semibold text-primary mb-0.5">Verify before you pay 🛡</p>
            <p className="text-[12px] text-muted-foreground">Payment is held securely until verification is complete. Vetters reduce scams and unsafe transactions.</p>
          </div>
        )}

        {/* Description */}
        {listing.description && (
          <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
            <p className="text-[13px] font-semibold text-foreground mb-2">Description</p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{listing.description}</p>
          </div>
        )}

        {/* Meetup & availability */}
        {(listing.meetup_notes || listing.preferred_availability) && (
          <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm space-y-2">
            {listing.meetup_notes && (
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Meetup Location</p>
                <p className="text-[13px] text-foreground">{listing.meetup_notes}</p>
              </div>
            )}
            {listing.preferred_availability && (
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Availability</p>
                <p className="text-[13px] text-foreground">{listing.preferred_availability}</p>
              </div>
            )}
          </div>
        )}

        {/* Active job status */}
        {activeJob && (
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Vetting Status</p>
            <p className="text-[14px] font-heading font-bold text-foreground">{activeJob.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</p>
            {activeJob.status === "report_ready" && (
              <Link to={`/listings/${id}/report`}>
                <Button size="sm" className="mt-2 rounded-xl text-[12px] gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> View Report
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Buyer CTAs */}
        {isBuyer && !isSeller && (
          <div className="space-y-2">
            {!activeJob && (
              <Link to={`/listings/${id}/vet`}>
                <Button size="lg" className="w-full rounded-xl h-12 text-[15px] font-semibold gap-2">
                  <ShieldCheck className="w-5 h-5" /> Get It Vetted
                </Button>
              </Link>
            )}
            <Button
              variant="outline" size="lg"
              className="w-full rounded-xl h-11 text-[14px] gap-2"
              onClick={() => messageMutation.mutate()}
              disabled={messageMutation.isPending}
            >
              <MessageCircle className="w-4 h-4" /> Message Seller
            </Button>
          </div>
        )}

        {/* Seller management */}
        {isSeller && (
          <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Your Listing</p>
            <p className="text-[13px] text-foreground">You own this listing. Buyers can request vetting to verify it before purchasing.</p>
          </div>
        )}
      </div>


    </div>
  );
}