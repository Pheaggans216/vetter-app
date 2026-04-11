import { CheckCircle2, Clock, ArrowRight } from "lucide-react";

const checklist = [
  "Confirm item exists in person",
  "Inspect condition and authenticity",
  "Verify seller legitimacy",
  "Provide photos and written report",
];

export default function StepSummary({ form, onSubmit, submitting }) {
  return (
    <div className="px-5 pt-8 pb-10 flex flex-col min-h-[calc(100vh-72px)]">
      <div className="mb-8">
        <h2 className="font-heading font-bold text-foreground text-[26px] leading-tight mb-2">
          What your Vetter will do:
        </h2>
        <p className="text-muted-foreground text-[14px]">
          Your local expert will personally verify every detail.
        </p>
      </div>

      {/* Checklist */}
      <div className="space-y-3 mb-6">
        {checklist.map((item, i) => (
          <div key={i} className="flex items-center gap-3.5 p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-accent" />
            </div>
            <span className="text-[14px] font-medium text-foreground">{item}</span>
          </div>
        ))}
      </div>

      {/* Turnaround */}
      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/15 mb-8">
        <Clock className="w-5 h-5 text-primary shrink-0" />
        <div>
          <p className="text-[13px] font-semibold text-foreground">Estimated turnaround</p>
          <p className="text-[12px] text-muted-foreground">Within 24 hours of submission</p>
        </div>
      </div>

      {/* Request summary */}
      <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm mb-8">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">Your Request</p>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[13px] text-muted-foreground">Item</span>
            <span className="text-[13px] font-medium text-foreground truncate ml-4 max-w-[180px]">{form.title || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[13px] text-muted-foreground">Location</span>
            <span className="text-[13px] font-medium text-foreground">
              {[form.location_city, form.location_state].filter(Boolean).join(", ") || "—"}
            </span>
          </div>
          {form.listing_price && (
            <div className="flex justify-between">
              <span className="text-[13px] text-muted-foreground">Price</span>
              <span className="text-[13px] font-medium text-foreground">${Number(form.listing_price).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="w-full h-13 rounded-xl bg-primary text-primary-foreground text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Request Verification"}
          {!submitting && <ArrowRight className="w-4 h-4" />}
        </button>
        <p className="text-center text-[11px] text-muted-foreground mt-3">No payment required to submit</p>
      </div>
    </div>
  );
}