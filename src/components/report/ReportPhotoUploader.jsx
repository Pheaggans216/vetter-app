import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, Loader2, X } from "lucide-react";

export default function ReportPhotoUploader({ photos, onAdd, onRemove }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onAdd(file_url);
    }
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {photos.map((url, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
          {uploading ? (
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          ) : (
            <>
              <Camera className="w-5 h-5 text-muted-foreground mb-0.5" />
              <span className="text-[10px] text-muted-foreground">Add</span>
            </>
          )}
        </label>
      </div>
    </div>
  );
}