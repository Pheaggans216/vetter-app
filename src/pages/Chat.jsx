import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft, Send } from "lucide-react";
import ChatBubble from "@/components/chat/ChatBubble";

export default function Chat() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const bottomRef = useRef();
  const inputRef = useRef();

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => base44.entities.Conversation.filter({ id: conversationId }),
  });
  const conversation = conversations[0];

  const otherParticipant = conversation?.participants?.find((p) => p !== user?.email) || "";

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

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      const msg = await base44.entities.ChatMessage.create({
        conversation_id: conversationId,
        sender_email: user.email,
        content,
        message_type: "text",
        read: false,
      });
      await base44.entities.Conversation.update(conversationId, {
        last_message: content,
        last_message_at: new Date().toISOString(),
        unread_count: 1,
      });
      return msg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", conversationId] });
    },
  });

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sendMutation.isPending) return;
    setText("");
    sendMutation.mutate(trimmed);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border/60 shrink-0">
        <Link to="/messages">
          <button className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-primary font-bold text-[14px]">
            {otherParticipant?.[0]?.toUpperCase() || "?"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-foreground text-[14px] truncate">{otherParticipant}</p>
          {conversation?.request_id && (
            <Link to={`/requests/${conversation.request_id}`}>
              <p className="text-[11px] text-primary truncate hover:underline">View Request →</p>
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
            <p className="text-[13px] text-muted-foreground">No messages yet. Say hello! 👋</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} isOwn={msg.sender_email === user?.email} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-3 border-t border-border/60 bg-card flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 resize-none px-4 py-2.5 rounded-2xl border border-border bg-background text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 max-h-32 transition"
          style={{ minHeight: "44px" }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}