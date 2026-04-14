import { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Paperclip, X, FileText, Loader2, ImageIcon, Video } from "lucide-react";
import { cn } from "@/lib/utils";

function fileIcon(url) {
  if (/\.(mp4|mov|avi|webm)$/i.test(url)) return Video;
  if (/\.(pdf)$/i.test(url)) return FileText;
  return ImageIcon;
}

function fileName(url) {
  try {
    return decodeURIComponent(url.split("/").pop().split("?")[0]);
  } catch {
    return "File";
  }
}

export default function AttachmentsUploader({ value = [], onChange }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const uploaded = await Promise.all(
      files.map((f) => base44.integrations.Core.UploadFile({ file: f }).then((r) => r.file_url))
    );
    onChange([...value, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  };

  const remove = (url) => onChange(value.filter((u) => u !== url));

  return (
    <div>
      <label className="block text-[13px] font-semibold text-foreground mb-1.5">
        Attachments <span className="text-muted-foreground font-normal">(optional)</span>
      </label>
      <p className="text-[11px] text-muted-foreground mb-2">
        Upload photos, videos, or PDFs to help your Vetter prepare.
      </p>

      {/* Upload button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "w-full h-11 rounded-xl border-2 border-dashed border-border bg-card flex items-center justify-center gap-2 text-[13px] font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors",
          uploading && "opacity-60 pointer-events-none"
        )}
      >
        {uploading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
        ) : (
          <><Paperclip className="w-4 h-4" /> Attach files</>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf"
        className="hidden"
        onChange={handleFiles}
      />

      {/* Preview list */}
      {value.length > 0 && (
        <div className="mt-3 space-y-2">
          {value.map((url) => {
            const Icon = fileIcon(url);
            const isImage = /\.(jpe?g|png|gif|webp|heic)$/i.test(url) || url.includes("image");
            return (
              <div key={url} className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-xl border border-border/60">
                {isImage ? (
                  <img src={url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border/40" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-card border border-border/60 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <span className="flex-1 text-[12px] text-foreground truncate">{fileName(url)}</span>
                <button
                  type="button"
                  onClick={() => remove(url)}
                  className="w-6 h-6 rounded-full hover:bg-destructive/10 flex items-center justify-center shrink-0 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}