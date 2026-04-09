import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, Upload, CheckCircle2, BadgeCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function UploadBox({ label, description, value, onUpload, required }) {
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
      value ? "border-chart-3/40 bg-chart-3/5" : "border-dashed border-border hover:border-chart-3/40"
    )}>
      <input type="file" className="hidden" onChange={handleFile} accept="image/*,.pdf" />
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", value ? "bg-chart-3/15" : "bg-muted")}>
        {value ? <CheckCircle2 className="w-5 h-5 text-chart-3" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-[14px] text-foreground">{label}</p>
          {required && <span className="text-[10px] text-destructive font-semibold">Required</span>}
        </div>
        <p className="text-[12px] text-muted-foreground">{uploading ? "Uploading…" : value ? "Uploaded ✓" : description}</p>
      </div>
    </label>
  );
}

function ConfirmBox({ label, description, checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all",
        checked ? "border-chart-3/40 bg-chart-3/5" : "border-border/60 bg-card hover:border-border"
      )}
    >
      <div className={cn(
        "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
        checked ? "bg-chart-3 border-chart-3" : "border-border"
      )}>
        {checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
      </div>
      <div>
        <p className="font-semibold text-[14px] text-foreground">{label}</p>
        <p className="text-[12px] text-muted-foreground mt-0.5">{description}</p>
      </div>
    </button>
  );
}

export default function StepSecureExchange({ profile, update }) {
  const confirmations = profile.secure_exchange_confirmations || {};

  const setConfirm = (key, val) => {
    update({ secure_exchange_confirmations: { ...confirmations, [key]: val } });
  };

  const handleCredentialUpload = (url) => {
    const existing = profile.certification_urls || [];
    if (!existing.includes(url)) update({ certification_urls: [...existing, url] });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-chart-3/15 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-chart-3" />
        </div>
        <div>
          <h2 className="text-[20px] font-heading font-bold text-foreground leading-tight">Secure Exchange Requirements</h2>
          <p className="text-[12px] text-muted-foreground">This role requires additional verification</p>
        </div>
      </div>

      <div className="px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl mb-5">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[12px] text-amber-800 leading-snug">
            Secure Exchange Providers are manually reviewed and approved by our team. Approval typically takes 3–5 business days.
          </p>
        </div>
      </div>

      {/* Credential uploads */}
      <p className="text-[13px] font-semibold text-foreground mb-3">Credentials & Documentation</p>
      <div className="space-y-3 mb-5">
        <UploadBox
          label="Law Enforcement / Security Credentials"
          description="Badge, agency ID, or official credential document"
          value={profile.secure_exchange_credential_url}
          onUpload={(url) => update({ secure_exchange_credential_url: url })}
          required
        />
        <UploadBox
          label="Professional License (if applicable)"
          description="Security guard license, private investigator license, etc."
          value={profile.secure_exchange_license_url}
          onUpload={(url) => update({ secure_exchange_license_url: url })}
        />
      </div>

      {/* Confirmations */}
      <p className="text-[13px] font-semibold text-foreground mb-3">Confirm the following</p>
      <div className="space-y-3 mb-5">
        <ConfirmBox
          label="I can appear in uniform or identifiable professional attire"
          description="Buyers rely on your visible authority for safety and trust."
          checked={!!confirmations.uniform}
          onChange={(v) => setConfirm("uniform", v)}
        />
        <ConfirmBox
          label="I understand I am facilitating a safe exchange, not providing legal services"
          description="Your role is a safety presence, not legal counsel or security enforcement."
          checked={!!confirmations.scope}
          onChange={(v) => setConfirm("scope", v)}
        />
        <ConfirmBox
          label="I consent to a background check as part of my application"
          description="Background screening is required for all Secure Exchange Providers."
          checked={!!confirmations.background_check}
          onChange={(v) => setConfirm("background_check", v)}
        />
      </div>

      <div className="px-4 py-3 bg-chart-3/5 rounded-2xl border border-chart-3/20">
        <div className="flex items-center gap-2 mb-1">
          <BadgeCheck className="w-4 h-4 text-chart-3" />
          <p className="text-[13px] font-semibold text-foreground">What happens after approval?</p>
        </div>
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          You'll receive a <strong>Secure Exchange Provider</strong> badge on your profile and gain access to high-value job requests. Buyers specifically seeking a safety presence will see your profile first.
        </p>
      </div>
    </div>
  );
}