import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { data } = body;

    if (!data?.conversation_id || !data?.sender_email || !data?.content) {
      return Response.json({ skipped: true });
    }

    // Fetch the conversation to find recipients
    const conversations = await base44.asServiceRole.entities.Conversation.filter({
      id: data.conversation_id,
    });

    const convo = conversations[0];
    if (!convo?.participants) {
      return Response.json({ skipped: true, reason: "conversation not found" });
    }

    // Notify all participants except the sender
    const recipients = convo.participants.filter((p) => p !== data.sender_email);

    for (const email of recipients) {
      // Try to get vetter display name for a friendlier notification body
      let senderName = data.sender_email.split("@")[0];
      const vetterProfiles = await base44.asServiceRole.entities.VetterProfile.filter({ user_email: data.sender_email });
      if (vetterProfiles[0]?.display_name) {
        senderName = vetterProfiles[0].display_name;
      }

      const preview = data.message_type === "image"
        ? "📷 Sent an image"
        : data.content.slice(0, 80);

      await base44.asServiceRole.entities.Notification.create({
        recipient_email: email,
        type: "new_message",
        title: `💬 ${senderName}`,
        body: preview,
        link: `/messages/${data.conversation_id}`,
        conversation_id: data.conversation_id,
        read: false,
      });
    }

    return Response.json({ success: true, notified: recipients.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});