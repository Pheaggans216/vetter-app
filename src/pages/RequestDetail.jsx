import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ExternalLink, MapPin, Clock, CheckCircle2,
  UserCheck, Calendar, DollarSign, ShieldCheck
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import MatchingPanel from "@/components/matching/MatchingPanel";

const statusConfig = {
  pending: { label: "Pending", icon: Clock, className: "bg-muted text-muted-foreground" },
  matched: { label: "Matched", icon: UserCheck, className: "bg-primary/10 text-primary" },
  scheduled: { label: "Scheduled", icon: Calendar, className: "bg-accent/15 text-accent" },
  in_progress: { label: "In Progress", icon: Clock, className: "bg-chart-1/10 text-chart-1" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-chart-3/15 text-chart-3" },
  cancelled: { label: "Cancelled", icon: Clock, className: "bg-destructive/10 text-destructive" },
};

const platformLabels = {
  facebook_marketplace: "Facebook Marketplace",
  craigslist: "Craigslist", ebay: "eBay", offerup: "OfferUp", other: "Other",
};

const categoryLabels = {
  cars_and_motorcycles: "Cars & Motorcycles", electronics: "Electronics", appliances: "Appliances",
  jewelry_and_watches: "Jewelry & Watches", luxury_fashion_and_handbags: "Luxury Fashion",
  furniture: "Furniture", tools_and_equipment: "Tools & Equipment",
  rental_or_property_verification: "Property Verification", other: "Other",
};

const serviceLabels = {
  standard_verification: "Standard Verification",
  specialist_vetting: "Specialist Vetting",
  secure_exchange_presence: "Secure Exchange Presence",
};

export default function RequestDetail() {
  const id = window.location.pathname.split("/").pop();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["vetting-request", id],
    queryFn: () => base44.entities.VettingRequest.filter({ id }),
  });

  const request = requests[0];

  // Fetch assigned vetter profile if matched
  const { data: vetterProfiles = [] } = useQuery({
    queryKey: ["vetter-profile-match", request?.vetter_email],
    queryFn: () => base44.entities.VetterProfile.filter({ user_email: request.vetter_email }),
    enabled: !!request?.vetter_email,
  });
  const assignedVetter = vetterProfiles[0];

  if (isLoading) {
    return (
      <div className="px-5 pt-4">
        <div className="h-8 w-32 bg-muted rounded-xl animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-card rounded-2xl border border-border/60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="px-5 pt-4 text-center py-20">
        <p className="text-muted-foreground">Request not found.</p>
        <Link to="/requests">
          <Button variant="outline" className="mt-4 rounded-xl">Back to Requests</Button>
        </Link>
      </div>
    );
  }

  const status = statusConfig[request.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isBuyer = user?.email === request.buyer_email;
  const showMatching = isBuyer && request.status === "pending";

  return (
    <div className="px-5 pt-4 pb-8">
      <div className="flex items-center gap-3 mb-5">
        <Link to="/requests">
          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-heading font-bold text-foreground truncate flex-1">
          {request.title}
        </h1>
      </div>

      <div className="space-y-4">
        {/* Status Card */}
        <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary" className={cn("text-[12px] font-medium gap-1.5", status.className)}>
              <StatusIcon className="w-3.5 h-3.5" />
              {status.label}
            </Badge>
            <span className="text-muted-foreground text-[12px]">
              {format(new Date(request.created_date), "MMM d, yyyy")}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">Platform</p>
              <p className="text-[13px] font-medium text-foreground">
                {platformLabels[request.listing_platform] || request.listing_platform}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">Category</p>
              <p className="text-[13px] font-medium text-foreground">
                {categoryLabels[request.category] || request.category}
              </p>
            </div>
            {request.service_type && (
              <div>
                <p className="text-[11px] text-muted-foreground mb-0.5">Service</p>
                <p className="text-[13px] font-medium text-foreground">
                  {serviceLabels[request.service_type]}
                </p>
              </div>
            )}
            {request.listing_price && (
              <div>
                <p className="text-[11px] text-muted-foreground mb-0.5">Item Price</p>
                <p className="text-[13px] font-semibold text-foreground flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  {request.listing_price.toLocaleString()}
                </p>
              </div>
            )}
            {(request.location_city || request.location_state) && (
              <div>
                <p className="text-[11px] text-muted-foreground mb-0.5">Location</p>
                <p className="text-[13px] font-medium text-foreground flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {[request.location_city, request.location_state].filter(Boolean).join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Assigned Vetter */}
        {assignedVetter && request.status !== "pending" && (
          <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">Your Vetter</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                {assignedVetter.avatar_url ? (
                  <img src={assignedVetter.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary font-bold">{assignedVetter.display_name?.[0]}</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground text-[14px]">{assignedVetter.display_name}</p>
                <p className="text-muted-foreground text-[12px]">
                  {[assignedVetter.city, assignedVetter.state].filter(Boolean).join(", ")}
                  {assignedVetter.rating && ` · ⭐ ${assignedVetter.rating.toFixed(1)}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {request.description && (
          <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
            <p className="text-[13px] font-semibold text-foreground mb-2">Description</p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{request.description}</p>
          </div>
        )}

        {/* Listing Link */}
        {request.listing_url && (
          <a href={request.listing_url} target="_blank" rel="noopener noreferrer">
            <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm flex items-center justify-between hover:border-primary/20 transition-colors">
              <span className="text-[13px] font-medium text-primary">View Original Listing</span>
              <ExternalLink className="w-4 h-4 text-primary" />
            </div>
          </a>
        )}

        {/* Notes */}
        {request.notes && (
          <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
            <p className="text-[13px] font-semibold text-foreground mb-2">Notes</p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{request.notes}</p>
          </div>
        )}

        {/* View Report — shown when completed */}
        {request.status === "completed" && (
          <Link to={`/requests/${request.id}/report`}>
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex items-center justify-between hover:bg-primary/10 transition-colors">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-[14px] font-heading font-bold text-foreground">Inspection Report Ready</p>
                  <p className="text-[12px] text-muted-foreground">Tap to view the full report</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-primary" />
            </div>
          </Link>
        )}

        {/* Matching Panel — shown to buyer when request is still pending */}
        {showMatching && (
          <div className="pt-2">
            <MatchingPanel
              request={request}
              onMatched={() => queryClient.invalidateQueries({ queryKey: ["vetting-request", id] })}
            />
          </div>
        )}
      </div>
    </div>
  );
}