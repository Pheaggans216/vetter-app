import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, Loader2, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import ChecklistEditor from "@/components/report/ChecklistEditor";
import ReportPhotoUploader from "@/components/report/ReportPhotoUploader";
import { getChecklist } from "@/lib/checklists";

const CONDITIONS = [
  { value: "excellent", label: "Excellent — like new" },
  { value: "good", label: "Good — minor wear only" },
  { value: "fair", label: "Fair — noticeable wear or issues" },
  { value: "poor", label: "Poor — significant issues" },
  { value: "defective", label: "Defective — does not function as described" },
];

const RECOMMENDATIONS = [
  {
    value: "buy",
    label: "Proceed",
    description: "Item is as described. Recommend proceeding with purchase.",
    color: "border-accent/40 bg-accent/5 text-accent",
    activeColor: "border-accent bg-accent text-white",
  },
  {
    value: "negotiate",
    label: "Proceed with Caution",
    description: "Some concerns noted. Buyer should negotiate or verify further.",
    color: "border-amber-400/40 bg-amber-50 text-amber-700",
    activeColor: "border-amber-500 bg-amber-500 text-white",
  },
  {
    value: "pass",
    label: "Do Not Proceed",
    description: "Significant red flags found. Not recommended.",
    color: "border-destructive/30 bg-destructive/5 text-destructive",
    activeColor: "border-destructive bg-destructive text-white",
  },
];

