import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

export default function ChecklistEditor({ items, checkedIds, onChange }) {
  const toggle = (id) => {
    const next = checkedIds.includes(id)
      ? checkedIds.filter((x) => x !== id)
      : [...checkedIds, id];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const checked = checkedIds.includes(item.id);
        return (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
              checked
                ? "border-accent/30 bg-accent/5"
                : "border-border/60 bg-card hover:border-border"
            )}
          >
            {checked ? (
              <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            <span className={cn("text-[13px]", checked ? "text-foreground font-medium" : "text-muted-foreground")}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}