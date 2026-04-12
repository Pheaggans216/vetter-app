import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EditProfile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    city: "",
    state: "",
    zip_code: "",
    bio: "",
    avatar_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        phone: user.phone || "",
        city: user.city || "",
        state: user.state || "",
        zip_code: user.zip_code || "",
        bio: user.bio || "",
        avatar_url: user.avatar_url || "",
      });
    }
  }, [user]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("avatar_url", file_url);
    setUploading(false);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await base44.auth.updateMe(form);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      const msg = err?.message || err?.data?.message || String(err);
      if (msg?.toLowerCase().includes('auth') || err?.status === 401 || err?.status === 403) {
        // Session expired — redirect to login and come back
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      setError(msg || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-5 pt-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/profile")}
          className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <h1 className="text-xl font-heading font-bold text-foreground">Edit Profile</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border border-border/60">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-2xl">
                {form.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        {uploading && <p className="text-[12px] text-muted-foreground mt-3">Uploading…</p>}
        {!uploading && <p className="text-[12px] text-muted-foreground mt-3">Tap camera to change photo</p>}
      </div>

      {/* Form */}
      <div className="space-y-4">
        <Field label="Full Name" value={form.full_name} onChange={(v) => update("full_name", v)} placeholder="Your full name" />
        
        <div>
          <label className="block text-[13px] font-semibold text-foreground mb-1.5">Email</label>
          <input
            type="email"
            value={user?.email ?? "Loading..."}
            readOnly
            className="w-full h-12 px-4 rounded-xl border border-border bg-muted text-[14px] text-muted-foreground cursor-not-allowed"
          />
          <p className="text-[11px] text-muted-foreground mt-1 pl-1">Email is tied to your login and cannot be changed here.</p>
        </div>

        <Field label="Phone Number" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+1 (555) 000-0000" type="tel" />
        
        <div className="grid grid-cols-2 gap-3">
          <Field label="City" value={form.city} onChange={(v) => update("city", v)} placeholder="Los Angeles" />
          <Field label="State" value={form.state} onChange={(v) => update("state", v)} placeholder="CA" />
        </div>
        
        <Field label="ZIP Code" value={form.zip_code} onChange={(v) => update("zip_code", v)} placeholder="90210" />
        
        <div>
          <label className="block text-[13px] font-semibold text-foreground mb-1.5">
            Short Bio <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="Tell us a little about yourself…"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition resize-none"
          />
        </div>
      </div>

      {/* Feedback */}
      {success && (
        <div className="mt-5 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-[13px] font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Profile saved successfully!
        </div>
      )}
      {error && (
        <div className="mt-5 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-[13px]">
          {error}
        </div>
      )}

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={saving || uploading}
        size="lg"
        className="w-full mt-6 rounded-xl h-12 text-[15px] font-semibold shadow-sm"
      >
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-foreground mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 px-4 rounded-xl border border-border bg-card text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition"
      />
    </div>
  );
}