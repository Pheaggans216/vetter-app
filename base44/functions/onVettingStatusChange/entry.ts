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

    await base44.asServiceRole.entities.Notification.create({
      recipient_email: data.buyer_email,
      type: "status_change",
      title: label,
      body: `Your request "${data.title}" is now: ${label}`,
      link: `/requests/${data.id}`,
      request_id: data.id,
      read: false,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});