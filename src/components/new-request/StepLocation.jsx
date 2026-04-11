import { MapPin, ArrowRight } from "lucide-react";

export default function StepLocation({ form, updateForm, onNext }) {
  const canProceed = form.location_city.trim().length > 0;

  return (
    <div className="px-5 pt-8 pb-10 flex flex-col min-h-[calc(100vh-72px)]">
      <div className="flex justify-center mb-7">
        <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center">
          <MapPin className="w-7 h-7 text-accent" />
        </div>
      </div>

      <div className="mb-8 text-center">
        <h2 className="font-heading font-bold text-foreground text-[26px] leading-tight mb-2">
          Where is the item?
        </h2>
        <p className="text-muted-foreground text-[14px]">
          We'll match you with a Vetter in that area.
        </p>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-[13px] font-semibold text-foreground mb-1.5">City *</label>
          <input
            type="text"
            placeholder="e.g. San Francisco"
            value={form.location_city}
            onChange={(e) => updateForm({ location_city: e.target.value })}
            className="w-full h-12 px-4 rounded-xl border border-border bg-card text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-semibold text-foreground mb-1.5">State</label>
            <input
              type="text"
              placeholder="CA"
              value={form.location_state}
              onChange={(e) => updateForm({ location_state: e.target.value })}
              className="w-full h-12 px-4 rounded-xl border border-border bg-card text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-foreground mb-1.5">Zip Code</label>
            <input
              type="text"
              placeholder="94102"
              value={form.location_zip}
              onChange={(e) => updateForm({ location_zip: e.target.value })}
              className="w-full h-12 px-4 rounded-xl border border-border bg-card text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition"
            />
          </div>
        </div>

        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/15">
          <p className="text-[12px] text-primary font-medium">
            📍 We cover hundreds of cities. Most requests are matched within 1–2 hours.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="w-full h-13 rounded-xl bg-primary text-primary-foreground text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-sm disabled:opacity-40 disabled:pointer-events-none"
        >
          Find a Vetter
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}