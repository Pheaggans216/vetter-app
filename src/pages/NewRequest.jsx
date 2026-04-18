import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import StepIntro from "@/components/new-request/StepIntro";
import StepItemDetails from "@/components/new-request/StepItemDetails";
import StepLocation from "@/components/new-request/StepLocation";
import StepMatching from "@/components/new-request/StepMatching";
import StepSummary from "@/components/new-request/StepSummary";
import StepConfirmation from "@/components/new-request/StepConfirmation";
import { getCurrentMode } from "@/lib/roleState";

const TOTAL_STEPS = 6;

export default function NewRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const urlParams = new URLSearchParams(window.location.search);
  const prefilledCategory = urlParams.get("category") || "other";
  const [form, setForm] = useState({
    title: "",
    listing_url: "",
    listing_price: "",
    description: "",
    location_city: "",
    location_state: "",
    location_zip: "",
    listing_platform: "other",
    category: prefilledCategory,
    uploaded_screenshots: [],
  });

  const updateForm = (fields) => setForm((prev) => ({ ...prev, ...fields }));
  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.VettingRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vetting-requests"] });
      next();
    },
  });

  const isSeller = getCurrentMode(user) === "seller";

  const handleSubmit = () => {
    mutation.mutate({
      ...form,
      listing_price: form.listing_price ? Number(form.listing_price) : undefined,
      buyer_email: isSeller ? undefined : user?.email,
      seller_email: isSeller ? user?.email : undefined,
      status: "pending",
      service_type: "standard_verification",
    });
  };

  const showBack = step > 0 && step < 5;

  const steps = [
    <StepIntro onNext={next} />,
    <StepItemDetails form={form} updateForm={updateForm} onNext={next} />,
    <StepLocation form={form} updateForm={updateForm} onNext={next} />,
    <StepMatching onNext={next} city={form.location_city} state={form.location_state} />,
    <StepSummary form={form} onSubmit={handleSubmit} submitting={mutation.isPending} />,
    <StepConfirmation onTrack={() => navigate("/requests")} />,
  ];

  return (
    <div className="min-h-screen bg-background font-body flex flex-col max-w-lg mx-auto">
      {/* Header */}
      {step < 5 && (
        <div className="px-5 pt-6 pb-3 flex items-center gap-3">
          {showBack ? (
            <button onClick={back} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
          ) : (
            <Link to="/" className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </Link>
          )}
          {/* Progress dots */}
          <div className="flex-1">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
          <span className="text-[12px] text-muted-foreground font-medium">{step + 1} / {TOTAL_STEPS}</span>
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="h-full"
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
