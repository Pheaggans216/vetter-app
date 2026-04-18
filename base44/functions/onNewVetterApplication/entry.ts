import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { data } = body;

    if (!data?.user_email) {
      return Response.json({ skipped: true });
    }

    const applicantName = data.display_name || data.user_email;
    const signupDate = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true
    });

    // Find all admin users to notify
    const allUsers = await base44.asServiceRole.entities.User.list();
    const admins = allUsers.filter(u => u.role === "admin");

    // Create in-app notification for each admin
    for (const admin of admins) {
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: admin.email,
        type: "status_change",
        title: "New Vetter Application 🆕",
        body: `${applicantName} (${data.user_email}) submitted a vetter application on ${signupDate}.`,
        link: "/admin/vetters",
        request_id: data.id,
        read: false,
      });

      // Also send email notification to admin
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject: `New Vetter Application: ${applicantName}`,
        body: `
          <h2>New Vetter Application Received</h2>
          <p>A new vetter has completed their application and is awaiting review.</p>
          <table style="border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 6px 12px 6px 0; color: #666;"><strong>Name:</strong></td><td style="padding: 6px 0;">${applicantName}</td></tr>
            <tr><td style="padding: 6px 12px 6px 0; color: #666;"><strong>Email:</strong></td><td style="padding: 6px 0;">${data.user_email}</td></tr>
            <tr><td style="padding: 6px 12px 6px 0; color: #666;"><strong>Services:</strong></td><td style="padding: 6px 0;">${(data.service_types || []).join(", ") || "Not specified"}</td></tr>
            <tr><td style="padding: 6px 12px 6px 0; color: #666;"><strong>Location:</strong></td><td style="padding: 6px 0;">${[data.city, data.state].filter(Boolean).join(", ") || "Not specified"}</td></tr>
            <tr><td style="padding: 6px 12px 6px 0; color: #666;"><strong>Submitted:</strong></td><td style="padding: 6px 0;">${signupDate} ET</td></tr>
          </table>
          <p><a href="https://app.base44.com/admin/vetters" style="background: #4a7fa5; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 8px;">Review Application →</a></p>
        `,
      });
    }

    return Response.json({ success: true, notified: admins.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});