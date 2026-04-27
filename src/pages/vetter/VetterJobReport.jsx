import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, X, Loader2, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const TIER_CHECKLIST = {
  basic: [
    { id: "exists", label: "Confirmed item exists in person" },
    { id: "photo_proof", label: "Photo/video proof uploaded" },
    { id: "seller_id", label: "Seller identity confirmed" },
    { id: "location", label: "Meetup/location confirmed" },
  ],
  standard: [
    { id: "exists", label: "Confirmed item exists" },
    { id: "photo_proof", label: "Photo/video proof uploaded" },
    { id: "seller_id", label: "Seller identity confirmed" },
    { id: "location", label: "Location confirmed" },
    { id: "functional", label: "Tested item functionality" },
    { id: "condition_photos", label: "Condition photos uploaded" },
    { id: "notes", label: "Written condition notes added" },
    { id: "red_flags", label: "Red flag assessment completed" },
  ],
  expert: [
    { id: "exists", label: "Confirmed item exists" },
    { id: "photo_proof", label: "Photo/video proof uploaded" },
    { id: "seller_id", label: "Seller identity confirmed" },
    { id: "location", label: "Location confirmed" },
    { id: "functional", label: "Tested item functionality" },
    { id: "condition_photos", label: "Condition photos uploaded" },
    { id: "notes", label: "Written condition notes added" },
    { id: "red_flags", label: "Red flag assessment completed" },
    { id: "specialist", label: "Specialist inspection notes added" },
    { id: "market_value", label: "Market value range estimated" },
  ],
};

const CONDITIONS = ["excellent", "good", "fair", "poor", "defective"];
const RECOMMENDATIONS = [
  { value: "buy", label: "Safe to Proceed", color: "border-accent/40 bg-accent/5 text-accent", activeColor: "border-accent bg-accent text-white" },
  { value: "negotiate", label: "Proceed With Caution", color: "border-amber-400/40 bg-amber-50 text-amber-700", activeColor: "border-amber-500 bg-amber-500 text-white" },
  { value: "pass", label: "Do Not Buy", color: "border-destructive/30 bg-destructive/5 text-destructive", activeColor: "border-destructive bg-destructive text-white" },
];

