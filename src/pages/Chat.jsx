import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft, Send, Paperclip, X, FileImage } from "lucide-react";
import ChatBubble from "@/components/chat/ChatBubble";
import RequestContextBanner from "@/components/chat/RequestContextBanner";

export default function Chat() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [attachedFile, setAttachedFile] = useState(null); // { url, type, name }
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef();
  const inputRef = useRef();
  const fileInputRef = useRef();

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => base44.entities.Conversation.filter({ id: conversationId }),
  });
  const conversation = conversations[0];
  const otherParticipant = conversation?.participants?.find((p) => p !== user?.email) || "";

  // Fetch vetter profile to show display name
  const { data: vetterProfiles = [] } = useQuery({
    queryKey: ["vetter-profile-chat", otherParticipant],
    queryFn: () => base44.entities.VetterProfile.filter({ user_email: otherParticipant }),
    enabled: !!otherParticipant,
  });
  const vetterProfile = vetterProfiles[0];
  const displayName = vetterProfile?.display_name || otherParticipant;
  const avatarUrl = vetterProfile?.avatar_url;
  const avatarInitial = displayName?.[0]?.toUpperCase() || "?";

  const { data: messages = [] } = useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: () => base44.entities.ChatMessage.filter({ conversation_id: conversationId }, "created_date"),
  });

  // Real-time subscription
  useEffect(() => {
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.conversation_id === conversationId) {
        queryClient.invalidateQueries({ queryKey: ["chat-messages", conversationId] });
      }
    });
    return unsub;
  }, [conversationId, queryClient]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark unread messages as read
  useEffect(() => {
    if (!messages.length || !user?.email) return;
    const unread = messages.filter((m) => !m.read && m.sender_email !== user.email);
    unread.forEach((m) => base44.entities.ChatMessage.update(m.id, { read: true }));
    if (unread.length > 0) {
      base44.entities.Conversation.update(conversationId, { unread_count: 0 });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  }, [messages, user?.email]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const isImage = file.type.startsWith("image/");
    setAttachedFile({ url: file_url, type: isImage ? "image" : "file", name: file.name });
    setUploading(false);
    e.target.value = "";
  };

  const sendMutation = useMutation({
    mutationFn: async ({ content, attachment }) => {
      let msgContent = content;
      let msgType = "text";

      if (attachment) {
        if (attachment.type === "image") {
          msgContent = attachment.url;
          msgType = "image";
        } else {
          // file: send as text with URL
          msgContent = content
            ? `${content}\n📎 ${attachment.name}: ${attachment.url}`
            : `📎 ${attachment.name}: ${attachment.url}`;
        }
      }

      const msg = await base44.entities.ChatMessage.create({
        conversation_id: conversationId,
        sender_email: user.email,
        content: msgContent,
        message_type: msgType,
        read: false,
      });
      await base44.entities.Conversation.update(conversationId, {
        last_message: attachment ? (content || `📎 ${attachment.name}`) : content,
        last_message_at: new Date().toISOString(),
        unread_count: 1,
      });
      return msg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", conversationId] });
      setAttachedFile(null);
    },
  });

  const handleSend = () => {
    const trimmed = text.trim();
    if ((!trimmed && !attachedFile) || sendMutation.isPending || uploading) return;
    setText("");
    sendMutation.mutate({ content: trimmed, attachment: attachedFile });
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border/60 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary font-bold text-[14px]">{avatarInitial}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-foreground text-[14px] truncate">{displayName}</p>
          <p className="text-[11px] text-muted-foreground">Tap to view profile</p>
        </div>
        {vetterProfile && (
          <Link to={`/vetters/${vetterProfile.id}`}>
            <button className="text-[12px] text-primary font-medium px-3 py-1.5 rounded-xl border border-primary/20 hover:bg-primary/5 transition-colors">
              Profile
            </button>
          </Link>
        )}
      </div>

      {/* Request context banner */}
      {conversation?.request_id && (
        <RequestContextBanner requestId={conversation.request_id} />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60 pb-8">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <Send className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-[13px] text-muted-foreground font-medium">No messages yet</p>
            <p className="text-[12px] text-muted-foreground mt-1">Say hello and start coordinating!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const prev = messages[i - 1];
          const showAvatar = !prev || prev.sender_email !== msg.sender_email;
          return (
            <ChatBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_email === user?.email}
              showAvatar={showAvatar}
              senderName={msg.sender_email !== user?.email ? displayName : undefined}
              senderAvatar={msg.sender_email !== user?.email ? avatarUrl : undefined}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Attachment preview */}
      {attachedFile && (
        <div className="mx-4 mb-2 px-3 py-2 bg-muted/60 rounded-xl border border-border/60 flex items-center gap-2">
          {attachedFile.type === "image" ? (
            <img src={attachedFile.url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
              <FileImage className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          <span className="text-[12px] text-foreground truncate flex-1">{attachedFile.name || "Attachment"}</span>
          <button onClick={() => setAttachedFile(null)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 px-4 py-3 border-t border-border/60 bg-card flex items-end gap-2">
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx" />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-10 h-10 rounded-xl border border-border flex items-center justify-center shrink-0 hover:bg-muted transition-colors disabled:opacity-40"
        >
          <Paperclip className="w-4 h-4 text-muted-foreground" />
        </button>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          placeholder={uploading ? "Uploading…" : "Type a message…"}
          rows={1}
          disabled={uploading}
          className="flex-1 resize-none px-4 py-2.5 rounded-2xl border border-border bg-background text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 max-h-32 transition disabled:opacity-50"
          style={{ minHeight: "44px" }}
        />
        <button
          onClick={handleSend}
          disabled={(!text.trim() && !attachedFile) || sendMutation.isPending || uploading}
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}