import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { data, old_data } = body;

    const newStatus = data?.status;
    const oldStatus = old_data?.status;

    // Only send if transitioning TO active/approved FROM something else
    const isNowApproved = newStatus === "active" || newStatus === "approved";
    const wasAlreadyApproved = oldStatus === "active" || oldStatus === "approved";

    if (!isNowApproved || wasAlreadyApproved) {
      return Response.json({ skipped: true, reason: "Status not transitioning to approved" });
    }

    const userEmail = data?.user_email;
    const userName = data?.display_name || userEmail;

    if (!userEmail) {
      return Response.json({ skipped: true, reason: "No user email found" });
    }

    await base44.asServiceRole.entities.Notification.create({
      recipient_email: userEmail,
      type: "status_change",
      title: "You're approved! 🎉",
      body: "You're approved! Start browsing jobs now.",
      link: "/jobs",
      read: false,
    });

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail,
      subject: "You're Approved on Vetter 🎉",
      body: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a2a3a;">
          <h2 style="color: #4a7fa5;">You're approved as a Vetter! 🎉</h2>
          <p>Hi ${userName},</p>
          <p>Great news — your Vetter application has been reviewed and approved. You can now start accepting jobs and earning on the platform.</p>
          <h3 style="margin-bottom: 8px;">You can now:</h3>
          <ul style="padding-left: 20px; line-height: 1.8;">
            <li>Browse available jobs</li>
            <li>Accept inspection requests</li>
            <li>Start earning</li>
          </ul>
          <p style="margin-top: 24px;">
            <a href="https://trust-vetter-check.base44.app/" style="background: #4a7fa5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">
              Log In & Get Started →
            </a>
          </p>
          <p style="margin-top: 32px; font-size: 13px; color: #888;">Welcome to the Vetter team!</p>
        </div>
      `,
    });

    return Response.json({ success: true, emailSent: userEmail });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});