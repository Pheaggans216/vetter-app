import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Runs daily — finds scheduled inspections happening tomorrow and sends reminders
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0]; // YYYY-MM-DD

    const scheduled = await base44.asServiceRole.entities.VettingRequest.filter({
      status: "scheduled",
      scheduled_date: tomorrowStr,
    });

    if (scheduled.length === 0) {
      return Response.json({ success: true, reminded: 0 });
    }

    let reminded = 0;

    for (const job of scheduled) {
      const timeStr = job.scheduled_time ? ` at ${job.scheduled_time}` : "";

      // Notify buyer
      if (job.buyer_email) {
        await base44.asServiceRole.entities.Notification.create({
          recipient_email: job.buyer_email,
          type: "status_change",
          title: "Inspection Tomorrow 📅",
          body: `Your inspection for "${job.title}" is scheduled for tomorrow${timeStr}. Make sure you're available!`,
          link: `/requests/${job.id}`,
          request_id: job.id,
          read: false,
        });
      }

      // Notify vetter
      if (job.vetter_email) {
        await base44.asServiceRole.entities.Notification.create({
          recipient_email: job.vetter_email,
          type: "status_change",
          title: "Job Tomorrow 📅",
          body: `You have an inspection for "${job.title}" scheduled for tomorrow${timeStr}.`,
          link: `/jobs`,
          request_id: job.id,
          read: false,
        });
      }

      reminded++;
    }

    return Response.json({ success: true, reminded });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});