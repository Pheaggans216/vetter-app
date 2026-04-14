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

    // Notify the buyer
    await base44.asServiceRole.entities.Notification.create({
      recipient_email: data.buyer_email,
      type: "status_change",
      title: label,
      body: `Your request "${data.title}" is now: ${label}`,
      link: `/requests/${data.id}`,
      request_id: data.id,
      read: false,
    });

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
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});