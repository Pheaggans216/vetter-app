import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { data } = body;

    if (!data?.request_id || !data?.buyer_email) {
      return Response.json({ skipped: true });
    }

    // Fetch the request title
    const allRequests = await base44.asServiceRole.entities.VettingRequest.list();
    const request = allRequests.find(r => r.id === data.request_id);
    const title = request?.title || "your item";

    const appUrl = "https://trust-vetter-check.base44.app";
    const reportLink = `${appUrl}/requests/${data.request_id}/report`;

    // In-app notification
    await base44.asServiceRole.entities.Notification.create({
      recipient_email: data.buyer_email,
      type: "status_change",
      title: "Inspection Report Ready ✅",
      body: `Your inspection report for "${title}" is ready to view.`,
      link: `/requests/${data.request_id}/report`,
      request_id: data.request_id,
      read: false,
    });

    // Email alert
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: data.buyer_email,
        subject: `Your inspection report is ready — "${title}"`,
        body: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a2a3a;">
            <h2 style="color: #4a7fa5;">✅ Inspection Report Ready</h2>
            <p>Your Vetter has completed the inspection for <strong>"${title}"</strong> and submitted their report.</p>
            <p>The report includes:</p>
            <ul style="padding-left: 20px; line-height: 1.8; color: #444;">
              <li>Overall item condition</li>
              <li>Inspection checklist results</li>
              <li>Vetter recommendation (Buy / Negotiate / Pass)</li>
              <li>Photo evidence</li>
              <li>Red flags (if any)</li>
            </ul>
            <p style="margin-top: 24px;">
              <a href="${reportLink}"
                 style="background: #4a7fa5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">
                View Full Report →
              </a>
            </p>
            <p style="margin-top: 32px; font-size: 12px; color: #aaa;">Vetter — Trusted marketplace verification.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Report email failed:", emailErr.message);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});