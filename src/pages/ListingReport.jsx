import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, CheckCircle2, XCircle, AlertTriangle, ShieldCheck,
  Camera, FileText, Star, MessageCircle, Flag, ThumbsUp
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const RECOMMENDATION_CONFIG = {
  buy: {
    label: "Verified — Safe to Proceed",
    icon: CheckCircle2,
    bg: "bg-accent/10", border: "border-accent/30", text: "text-accent", iconColor: "text-accent",
    description: "The Vetter found this item to be accurately represented.",
    finalStatus: "vetted",
    badgeLabel: "✓ Verified",
  },
  negotiate: {
    label: "Verified With Caution",
    icon: AlertTriangle,
    bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", iconColor: "text-amber-500",
    description: "Some concerns noted. Review findings carefully before proceeding.",
    finalStatus: "vetted_with_caution",
    badgeLabel: "⚠ Verified With Caution",
  },
  pass: {
    label: "Failed Verification",
    icon: XCircle,
    bg: "bg-destructive/5", border: "border-destructive/30", text: "text-destructive", iconColor: "text-destructive",
    description: "Significant issues were found. The Vetter does not recommend this purchase.",
    finalStatus: "failed_verification",
    badgeLabel: "✗ Failed Verification",
  },
};

export default function ListingReport() {
  const { id: listingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["listing-report", listingId],
    queryFn: () => base44.entities.Report.filter({ request_id: listingId }),
    enabled: !!listingId,
  });
  const report = reports[0];

  const { data: jobs = [] } = useQuery({
    queryKey: ["listing-job-report", listingId],
    queryFn: () => base44.entities.VetterJob.filter({ listing_id: listingId }),
    enabled: !!listingId,
  });
  const job = jobs.find(j => j.status === "report_ready" || j.status === "completed");

  const { data: vetterProfiles = [] } = useQuery({
    queryKey: ["vetter-profile-lreport", report?.vetter_email],
    queryFn: () => base44.entities.VetterProfile.filter({ user_email: report.vetter_email }),
    enabled: !!report?.vetter_email,
  });
  const vetter = vetterProfiles[0];

  const confirmMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.VetterJob.update(job.id, {
        status: "completed",
        payment_status: "released",
        buyer_confirmed_at: new Date().toISOString(),
        buyer_rating_vetter: rating,
      });
      if (vetter) {
        await base44.entities.VetterProfile.update(vetter.id, {
          total_inspections: (vetter.total_inspections || 0) + 1,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listing-job-report"] });
      setConfirmed(true);
      toast({ title: "Report confirmed!", description: "Payout released to your Vetter." });
    },
  });

  const messageMutation = useMutation({
    mutationFn: async () => {
      const existing = await base44.entities.Conversation.filter({ request_id: listingId });
      const convo = existing[0];
      if (convo) return convo;
      return base44.entities.Conversation.create({ request_id: listingId, participants: [user.email, report?.vetter_email], unread_count: 0 });
    },
    onSuccess: (convo) => navigate(`/messages/${convo.id}`),
  });

  if (isLoading) return (
    <div className="px-5 pt-4 space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-24 bg-card rounded-2xl border border-border/60 animate-pulse" />)}
    </div>
  );

  if (!report) return (
    <div className="px-5 pt-10 text-center">
      <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <p className="font-heading font-semibold text-foreground mb-1">Report Pending</p>
      <p className="text-muted-foreground text-sm">The inspection report hasn't been submitted yet.</p>
      <Link to={`/listings/${listingId}`}><Button variant="outline" className="mt-4 rounded-xl">Back</Button></Link>
    </div>
  );

  const rec = RECOMMENDATION_CONFIG[report.recommendation] || RECOMMENDATION_CONFIG.negotiate;
  const RecIcon = rec.icon;
  const checked = report.checklist_items?.filter(c => c.checked) || [];
  const unchecked = report.checklist_items?.filter(c => !c.checked) || [];

  return (
    <div className="px-5 pt-4 pb-10">
      <div className="flex items-center gap-3 mb-5">
        <Link to={`/listings/${listingId}`}>
          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <p className="text-[11px] font-semibold text-primary uppercase tracking-wide">Verified Inspection Report</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Recommendation */}
        <div className={cn("p-4 rounded-2xl border-2", rec.bg, rec.border)}>
          <div className="flex items-start gap-3">
            <RecIcon className={cn("w-6 h-6 shrink-0 mt-0.5", rec.iconColor)} />
            <div>
              <p className={cn("font-heading font-bold text-[16px]", rec.text)}>{rec.label}</p>
              <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">{rec.description}</p>
            </div>
          </div>
        </div>

        {/* Vetter info */}
        {vetter && (
          <div className="p-4 bg-card rounded-2xl border border-border/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
              {vetter.avatar_url ? <img src={vetter.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-primary font-bold">{vetter.display_name?.[0]}</span>}
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-foreground">{vetter.display_name}</p>
              <p className="text-[12px] text-muted-foreground">Verified Inspector{vetter.rating ? ` · ⭐ ${vetter.rating.toFixed(1)}` : ""}</p>
            </div>
            <p className="text-[11px] text-muted-foreground">{format(new Date(report.created_date), "MMM d, yyyy")}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-card rounded-2xl border border-border/60">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Item Present</p>
            <div className="flex items-center gap-1.5">
              {report.matches_listing ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <XCircle className="w-4 h-4 text-destructive" />}
              <span className={cn("text-[13px] font-semibold", report.matches_listing ? "text-accent" : "text-destructive")}>
                {report.matches_listing ? "Confirmed" : "Not Confirmed"}
              </span>
            </div>
          </div>
          <div className="p-3.5 bg-card rounded-2xl border border-border/60">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Condition</p>
            <p className="text-[13px] font-semibold text-foreground capitalize">{report.overall_condition}</p>
          </div>
          {report.estimated_value && (
            <div className="p-3.5 bg-card rounded-2xl border border-border/60">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Est. Market Value</p>
              <p className="text-[13px] font-semibold text-foreground">${report.estimated_value.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <RS title="Condition Summary" icon={FileText}>
          <p className="text-[13px] text-muted-foreground leading-relaxed">{report.summary}</p>
        </RS>

        {/* Checklist */}
        {report.checklist_items?.length > 0 && (
          <RS title="Inspection Checklist" icon={CheckCircle2}>
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
            <p className="text-[12px] text-muted-foreground mt-3 pt-3 border-t border-border/40">
              {checked.length} of {report.checklist_items.length} items passed
            </p>
          </RS>
        )}

        {/* Red flags */}
        {report.issues_found?.length > 0 && (
          <RS title="Red Flags" icon={AlertTriangle} accent="amber">
            <div className="space-y-1.5">
              {report.issues_found.map((flag, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-[13px] text-amber-800">{flag}</span>
                </div>
              ))}
            </div>
          </RS>
        )}

        {/* Photos */}
        {report.photos?.length > 0 && (
          <RS title="Photo Evidence" icon={Camera}>
            <div className="grid grid-cols-3 gap-2">
              {report.photos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <div className="aspect-square rounded-xl overflow-hidden border border-border">
                    <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </RS>
        )}

        {/* Buyer confirmation block */}
        {job && job.status === "report_ready" && !confirmed && (
          <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
            <p className="text-[13px] font-semibold text-foreground mb-3">Rate your Vetter</p>
            <div className="flex gap-1.5 mb-4">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s}
                  onMouseEnter={() => setRatingHover(s)}
                  onMouseLeave={() => setRatingHover(0)}
                  onClick={() => setRating(s)}>
                  <Star className={cn("w-7 h-7 transition-colors",
                    s <= (ratingHover || rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground")} />
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Button onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending || !rating}
                size="lg" className="w-full rounded-xl h-12 text-[15px] font-semibold gap-2">
                <ThumbsUp className="w-5 h-5" /> Proceed With Purchase
              </Button>
              <Button variant="outline" onClick={() => messageMutation.mutate()} disabled={messageMutation.isPending}
                size="lg" className="w-full rounded-xl h-11 text-[14px] gap-2">
                <MessageCircle className="w-4 h-4" /> Message Seller
              </Button>
              <Button variant="ghost" onClick={() => navigate(`/listings/${listingId}`)}
                size="lg" className="w-full rounded-xl h-11 text-[14px] gap-2 text-destructive hover:bg-destructive/5">
                <XCircle className="w-4 h-4" /> Cancel Purchase
              </Button>
              <Button variant="ghost"
                size="lg" className="w-full rounded-xl h-11 text-[13px] gap-2 text-muted-foreground">
                <Flag className="w-4 h-4" /> Report Issue
              </Button>
            </div>
          </div>
        )}

        {(confirmed || job?.status === "completed") && (
          <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20 text-center">
            <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="font-heading font-bold text-foreground mb-1">Job Completed</p>
            <p className="text-[12px] text-muted-foreground">Payout has been released to your Vetter. Thank you!</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 py-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <p className="text-[12px] text-muted-foreground">Report submitted by a verified Vetter and cannot be altered.</p>
        </div>
      </div>
    </div>
  );
}

function RS({ title, icon: Icon, accent, children }) {
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