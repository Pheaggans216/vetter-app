import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, CheckCircle2, XCircle, AlertTriangle,
  ShieldCheck, Camera, FileText, Star
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const CONDITION_CONFIG = {
  excellent: { label: "Excellent", color: "text-accent", bg: "bg-accent/10" },
  good: { label: "Good", color: "text-chart-3", bg: "bg-chart-3/10" },
  fair: { label: "Fair", color: "text-amber-600", bg: "bg-amber-50" },
  poor: { label: "Poor", color: "text-destructive", bg: "bg-destructive/10" },
  defective: { label: "Defective", color: "text-destructive", bg: "bg-destructive/10" },
};

const RECOMMENDATION_CONFIG = {
  buy: {
    label: "Proceed with Purchase",
    icon: CheckCircle2,
    bg: "bg-accent/10",
    border: "border-accent/30",
    text: "text-accent",
    iconColor: "text-accent",
    description: "The Vetter found this item to be accurately represented and recommends proceeding.",
  },
  negotiate: {
    label: "Proceed with Caution",
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
    iconColor: "text-amber-500",
    description: "Some concerns were noted. Review the findings carefully before proceeding.",
  },
  pass: {
    label: "Do Not Proceed",
    icon: XCircle,
    bg: "bg-destructive/5",
    border: "border-destructive/30",
    text: "text-destructive",
    iconColor: "text-destructive",
    description: "Significant issues were found. The Vetter does not recommend this purchase.",
  },
};

