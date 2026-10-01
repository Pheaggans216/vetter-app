import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Runs hourly. Releases held payouts 48 hours after a report is delivered
// when the buyer has neither confirmed nor opened a dispute.
const HOLD_HOURS = 48;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const cutoff = Date.now() - HOLD_HOURS * 60 * 60 * 1000;

    const waiting = await base44.asServiceRole.entities.VetterJob.filter({
      status: "report_ready",
      payment_status: "held",
    });

    let released = 0;
    for (const job of waiting) {
      if (job.dispute_opened_at) continue;
      const submitted = job.report_submitted_at || job.updated_date;
      if (!submitted || new Date(submitted).getTime() > cutoff) continue;

      await base44.asServiceRole.entities.VetterJob.update(job.id, {
        status: "completed",
        payment_status: "released",
        auto_released: true,
      });

      if (job.vetter_email) {
        const profiles = await base44.asServiceRole.entities.VetterProfile.filter({ user_email: job.vetter_email });
        if (profiles[0]) {
          await base44.asServiceRole.entities.VetterProfile.update(profiles[0].id, {
            total_inspections: (profiles[0].total_inspections || 0) + 1,
          });
        }
        await base44.asServiceRole.entities.Notification.create({
          recipient_email: job.vetter_email,
          type: "status_change",
          title: "Payout released",
          body: `Your $${job.vetter_payout ?? ""} payout for this inspection has been released.`,
          link: "/earnings",
          read: false,
        });
      }

      if (job.buyer_email) {
        await base44.asServiceRole.entities.Notification.create({
          recipient_email: job.buyer_email,
          type: "status_change",
          title: "Inspection completed",
          body: "Your inspection was marked complete 48 hours after the report was delivered.",
          link: `/listings/${job.listing_id}/report`,
          read: false,
        });
      }
      released++;
    }

    return Response.json({ success: true, checked: waiting.length, released });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
