import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

const RADIUS_OPTIONS = [10, 15, 25, 40, 60];

export default function StepLocation({ profile, update }) {
  return (
    <div>
      <h2 className="text-[22px] font-heading font-bold text-foreground mb-1">Your service area</h2>
      <p className="text-muted-foreground text-[14px] mb-6">
        Buyers nearby will be able to find and book you for in-person inspections.
      </p>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[13px] font-medium">City</Label>
          <Input
            placeholder="City"
            value={profile.city}
            onChange={(e) => update({ city: e.target.value })}
            className="rounded-xl h-11"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-[13px] font-medium">State</Label>
            <Input
              placeholder="TX"
              value={profile.state}
              onChange={(e) => update({ state: e.target.value })}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] font-medium">ZIP Code</Label>
            <Input
              placeholder="78701"
              value={profile.zip_code}
              onChange={(e) => update({ zip_code: e.target.value })}
              className="rounded-xl h-11"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-[13px] font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Service Radius
          </Label>
          <div className="flex gap-2 flex-wrap">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => update({ service_radius_miles: r })}
                className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all border-2 ${
                  profile.service_radius_miles === r
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/60 bg-card text-foreground"
                }`}
              >
                {r} mi
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}