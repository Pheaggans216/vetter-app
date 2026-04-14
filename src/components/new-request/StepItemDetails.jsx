import { Link2, ArrowRight } from "lucide-react";
import AttachmentsUploader from "./AttachmentsUploader";

export default function StepItemDetails({ form, updateForm, onNext }) {
  const canProceed = form.title.trim().length > 0;

  return (
    <div className="px-5 pt-8 pb-10 flex flex-col min-h-[calc(100vh-72px)]">
      <div className="mb-8">
        <h2 className="font-heading font-bold text-foreground text-[26px] leading-tight mb-2">
          What are you buying?
        </h2>
        <p className="text-muted-foreground text-[14px]">
          Tell us about the item so your Vetter can prepare.
        </p>
      </div>

      <div className="space-y-4 flex-1">
        {/* Item Name */}
        <div>
          <label className="block text-[13px] font-semibold text-foreground mb-1.5">Item Name *</label>
          <input
            type="text"
            placeholder="e.g. 2019 MacBook Pro 15-inch"
            value={form.title}
            onChange={(e) => updateForm({ title: e.target.value })}
            className="w-full h-12 px-4 rounded-xl border border-border bg-card text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition"
          />
        </div>

        {/* Listing URL */}
        <div>
          <label className="block text-[13px] font-semibold text-foreground mb-1.5">
            Listing Link <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <div className="relative">
            <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="url"
              placeholder="https://facebook.com/marketplace/..."
              value={form.listing_url}
              onChange={(e) => updateForm({ listing_url: e.target.value })}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-card text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition"
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 pl-1">
            Paste the listing link so your Vetter can review it.
          </p>
        </div>

        {/* Price */}
        <div>
          <label className="block text-[13px] font-semibold text-foreground mb-1.5">
            Listed Price <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[14px] font-medium">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={form.listing_price}
              onChange={(e) => updateForm({ listing_price: e.target.value })}
              className="w-full h-12 pl-8 pr-4 rounded-xl border border-border bg-card text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[13px] font-semibold text-foreground mb-1.5">
            Notes <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            placeholder="Any specific concerns or things to check?"
            value={form.description}
            onChange={(e) => updateForm({ description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition resize-none"
          />
        </div>

        {/* Attachments */}
        <AttachmentsUploader
          value={form.uploaded_screenshots || []}
          onChange={(urls) => updateForm({ uploaded_screenshots: urls })}
        />
      </div>

      <div className="mt-8">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="w-full h-13 rounded-xl bg-primary text-primary-foreground text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-sm disabled:opacity-40 disabled:pointer-events-none"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}