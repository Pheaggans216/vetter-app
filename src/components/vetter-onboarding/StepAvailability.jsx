import { cn } from "@/lib/utils";

const DAYS = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
];

export default function StepAvailability({ profile, update }) {
  const toggleDay = (key) => {
    update({
      availability: {
        ...profile.availability,
        [key]: !profile.availability?.[key],
      },
    });
  };

  return (
    <div>
      <h2 className="text-[22px] font-heading font-bold text-foreground mb-1">Your availability</h2>
      <p className="text-muted-foreground text-[14px] mb-6">
        Select the days you're generally available to conduct inspections. You can update this anytime.
      </p>
      <div className="grid grid-cols-7 gap-1.5 mb-6">
        {DAYS.map((d) => {
          const on = profile.availability?.[d.key];
          return (
            <button
              key={d.key}
              onClick={() => toggleDay(d.key)}
              className={cn(
                "flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all",
                on ? "border-primary bg-primary/5" : "border-border/60 bg-card"
              )}
            >
              <span className={cn("text-[11px] font-semibold", on ? "text-primary" : "text-muted-foreground")}>
                {d.label}
              </span>
              <div className={cn("w-2 h-2 rounded-full", on ? "bg-primary" : "bg-muted")} />
            </button>
          );
        })}
      </div>
      <div className="p-4 bg-card rounded-2xl border border-border/60">
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          💡 Vetters with broader availability get matched with more requests and earn more.
        </p>
      </div>
    </div>
  );
}