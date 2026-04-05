import { ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SPECIALTY_LABELS = {
  mechanic: "Mechanic", electronics_technician: "Electronics Tech", appliance_expert: "Appliance Expert",
  jeweler: "Jeweler", watch_specialist: "Watch Specialist", luxury_authenticator: "Luxury Auth.",
  contractor: "Contractor", furniture_expert: "Furniture Expert", property_verifier: "Property Verifier",
  security_professional: "Security Pro", other: "Other",
};

const SERVICE_LABELS = {
  standard_verification: "Standard Verification",
  specialist_vetting: "Specialist Vetting",
  secure_exchange_presence: "Secure Exchange Presence",
};

export default function StepReview({ profile, onSubmit, submitting }) {
  return (
    <div>
      <h2 className="text-[22px] font-heading font-bold text-foreground mb-1">Ready to submit</h2>
      <p className="text-muted-foreground text-[14px] mb-6">
        Review your application. Our team will verify your documents and approve your profile within 24–48 hours.
      </p>

      <div className="space-y-3 mb-8">
        <Row label="Name" value={profile.display_name} />
        <Row label="Location" value={[profile.city, profile.state, profile.zip_code].filter(Boolean).join(", ")} />
        <Row label="Experience" value={profile.years_of_experience ? `${profile.years_of_experience} years` : "—"} />
        <Row label="Service Radius" value={`${profile.service_radius_miles} miles`} />
        <Row label="Specialties" value={profile.specialties?.map((s) => SPECIALTY_LABELS[s]).join(", ") || "—"} />
        <Row label="Services" value={profile.service_types?.map((s) => SERVICE_LABELS[s]).join(", ") || "—"} />
        <Row label="ID Uploaded" value={profile.id_document_url ? "✓ Yes" : "Not uploaded"} />
        <Row label="Certifications" value={profile.certification_urls?.length > 0 ? `${profile.certification_urls.length} uploaded` : "None"} />
      </div>

      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-primary" />
          <p className="text-[13px] font-semibold text-foreground">Review timeline</p>
        </div>
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          Applications are typically reviewed within <strong>24–48 hours</strong>. You'll receive an email once approved.
        </p>
      </div>

      <div className="space-y-2 mb-6">
        {["Identity verification", "Credential review", "Background screening"].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <p className="text-[13px] text-muted-foreground">{item}</p>
          </div>
        ))}
      </div>

      <Button
        onClick={onSubmit}
        disabled={submitting}
        size="lg"
        className="w-full rounded-xl h-12 text-[15px] font-semibold shadow-sm"
      >
        <ShieldCheck className="w-4 h-4 mr-2" />
        {submitting ? "Submitting..." : "Submit Application"}
      </Button>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-border/40 last:border-0">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="text-[13px] font-medium text-foreground text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );
}