import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import StepSpecialties from "@/components/vetter-onboarding/StepSpecialties";
import StepDocuments from "@/components/vetter-onboarding/StepDocuments";
import StepExperience from "@/components/vetter-onboarding/StepExperience";
import StepLocation from "@/components/vetter-onboarding/StepLocation";
import StepAvailability from "@/components/vetter-onboarding/StepAvailability";
import StepRoles from "@/components/vetter-onboarding/StepRoles";
import StepSecureExchange from "@/components/vetter-onboarding/StepSecureExchange";
import StepReview from "@/components/vetter-onboarding/StepReview";

const BASE_STEPS = ["Roles", "Specialties", "Documents", "Experience", "Location", "Availability", "Review"];

export default function VetterOnboarding() {
  const { user, isLoadingAuth, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState({
    display_name: user?.full_name || "",
    bio: "",
    avatar_url: "",
    id_document_url: "",
    certification_urls: [],
    work_history: "",
    years_of_experience: "",
    specialties: [],
    service_types: [],
    city: "",
    state: "",
    zip_code: "",
    service_radius_miles: 25,
    secure_exchange_credential_url: "",
    secure_exchange_license_url: "",
    secure_exchange_confirmations: {},
    availability: {
      monday: true, tuesday: true, wednesday: true,
      thursday: true, friday: true, saturday: false, sunday: false,
    },
  });

  // Guard: redirect if profile already exists
  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoadingAuth) return;
    // If not logged in, stop spinning
    if (!user?.email) {
      setChecking(false);
      return;
    }
    base44.entities.VetterProfile.filter({ user_email: user.email })
      .then((existing) => {
        if (existing.length > 0) {
          navigate("/vetter/profile", { replace: true });
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [user?.email, isLoadingAuth]);

  const update = (fields) => setProfile((prev) => ({ ...prev, ...fields }));

  const hasSecureExchange = profile.service_types?.includes("secure_exchange_presence");
  const STEPS = hasSecureExchange
    ? ["Roles", "Specialties", "Secure Exchange", "Documents", "Experience", "Location", "Availability", "Review"]
    : BASE_STEPS;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await base44.entities.VetterProfile.create({
        ...profile,
        user_email: user.email,
        years_of_experience: Number(profile.years_of_experience) || 0,
        service_radius_miles: Number(profile.service_radius_miles) || 25,
        status: "pending_review",
        available: true,
        secure_exchange_approved: false,
        certified_specialist: profile.service_types?.includes("specialist_vetting") || false,
      });
      // Preserve existing roles and add vetter if not already present
      const currentUser = await base44.auth.me();
      const existingRoles = currentUser?.app_roles?.length ? currentUser.app_roles : currentUser?.app_role ? [currentUser.app_role] : [];
      const newRoles = existingRoles.includes("vetter") ? existingRoles : [...existingRoles.filter(r => r !== "pro_security"), "vetter"];
      await base44.auth.updateMe({ app_role: "vetter", app_roles: newRoles, active_mode: "vetter", onboarded: true });
      await refreshUser();
      setSubmitting(false);
      navigate("/vetter/application-received");
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err?.message || "Submission failed. Please try again.");
    }
  };

  if (checking || isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-5">
        <p className="text-foreground font-heading font-bold text-lg">Sign in to become a Vetter</p>
        <p className="text-muted-foreground text-sm text-center max-w-xs">You need to be logged in to apply as a Vetter.</p>
        <Button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="rounded-xl px-8">
          Sign In
        </Button>
      </div>
    );
  }

  const stepProps = { profile, update };

  const steps = hasSecureExchange
    ? [
        <StepRoles {...stepProps} />,
        <StepSpecialties {...stepProps} />,
        <StepSecureExchange {...stepProps} />,
        <StepDocuments {...stepProps} />,
        <StepExperience {...stepProps} />,
        <StepLocation {...stepProps} />,
        <StepAvailability {...stepProps} />,
        <StepReview {...stepProps} onSubmit={handleSubmit} submitting={submitting} />,
      ]
    : [
        <StepRoles {...stepProps} />,
        <StepSpecialties {...stepProps} />,
        <StepDocuments {...stepProps} />,
        <StepExperience {...stepProps} />,
        <StepLocation {...stepProps} />,
        <StepAvailability {...stepProps} />,
        <StepReview {...stepProps} onSubmit={handleSubmit} submitting={submitting} />,
      ];

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <img src="https://media.base44.com/images/public/69d2a34ea0832e2ee10bd09e/1703aad83_image.png" alt="Vetter" className="h-12 w-auto" style={{ mixBlendMode: 'multiply' }} />
          <a href="/" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">← Home</a>
        </div>
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[12px] text-muted-foreground font-medium">Step {step + 1} of {STEPS.length}</p>
            <p className="text-[12px] text-muted-foreground">{STEPS[step]}</p>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-5 overflow-y-auto pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Error message */}
      {submitError && (
        <div className="mx-5 mb-2 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-[13px] text-destructive">
          {submitError}
        </div>
      )}

      {/* Navigation */}
      {step < STEPS.length - 1 && (
        <div className="px-5 pb-8 pt-4 border-t border-border/40 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 h-12 rounded-xl border border-border text-[15px] font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={() => setStep((s) => s + 1)}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground text-[15px] font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}