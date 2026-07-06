"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Trash2, Hash, Users, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "../../../supabase/client";
import {
  getTeamMessages,
  sendTeamMessage,
  deleteTeamMessage,
  markMessagesAsRead,
  type TeamMessage
} from "@/app/communication-actions";
import type { User } from "@supabase/supabase-js";

const PRIORITY_COLORS: Record<string, string> = {
  admin: "#0D9488",
  staff: "#6366F1",
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  } else if (diffDays === 1) {
    return `Yesterday ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
  } else {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({ name, url, role }: { name: string; url?: string; role?: string }) {
  const bg = PRIORITY_COLORS[role || "staff"] || "#64748B";
  if (url) {
    return (
      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
        <img src={url} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow-sm"
      style={{ background: bg }}
    >
      {getInitials(name)}
    </div>
  );
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px bg-[#E2E8F0]" />
      <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider px-2">{label}</span>
      <div className="flex-1 h-px bg-[#E2E8F0]" />
    </div>
  );
}

function getDateLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();
  if (d.toDateString() === today) return "Today";
  if (d.toDateString() === yesterday) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

interface TeamChatPanelProps {
  user: User;
  userRole: string;
}

export default function TeamChatPanel({ user, userRole }: TeamChatPanelProps) {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isFirstLoad = useRef(true);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  const loadMessages = useCallback(async (scroll = false) => {
    const { data, error: err } = await getTeamMessages(80);
    if (!err) {
      // Find unread messages from others
      const unreads = data.filter(
        (m) => m.sender_id !== user.id && !m.reads?.some((r) => r.user_id === user.id)
      );

      if (unreads.length > 0) {
        // Keep in unreadIds set so they show a badge temporarily
        setUnreadIds((prev) => {
          const next = new Set(prev);
          unreads.forEach((u) => next.add(u.id));
          return next;
        });

        // Trigger asynchronous mark as read
        const unreadMsgIds = unreads.map((u) => u.id);
        markMessagesAsRead(unreadMsgIds);

        // Optimistically add read status for ourselves locally
        data.forEach((m) => {
          if (unreadMsgIds.includes(m.id)) {
            if (!m.reads) m.reads = [];
            if (!m.reads.some((r) => r.user_id === user.id)) {
              m.reads.push({ user_id: user.id, full_name: "You" });
            }
          }
        });
      }

      setMessages(data);

      if (scroll || isFirstLoad.current) {
        isFirstLoad.current = false;
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
      }
    }
    setLoading(false);
  }, [user.id]);

  // Initial load
  useEffect(() => {
    loadMessages(true);
  }, [loadMessages]);

  // Clear unread badges after 4 seconds
  useEffect(() => {
    if (unreadIds.size > 0) {
      const timer = setTimeout(() => {
        setUnreadIds(new Set());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [unreadIds]);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("team-chat-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "team_messages" },
        () => {
          // Fetch fresh messages to get the joined sender profile
          loadMessages(true);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "team_messages" },
        () => {
          loadMessages(false);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "team_message_reads" },
        () => {
          // Live reload reads to display team names
          loadMessages(false);
        }
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    channelRef.current = channel;

    // Polling fallback every 15s in case realtime fails
    const interval = setInterval(() => loadMessages(false), 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user.id, loadMessages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);
    setInput("");

    const { error: sendError } = await sendTeamMessage(trimmed);
    if (sendError) {
      setError(sendError);
      setInput(trimmed); // restore
    } else {
      await loadMessages(true);
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async (msgId: string) => {
    await deleteTeamMessage(msgId);
    await loadMessages(false);
  };

  // Group messages by date with dividers
  const grouped: Array<{ type: "divider"; label: string } | { type: "message"; msg: TeamMessage }> = [];
  let lastDate = "";
  for (const msg of messages) {
    const label = getDateLabel(msg.created_at);
    if (label !== lastDate) {
      grouped.push({ type: "divider", label });
      lastDate = label;
    }
    grouped.push({ type: "message", msg });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] min-h-[500px] bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0D9488]/10 flex items-center justify-center">
            <Hash size={16} className="text-[#0D9488]" />
          </div>
          <div>
            <h2 className="font-bold text-[#0F172A] text-sm" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Team Chat
            </h2>
            <p className="text-[10px] text-[#64748B]">Internal staff channel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-[#64748B] font-medium">{onlineCount} online</span>
          </div>
          <button
            onClick={() => loadMessages(false)}
            className="p-1.5 text-[#94A3B8] hover:text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Notice bar */}
      <div className="flex items-center gap-2 px-5 py-2 bg-[#0D9488]/5 border-b border-[#0D9488]/10 flex-shrink-0">
        <Users size={12} className="text-[#0D9488]" />
        <span className="text-[11px] text-[#0D9488] font-medium">
          This is a shared channel visible to all admin and staff members. Messages are not private.
        </span>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-0.5">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 size={28} className="text-[#0D9488] animate-spin mx-auto mb-3" />
              <p className="text-[#94A3B8] text-sm">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-14 h-14 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Hash size={24} className="text-[#CBD5E1]" />
              </div>
              <p className="text-[#64748B] text-sm font-medium">No messages yet</p>
              <p className="text-[#94A3B8] text-xs mt-1">Be the first to say hello to the team!</p>
            </div>
          </div>
        ) : (
          <>
            {grouped.map((item, idx) => {
              if (item.type === "divider") {
                return <DateDivider key={`div-${idx}`} label={item.label} />;
              }
              const { msg } = item;
              const isOwn = msg.sender_id === user.id;
              const senderName = msg.sender?.full_name || "Unknown";
              const senderRole = msg.sender?.role || "staff";

              // Filter out the sender's own name from read receipt display
              const seenList = (msg.reads || [])
                .filter((r) => r.user_id !== msg.sender_id)
                .map((r) => (r.user_id === user.id ? "You" : r.full_name));

              return (
                <div
                  key={msg.id}
                  className="group flex items-start gap-2.5 py-1 px-2 rounded-lg hover:bg-[#F8FAFC] transition-colors"
                >
                  <Avatar name={senderName} url={msg.sender?.avatar_url} role={senderRole} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        className="text-[13px] font-semibold leading-tight"
                        style={{ color: PRIORITY_COLORS[senderRole] || "#0F172A" }}
                      >
                        {isOwn ? "You" : senderName}
                      </span>
                      {senderRole === "admin" && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-[#0D9488]/10 text-[#0D9488] rounded">
                          Admin
                        </span>
                      )}
                      <span className="text-[10px] text-[#94A3B8] font-normal">{formatTime(msg.created_at)}</span>
                      {unreadIds.has(msg.id) && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-rose-500 text-white rounded animate-pulse">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-[#334155] leading-relaxed mt-0.5 whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>

                    {/* Seen by indicator */}
                    {seenList.length > 0 && (
                      <div className="text-[10px] text-[#94A3B8] mt-0.5 flex items-center gap-1.5 select-none font-medium">
                        <span className="w-1 h-1 rounded-full bg-emerald-500/70" />
                        <span>Seen by: {seenList.join(", ")}</span>
                      </div>
                    )}
                  </div>
                  {/* Delete button — own messages or admin */}
                  {(isOwn || userRole === "admin") && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#CBD5E1] hover:text-rose-400 hover:bg-rose-50 rounded transition-all flex-shrink-0"
                      title="Delete message"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Error bar */}
      {error && (
        <div className="flex items-center gap-2 px-5 py-2 bg-rose-50 border-t border-rose-100 flex-shrink-0">
          <AlertCircle size={13} className="text-rose-500" />
          <span className="text-xs text-rose-600">{error}</span>
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex-shrink-0">
        <div className="flex items-end gap-2.5 bg-white border border-[#E2E8F0] rounded-xl px-3 py-2.5 focus-within:border-[#0D9488] focus-within:ring-2 focus-within:ring-[#0D9488]/10 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message the team... (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none min-h-[22px] max-h-28 leading-relaxed"
            style={{ overflowY: input.split("\n").length > 3 ? "auto" : "hidden" }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 112) + "px";
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex-shrink-0 w-8 h-8 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-[#CBD5E1] disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        <p className="text-[10px] text-[#94A3B8] mt-1.5 px-1">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