export default function ReportView() {
  const { id: requestId } = useParams();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["report", requestId],
    queryFn: () => base44.entities.Report.filter({ request_id: requestId }),
    enabled: !!requestId,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["vetting-request", requestId],
    queryFn: async () => {
      const all = await base44.entities.VettingRequest.list();
      return all.filter(r => r.id === requestId);
    },
    enabled: !!requestId,
  });

  const { data: vetterProfiles = [] } = useQuery({
    queryKey: ["vetter-profile-report", reports[0]?.vetter_email],
    queryFn: () => base44.entities.VetterProfile.filter({ user_email: reports[0].vetter_email }),
    enabled: !!reports[0]?.vetter_email,
  });

  const report = reports[0];
  const request = requests[0];
  const vetter = vetterProfiles[0];

  if (isLoading) {
    return (
      <div className="px-5 pt-4">
        <div className="h-8 w-40 bg-muted rounded-xl animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-card rounded-2xl border border-border/60 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="px-5 pt-4 pb-8 text-center py-20">
        <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-heading font-semibold text-foreground mb-1">Report Pending</p>
        <p className="text-muted-foreground text-sm">The inspection report hasn't been submitted yet.</p>
        <Link to="/requests">
          <Button variant="outline" className="mt-4 rounded-xl">Back to Requests</Button>
        </Link>
      </div>
    );
  }

  const rec = RECOMMENDATION_CONFIG[report.recommendation] || RECOMMENDATION_CONFIG.negotiate;
  const RecIcon = rec.icon;
  const cond = CONDITION_CONFIG[report.overall_condition] || CONDITION_CONFIG.fair;
  const checked = report.checklist_items?.filter((c) => c.checked) || [];
  const unchecked = report.checklist_items?.filter((c) => !c.checked) || [];

  return (
    <div className="px-5 pt-4 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link to="/requests">
          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <p className="text-[11px] font-semibold text-primary uppercase tracking-wide">Verified Inspection Report</p>
          </div>
          <h1 className="text-[16px] font-heading font-bold text-foreground truncate">{request?.title}</h1>
        </div>
      </div>

      <div className="space-y-4">
        {/* Recommendation Banner */}
        <div className={cn("p-4 rounded-2xl border-2", rec.bg, rec.border)}>
          <div className="flex items-start gap-3">
            <RecIcon className={cn("w-6 h-6 shrink-0 mt-0.5", rec.iconColor)} />
            <div>
              <p className={cn("font-heading font-bold text-[16px]", rec.text)}>{rec.label}</p>
              <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">{rec.description}</p>
            </div>
          </div>
        </div>

        {/* Vetter & Date */}
        {vetter && (
          <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
              {vetter.avatar_url ? (
                <img src={vetter.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold">{vetter.display_name?.[0]}</span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-foreground">{vetter.display_name}</p>
              <p className="text-[12px] text-muted-foreground">
                Verified Inspector
                {vetter.rating && ` · ⭐ ${vetter.rating.toFixed(1)}`}
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {format(new Date(report.created_date), "MMM d, yyyy")}
            </p>
          </div>
        )}

        {/* Item Confirmed + Condition */}
        <div className="grid grid-cols-2 gap-3">
          <InfoCard label="Item Confirmed">
            <div className={cn("flex items-center gap-1.5 mt-1")}>
              {report.matches_listing ? (
                <><CheckCircle2 className="w-4 h-4 text-accent" /><span className="text-[13px] font-semibold text-accent">Yes</span></>
              ) : (
                <><XCircle className="w-4 h-4 text-destructive" /><span className="text-[13px] font-semibold text-destructive">No</span></>
              )}
            </div>
          </InfoCard>
          <InfoCard label="Condition">
            <span className={cn("text-[13px] font-semibold mt-1 block", cond.color)}>{cond.label}</span>
          </InfoCard>
          {report.estimated_value && (
            <InfoCard label="Est. Fair Value">
              <span className="text-[13px] font-semibold text-foreground mt-1 block">${report.estimated_value.toLocaleString()}</span>
            </InfoCard>
          )}
        </div>

        {/* Summary */}
        <ReportSection title="Condition Summary" icon={FileText}>
          <p className="text-[13px] text-muted-foreground leading-relaxed">{report.summary}</p>
        </ReportSection>

        {/* Checklist */}
        {report.checklist_items?.length > 0 && (
          <ReportSection title="Inspection Checklist" icon={CheckCircle2}>
            <div className="space-y-1.5">
              {checked.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-[13px] text-foreground">{item.description}</span>
                </div>
              ))}
              {unchecked.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-[13px] text-muted-foreground line-through">{item.description}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border/40">
              <p className="text-[12px] text-muted-foreground">
                {checked.length} of {report.checklist_items.length} items passed
              </p>
            </div>
          </ReportSection>
        )}

        {/* Red Flags */}
        {report.issues_found?.length > 0 && (
          <ReportSection title="Red Flags" icon={AlertTriangle} accent="amber">
            <div className="space-y-1.5">
              {report.issues_found.map((flag, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-[13px] text-amber-800">{flag}</span>
                </div>
              ))}
            </div>
          </ReportSection>
        )}

        {/* Photo Gallery */}
        {report.photos?.length > 0 && (
          <ReportSection title="Photo Evidence" icon={Camera}>
            <div className="grid grid-cols-3 gap-2">
              {report.photos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <div className="aspect-square rounded-xl overflow-hidden border border-border">
                    <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </ReportSection>
        )}

        {/* Detailed Notes */}
        {report.detailed_notes && (
          <ReportSection title="Detailed Notes" icon={FileText}>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{report.detailed_notes}</p>
          </ReportSection>
        )}

        {/* Footer trust mark */}
        <div className="flex items-center justify-center gap-2 py-4">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <p className="text-[12px] text-muted-foreground">
            This report was submitted by a verified Vetter and cannot be altered.
          </p>
        </div>
      </div>
    </div>
  );
}

function ReportSection({ title, icon: Icon, accent, children }) {
  return (
    <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("w-4 h-4", accent === "amber" ? "text-amber-500" : "text-primary")} />
        <p className="text-[13px] font-heading font-bold text-foreground">{title}</p>
      </div>
      {children}
    </div>
  );
}

function InfoCard({ label, children }) {
  return (
    <div className="p-3.5 bg-card rounded-2xl border border-border/60 shadow-sm">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
      {children}
    </div>
  );
}