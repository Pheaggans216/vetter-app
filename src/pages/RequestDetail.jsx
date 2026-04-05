import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, MapPin, Clock, CheckCircle2, UserCheck, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  craigslist: "Craigslist",
  ebay: "eBay",
  offerup: "OfferUp",
  other: "Other",
};

const categoryLabels = {
  electronics: "Electronics", vehicles: "Vehicles", furniture: "Furniture",
  collectibles: "Collectibles", jewelry: "Jewelry", appliances: "Appliances",
  sporting_goods: "Sporting Goods", tools: "Tools", clothing: "Clothing", other: "Other",
};

export default function RequestDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = window.location.pathname.split("/").pop();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["vetting-request", id],
    queryFn: () => base44.entities.VettingRequest.filter({ id }),
  });

  const request = requests[0];

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
                {platformLabels[request.listing_platform]}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">Category</p>
              <p className="text-[13px] font-medium text-foreground">
                {categoryLabels[request.category]}
              </p>
            </div>
            {request.listing_price && (
              <div>
                <p className="text-[11px] text-muted-foreground mb-0.5">Price</p>
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
      </div>
    </div>
  );
}