export default function SubmitReport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { id: jobId } = useParams();

  const { data: jobs = [] } = useQuery({
    queryKey: ["job-for-report", jobId],
    queryFn: async () => {
      const all = await base44.entities.VettingRequest.list();
      return all.filter(r => r.id === jobId);
    },
    enabled: !!jobId,
  });
  const job = jobs[0];

  const checklist = job ? getChecklist(job.category) : [];

  const [form, setForm] = useState({
    overall_condition: "",
    matches_listing: null,
    seller_met: null,
    summary: "",
    detailed_notes: "",
    authenticity_concerns: "",
    red_flags: "",
    recommendation: "",
    photos: [],
    video_urls: [],
    checked_ids: [],
    estimated_value: "",
  });

  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const submitMutation = useMutation({
    mutationFn: async () => {
      const checklistItems = checklist.map((item) => ({
        description: item.label,
        checked: form.checked_ids.includes(item.id),
      }));

      const redFlagList = form.red_flags
        ? form.red_flags.split("\n").map((s) => s.trim()).filter(Boolean)
        : [];

      await base44.entities.Report.create({
        request_id: job.id,
        vetter_email: user.email,
        buyer_email: job.buyer_email,
        overall_condition: form.overall_condition,
        matches_listing: form.matches_listing === "yes",
        recommendation: form.recommendation,
        summary: form.summary,
        detailed_notes: form.detailed_notes,
        photos: form.photos,
        video_urls: form.video_urls,
        checklist_items: checklistItems,
        issues_found: redFlagList,
        estimated_value: form.estimated_value ? Number(form.estimated_value) : undefined,
      });

      await base44.entities.VettingRequest.update(job.id, { status: "completed" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs-mine"] });
      toast({ title: "Report submitted", description: "The buyer has been notified." });
      navigate("/jobs");
    },
  });

  const canSubmit =
    form.overall_condition &&
    form.recommendation &&
    form.summary &&
    form.matches_listing !== null;

  if (!job) {
    return (
      <div className="px-5 pt-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/jobs">
          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[17px] font-heading font-bold text-foreground">Inspection Report</h1>
          <p className="text-[12px] text-muted-foreground truncate max-w-[220px]">{job.title}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Meeting Confirmation */}
        <Section title="Seller Meeting" index={1}>
          <div className="grid grid-cols-2 gap-2">
            {[{ label: "Met seller in person", value: "yes" }, { label: "Did not meet", value: "no" }].map((opt) => (
              <button
                key={opt.value}
                onClick={() => update({ seller_met: opt.value })}
                className={`p-3 rounded-xl border-2 text-[13px] font-medium transition-all ${
                  form.seller_met === opt.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/60 bg-card text-muted-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Section 2: Item Confirmation */}
        <Section title="Item Existence" index={2}>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[{ label: "Item confirmed present", value: "yes" }, { label: "Item not as described", value: "no" }].map((opt) => (
              <button
                key={opt.value}
                onClick={() => update({ matches_listing: opt.value })}
                className={`p-3 rounded-xl border-2 text-[13px] font-medium transition-all ${
                  form.matches_listing === opt.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/60 bg-card text-muted-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Section 3: Condition */}
        <Section title="Overall Condition" index={3}>
          <Select value={form.overall_condition} onValueChange={(v) => update({ overall_condition: v })}>
            <SelectTrigger className="rounded-xl h-11">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Section>

        {/* Section 4: Inspection Checklist */}
        <Section title="Inspection Checklist" index={4}>
          <ChecklistEditor
            items={checklist}
            checkedIds={form.checked_ids}
            onChange={(ids) => update({ checked_ids: ids })}
          />
        </Section>

        {/* Section 5: Photos */}
        <Section title="Photo Evidence" index={5}>
          <ReportPhotoUploader
            photos={form.photos}
            onAdd={(url) => update({ photos: [...form.photos, url] })}
            onRemove={(i) => update({ photos: form.photos.filter((_, idx) => idx !== i) })}
          />
        </Section>

        {/* Section 6: Summary */}
        <Section title="Condition Summary" index={6}>
          <Textarea
            placeholder="Summarize your overall findings from the inspection..."
            value={form.summary}
            onChange={(e) => update({ summary: e.target.value })}
            className="rounded-xl min-h-[90px]"
          />
        </Section>

        {/* Section 7: Authenticity Concerns */}
        <Section title="Authenticity Concerns" index={7} optional>
          <Textarea
            placeholder="Note any concerns about authenticity, title, or description accuracy..."
            value={form.authenticity_concerns}
            onChange={(e) => update({ authenticity_concerns: e.target.value })}
            className="rounded-xl min-h-[80px]"
          />
        </Section>

        {/* Section 8: Red Flags */}
        <Section title="Red Flags" index={8} optional>
          <Textarea
            placeholder="List each red flag on a new line..."
            value={form.red_flags}
            onChange={(e) => update({ red_flags: e.target.value })}
            className="rounded-xl min-h-[80px]"
          />
          {form.red_flags && (
            <div className="flex items-center gap-1.5 mt-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] text-amber-600">Red flags will be highlighted in the buyer's report.</span>
            </div>
          )}
        </Section>

        {/* Section 9: Estimated Value */}
        <Section title="Estimated Fair Market Value" index={9} optional>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[14px]">$</span>
            <Input
              type="number"
              placeholder="0"
              value={form.estimated_value}
              onChange={(e) => update({ estimated_value: e.target.value })}
              className="rounded-xl h-11 pl-7"
            />
          </div>
        </Section>

        {/* Section 10: Recommendation */}
        <Section title="Vetter Recommendation" index={10}>
          <div className="space-y-2">
            {RECOMMENDATIONS.map((rec) => (
              <button
                key={rec.value}
                onClick={() => update({ recommendation: rec.value })}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  form.recommendation === rec.value ? rec.activeColor : rec.color
                }`}
              >
                <p className="font-heading font-bold text-[14px]">{rec.label}</p>
                <p className={`text-[12px] mt-0.5 ${form.recommendation === rec.value ? "opacity-80" : ""}`}>
                  {rec.description}
                </p>
              </button>
            ))}
          </div>
        </Section>

        <Button
          onClick={() => submitMutation.mutate()}
          disabled={!canSubmit || submitMutation.isPending}
          size="lg"
          className="w-full rounded-xl h-12 text-[15px] font-semibold shadow-sm"
        >
          {submitMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting Report...</>
          ) : (
            <><Send className="w-4 h-4 mr-2" />Submit Report</>
          )}
        </Button>
      </div>
    </div>
  );
}

function Section({ title, index, optional, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-primary">{index}</span>
        </div>
        <p className="text-[14px] font-heading font-bold text-foreground">{title}</p>
        {optional && <span className="text-[11px] text-muted-foreground">(optional)</span>}
      </div>
      {children}
    </div>
  );
}