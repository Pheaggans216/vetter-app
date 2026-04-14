import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ExternalLink, FileText } from "lucide-react";

function isFileLink(content) {
  return content?.includes("📎") && content?.includes("http");
}

export default function ChatBubble({ message, isOwn, showAvatar, senderName, senderAvatar }) {
  const isImage = message.message_type === "image";
  const hasFileLink = !isImage && isFileLink(message.content);

  return (
    <div className={cn("flex gap-2 mb-1", isOwn ? "justify-end" : "justify-start")}>
      {/* Avatar for other person */}
      {!isOwn && (
        <div className={cn("w-7 h-7 rounded-full shrink-0 mt-auto overflow-hidden", showAvatar ? "opacity-100" : "opacity-0")}>
          {senderAvatar ? (
            <img src={senderAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-[11px] font-bold">
                {senderName?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
          )}
        </div>
      )}

      <div className={cn("max-w-[72%] flex flex-col gap-0.5", isOwn ? "items-end" : "items-start")}>
        {/* Sender name for grouped messages */}
        {!isOwn && showAvatar && senderName && (
          <span className="text-[11px] text-muted-foreground font-medium px-1">{senderName}</span>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "relative rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed",
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card border border-border/60 text-foreground rounded-bl-sm",
            isImage && "p-1.5 bg-transparent border-0"
          )}
        >
          {isImage ? (
            <a href={message.content} target="_blank" rel="noopener noreferrer">
              <img
                src={message.content}
                alt="Shared image"
                className="max-w-[220px] max-h-[260px] rounded-xl object-cover border border-border/40"
              />
            </a>
          ) : hasFileLink ? (
            <FileMessageContent content={message.content} isOwn={isOwn} />
          ) : (
            <span className="whitespace-pre-wrap break-words">{message.content}</span>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground px-1">
          {message.created_date ? format(new Date(message.created_date), "h:mm a") : ""}
        </span>
      </div>

      {/* Spacer for own messages */}
      {isOwn && <div className="w-7 shrink-0" />}
    </div>
  );
}

function FileMessageContent({ content, isOwn }) {
  // Split on the file link part
  const parts = content.split(/📎 (.+?): (https?:\/\/\S+)/);
  if (parts.length < 3) {
    return <span className="whitespace-pre-wrap break-words">{content}</span>;
  }
  const [before, filename, url] = parts;
  return (
    <div className="space-y-1.5">
      {before?.trim() && <p className="whitespace-pre-wrap break-words">{before.trim()}</p>}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-colors",
          isOwn
            ? "bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20"
            : "bg-muted/50 border-border/60 hover:border-primary/30"
        )}
      >
        <FileText className="w-4 h-4 shrink-0" />
        <span className="text-[12px] font-medium truncate flex-1">{filename}</span>
        <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60" />
      </a>
    </div>
  );
}