export default function VetterJobReport() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const { data: jobs = [] } = useQuery({
    queryKey: ["vetter-job", jobId],
    queryFn: async () => {
      const all = await base44.entities.VetterJob.list();
      return all.filter(j => j.id === jobId);
    },
    enabled: !!jobId,
  });
  const job = jobs[0];

  const checklist = job ? (TIER_CHECKLIST[job.tier] || TIER_CHECKLIST.basic) : [];

  const [form, setForm] = useState({
    overall_condition: "",
    matches_listing: null,
    summary: "",
    detailed_notes: "",
    red_flags: "",
    recommendation: "",
    estimated_value: "",
    photos: [],
    checked_ids: [],
  });

  const update = (patch) => setForm(prev => ({ ...prev, ...patch }));

  const toggleCheck = (id) => {
    update({ checked_ids: form.checked_ids.includes(id) ? form.checked_ids.filter(c => c !== id) : [...form.checked_ids, id] });
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      update({ photos: [...form.photos, file_url] });
    }
    setUploading(false);
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const checklistItems = checklist.map(item => ({
        description: item.label,
        checked: form.checked_ids.includes(item.id),
      }));
      const redFlagList = form.red_flags ? form.red_flags.split("\n").map(s => s.trim()).filter(Boolean) : [];

      // Determine final listing vetting status from recommendation
      const listingStatus = form.recommendation === "buy" ? "vetted"
        : form.recommendation === "negotiate" ? "vetted_with_caution"
        : "failed_verification";

      const report = await base44.entities.Report.create({
        request_id: job.listing_id,
        vetter_email: user.email,
        buyer_email: job.buyer_email,
        overall_condition: form.overall_condition,
        matches_listing: form.matches_listing === "yes",
        recommendation: form.recommendation,
        summary: form.summary,
        detailed_notes: form.detailed_notes,
        photos: form.photos,
        checklist_items: checklistItems,
        issues_found: redFlagList,
        estimated_value: form.estimated_value ? Number(form.estimated_value) : undefined,
      });

      await base44.entities.VetterJob.update(job.id, { status: "report_ready", report_id: report.id });
      await base44.entities.Listing.update(job.listing_id, { vetting_status: listingStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vetter-jobs-mine"] });
      toast({ title: "Report submitted!", description: "The buyer has been notified." });
      navigate("/vetter/jobs");
    },
  });

  const canSubmit = form.overall_condition && form.recommendation && form.summary && form.matches_listing !== null;

  if (!job) return (
    <div className="px-5 pt-8 text-center">
      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
    </div>
  );

  return (
    <div className="px-5 pt-4 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/vetter/jobs">
          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-[17px] font-heading font-bold text-foreground">Inspection Report</h1>
          <p className="text-[12px] text-muted-foreground capitalize">{job.tier} Verification</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Checklist */}
        <Sec title="Inspection Checklist" index={1}>
          <div className="space-y-2">
            {checklist.map(item => (
              <button key={item.id} onClick={() => toggleCheck(item.id)}
                className={cn("w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                  form.checked_ids.includes(item.id) ? "border-accent/40 bg-accent/5" : "border-border/60 bg-card")}>
                <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0",
                  form.checked_ids.includes(item.id) ? "border-accent bg-accent" : "border-border")}>
                  {form.checked_ids.includes(item.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <p className="text-[13px] text-foreground">{item.label}</p>
              </button>
            ))}
          </div>
        </Sec>

        {/* Item confirmed */}
        <Sec title="Item Confirmed Present?" index={2}>
          <div className="grid grid-cols-2 gap-2">
            {[{ v: "yes", l: "Yes — item confirmed" }, { v: "no", l: "No — item not present/as described" }].map(opt => (
              <button key={opt.v} onClick={() => update({ matches_listing: opt.v })}
                className={cn("p-3 rounded-xl border-2 text-[13px] font-medium transition-all",
                  form.matches_listing === opt.v ? "border-primary bg-primary/5 text-primary" : "border-border/60 bg-card text-muted-foreground")}>
                {opt.l}
              </button>
            ))}
          </div>
        </Sec>

        {/* Condition */}
        <Sec title="Overall Condition" index={3}>
          <Select value={form.overall_condition} onValueChange={v => update({ overall_condition: v })}>
            <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select condition" /></SelectTrigger>
            <SelectContent>
              {CONDITIONS.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </Sec>

        {/* Photos */}
        <Sec title="Photo Evidence" index={4}>
          <div className="grid grid-cols-4 gap-2">
            {form.photos.map((url, i) => (
              <div key={i} className="relative aspect-square">
                <img src={url} alt="" className="w-full h-full object-cover rounded-xl border border-border/60" />
                <button onClick={() => update({ photos: form.photos.filter((_, idx) => idx !== i) })}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40">
              <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handlePhotoUpload} />
              {uploading ? <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
            </label>
          </div>
        </Sec>

        {/* Summary */}
        <Sec title="Condition Summary" index={5}>
          <Textarea value={form.summary} onChange={e => update({ summary: e.target.value })}
            placeholder="Summarize your overall findings..." className="rounded-xl min-h-[90px]" />
        </Sec>

        {/* Red flags */}
        <Sec title="Red Flags" index={6} optional>
          <Textarea value={form.red_flags} onChange={e => update({ red_flags: e.target.value })}
            placeholder="List each red flag on a new line..." className="rounded-xl min-h-[70px]" />
          {form.red_flags && (
            <div className="flex items-center gap-1.5 mt-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] text-amber-600">Red flags will be highlighted in the buyer's report.</span>
            </div>
          )}
        </Sec>

        {/* Detailed notes */}
        <Sec title="Detailed Notes" index={7} optional>
          <Textarea value={form.detailed_notes} onChange={e => update({ detailed_notes: e.target.value })}
            placeholder="Additional observations, specialist notes, market context..." className="rounded-xl min-h-[70px]" />
        </Sec>

        {/* Estimated value (expert only) */}
        {job.tier === "expert" && (
          <Sec title="Estimated Market Value" index={8} optional>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input type="number" value={form.estimated_value} onChange={e => update({ estimated_value: e.target.value })}
                placeholder="0" className="rounded-xl h-11 pl-7" />
            </div>
          </Sec>
        )}

        {/* Recommendation */}
        <Sec title="Vetter Recommendation" index={job.tier === "expert" ? 9 : 8}>
          <div className="space-y-2">
            {RECOMMENDATIONS.map(rec => (
              <button key={rec.value} onClick={() => update({ recommendation: rec.value })}
                className={cn("w-full p-4 rounded-xl border-2 text-left transition-all",
                  form.recommendation === rec.value ? rec.activeColor : rec.color)}>
                <p className="font-heading font-bold text-[14px]">{rec.label}</p>
              </button>
            ))}
          </div>
        </Sec>

        <Button onClick={() => submitMutation.mutate()} disabled={!canSubmit || submitMutation.isPending}
          size="lg" className="w-full rounded-xl h-12 text-[15px] font-semibold">
          {submitMutation.isPending
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
            : <><Send className="w-4 h-4 mr-2" />Submit Report</>}
        </Button>
      </div>
    </div>
  );
}

function Sec({ title, index, optional, children }) {
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