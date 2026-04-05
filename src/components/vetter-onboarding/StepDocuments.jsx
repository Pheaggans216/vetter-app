import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, CheckCircle2, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

function UploadBox({ label, description, icon: IconComponent, value, onUpload }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onUpload(file_url);
    setUploading(false);
  };

  return (
    <label className={cn(
      "flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all",
      value ? "border-primary/40 bg-primary/5" : "border-dashed border-border hover:border-primary/40"
    )}>
      <input type="file" className="hidden" onChange={handleFile} accept="image/*,.pdf" />
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
        value ? "bg-primary/10" : "bg-muted")}>
        {value ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <IconComponent className="w-5 h-5 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[14px] text-foreground">{label}</p>
        <p className="text-[12px] text-muted-foreground">{uploading ? "Uploading..." : value ? "Uploaded ✓" : description}</p>
      </div>
      {!value && <Upload className="w-4 h-4 text-muted-foreground shrink-0" />}
    </label>
  );
}

export default function StepDocuments({ profile, update }) {
  const handleCertUpload = async (url) => {
    update({ certification_urls: [...(profile.certification_urls || []), url] });
  };

  return (
    <div>
      <h2 className="text-[22px] font-heading font-bold text-foreground mb-1">Verify your identity</h2>
      <p className="text-muted-foreground text-[14px] mb-6">
        All Vetters go through identity and credential verification. Your documents are stored securely.
      </p>
      <div className="space-y-3">
        <UploadBox
          label="Government-Issued ID"
          description="Driver's license, passport, or state ID"
          icon={User}
          value={profile.id_document_url}
          onUpload={(url) => update({ id_document_url: url })}
        />
        <UploadBox
          label="Certification or License"
          description="Professional cert, trade license, or diploma"
          icon={FileText}
          value={profile.certification_urls?.[0]}
          onUpload={handleCertUpload}
        />
        <UploadBox
          label="Profile Photo"
          description="Clear headshot photo"
          icon={User}
          value={profile.avatar_url}
          onUpload={(url) => update({ avatar_url: url })}
        />
      </div>
      <p className="text-[11px] text-muted-foreground mt-4 text-center">
        🔒 Documents are encrypted and never shared publicly.
      </p>
    </div>
  );
}