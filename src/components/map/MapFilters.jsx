import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";

const RADIUS_OPTIONS = [5, 10, 25, 50];
const SORT_OPTIONS = [
  { value: "distance", label: "Distance" },
  { value: "rating", label: "Rating" },
  { value: "price", label: "Price" },
];
const RATING_OPTIONS = [
  { value: "any", label: "Any rating" },
  { value: "4", label: "4+ stars" },
  { value: "4.5", label: "4.5+ stars" },
];
const SERVICE_OPTIONS = [
  { value: "any", label: "Any service" },
  { value: "standard_verification", label: "Standard" },
  { value: "specialist_vetting", label: "Specialist" },
  { value: "secure_exchange_presence", label: "Secure Exchange" },
];

export default function MapFilters({ radius, onRadius, sort, onSort, minRating, onMinRating, serviceType, onServiceType }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <div className="shrink-0 w-7 h-7 rounded-lg bg-card border border-border/60 flex items-center justify-center">
        <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
      </div>

      {/* Radius */}
      <div className="shrink-0 flex items-center gap-1">
        {RADIUS_OPTIONS.map(r => (
          <button
            key={r}
            onClick={() => onRadius(r)}
            className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all ${
              radius === r
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {r} mi
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-border shrink-0" />

      {/* Sort */}
      <div className="shrink-0">
        <Select value={sort} onValueChange={onSort}>
          <SelectTrigger className="h-7 text-[12px] rounded-lg border-border/60 bg-card px-2.5 w-auto gap-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Rating */}
      <div className="shrink-0">
        <Select value={minRating} onValueChange={onMinRating}>
          <SelectTrigger className="h-7 text-[12px] rounded-lg border-border/60 bg-card px-2.5 w-auto gap-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RATING_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Service */}
      <div className="shrink-0">
        <Select value={serviceType} onValueChange={onServiceType}>
          <SelectTrigger className="h-7 text-[12px] rounded-lg border-border/60 bg-card px-2.5 w-auto gap-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}