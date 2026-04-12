import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ChatBubble({ message, isOwn }) {
  return (
    <div className={cn("flex items-end gap-2", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && (
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mb-1">
          <span className="text-primary font-bold text-[10px]">
            {message.sender_email?.[0]?.toUpperCase()}
          </span>
        </div>
      )}
      <div className={cn("max-w-[75%]")}>
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed",
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card border border-border/60 text-foreground rounded-bl-sm"
          )}
        >
          {message.content}
        </div>
        <p className={cn("text-[10px] text-muted-foreground mt-1 px-1", isOwn ? "text-right" : "text-left")}>
          {message.created_date ? format(new Date(message.created_date), "h:mm a") : ""}
        </p>
      </div>
    </div>
  );
}