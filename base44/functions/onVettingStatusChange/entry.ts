import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { data, old_data } = body;

    if (!data?.buyer_email || !data?.status) {
      return Response.json({ skipped: true });
    }

    const statusLabels = {
      pending: "Pending",
      matched: "Vetter Matched! 🎉",
      scheduled: "Inspection Scheduled 📅",
      in_progress: "Inspection In Progress 🔍",
      completed: "Inspection Complete ✅",
      cancelled: "Request Cancelled",
    };

    const newStatus = data.status;
    const oldStatus = old_data?.status;

    if (newStatus === oldStatus) {
      return Response.json({ skipped: true, reason: "status unchanged" });
    }

    const label = statusLabels[newStatus] || newStatus;

    // Notify the buyer (in-app + email)
    await base44.asServiceRole.entities.Notification.create({
      recipient_email: data.buyer_email,
      type: "status_change",
      title: label,
      body: `Your request "${data.title}" status changed to: ${label}`,
      link: `/requests/${data.id}`,
      request_id: data.id,
      read: false,
    });

    const appUrl = "https://trust-vetter-check.base44.app";
    try {
      const isCompleted = newStatus === "completed";
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: data.buyer_email,
        subject: `${label} — "${data.title}"`,
        body: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a2a3a;">
            <h2 style="color: #4a7fa5;">${label}</h2>
            <p>Your vetting request <strong>"${data.title}"</strong> has been updated.</p>
            ${isCompleted ? `<p style="color: #2d8a6e; font-weight: 600;">✅ Your inspection report is ready to view!</p>` : ""}
            <p style="margin-top: 24px;">
              <a href="${appUrl}/requests/${data.id}"
                 style="background: #4a7fa5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">
                ${isCompleted ? "View Inspection Report →" : "View Request →"}
              </a>
            </p>
            <p style="margin-top: 32px; font-size: 12px; color: #aaa;">Vetter — Trusted marketplace verification.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Buyer email failed:", emailErr.message);
    }

    // Notify vetter when a job is assigned to them
    if (data.vetter_email && newStatus === "matched") {
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: data.vetter_email,
        type: "status_change",
        title: "New Job Request 🎯",
        body: `You've been matched to inspect: "${data.title}". Accept or decline in your Jobs tab.`,
        link: `/jobs`,
        request_id: data.id,
        read: false,
      });
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: data.vetter_email,
          subject: `New job request: "${data.title}"`,
          body: `
            <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a2a3a;">
              <h2 style="color: #4a7fa5;">🎯 New Job Request</h2>
              <p>You've been matched to inspect: <strong>"${data.title}"</strong></p>
              <p>Log in to accept or decline this job from your Jobs tab.</p>
              <p style="margin-top: 24px;">
                <a href="${appUrl}/jobs"
                   style="background: #4a7fa5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">
                  View Job →
                </a>
              </p>
              <p style="margin-top: 32px; font-size: 12px; color: #aaa;">Vetter — Trusted marketplace verification.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Vetter matched email failed:", emailErr.message);
      }
    }

    // Notify vetter when a scheduled job is confirmed
    if (data.vetter_email && newStatus === "scheduled" && oldStatus === "matched") {
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: data.vetter_email,
        type: "status_change",
        title: "Job Scheduled 📅",
        body: `Your inspection for "${data.title}" is now scheduled.`,
        link: `/jobs`,
        request_id: data.id,
        read: false,
      });
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: data.vetter_email,
          subject: `Job scheduled: "${data.title}"`,
          body: `
            <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a2a3a;">
              <h2 style="color: #4a7fa5;">📅 Job Scheduled</h2>
              <p>Your inspection for <strong>"${data.title}"</strong> is now confirmed and scheduled.</p>
              <p style="margin-top: 24px;">
                <a href="${appUrl}/jobs"
                   style="background: #4a7fa5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">
                  View Job →
                </a>
              </p>
              <p style="margin-top: 32px; font-size: 12px; color: #aaa;">Vetter — Trusted marketplace verification.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Vetter scheduled email failed:", emailErr.message);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});