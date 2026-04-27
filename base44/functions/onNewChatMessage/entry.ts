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
    const allConversations = await base44.asServiceRole.entities.Conversation.list();
    const convo = allConversations.find(c => c.id === data.conversation_id);
    if (!convo?.participants) {
      return Response.json({ skipped: true, reason: "conversation not found" });
    }

    // Notify all participants except the sender
    const recipients = convo.participants.filter((p) => p !== data.sender_email);

    // Resolve sender display name once (outside the loop)
    let senderName = data.sender_email.split("@")[0];
    const vetterProfiles = await base44.asServiceRole.entities.VetterProfile.filter({ user_email: data.sender_email });
    if (vetterProfiles[0]?.display_name) {
      senderName = vetterProfiles[0].display_name;
    }

    const preview = data.message_type === "image"
      ? "📷 Sent an image"
      : data.content.slice(0, 80);

    for (const email of recipients) {
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: email,
        type: "new_message",
        title: `💬 ${senderName}`,
        body: preview,
        link: `/messages/${data.conversation_id}`,
        conversation_id: data.conversation_id,
        read: false,
      });

      // Email alert
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: `New message from ${senderName}`,
          body: `
            <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a2a3a;">
              <h2 style="color: #4a7fa5;">💬 New message from ${senderName}</h2>
              <p style="font-size: 15px; background: #f4f7fa; border-left: 4px solid #4a7fa5; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
                "${preview}"
              </p>
              <p style="margin-top: 24px;">
                <a href="https://trust-vetter-check.base44.app/messages/${data.conversation_id}"
                   style="background: #4a7fa5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">
                  View Message →
                </a>
              </p>
              <p style="margin-top: 32px; font-size: 12px; color: #aaa;">You're receiving this because you have an active conversation on Vetter.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Email send failed:", emailErr.message);
      }
    }

    return Response.json({ success: true, notified: recipients.length });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});