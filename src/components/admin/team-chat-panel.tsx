"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Send, Trash2, Hash, Users, RefreshCw, Loader2, AlertCircle,
  Plus, MessageSquare, Search, Pin, User, Image, FileUp, PinOff, X
} from "lucide-react";
import { createClient } from "../../../supabase/client";
import {
  getChannels, createChannel, getChannelMessages, sendChannelMessage,
  getDirectMessages, sendDirectMessage, pinMessage, unpinMessage
} from "@/app/chat-actions";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type Channel = {
  id: string;
  name: string;
  is_private: boolean;
};

type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: string;
};

type ChatMsg = {
  id: string;
  sender_id: string;
  content: string;
  file_url?: string;
  file_type?: string;
  is_pinned: boolean;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
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
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

export default function TeamChatPanel({ user, userRole }: { user: SupabaseUser; userRole: string }) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<{ type: "channel" | "dm"; id: string }>({ type: "channel", id: "general" });
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  // Modal for creating channel
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelPrivate, setNewChannelPrivate] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadChannelsAndProfiles = useCallback(async () => {
    try {
      const supabase = createClient();
      const [chanRes, profsRes] = await Promise.all([
        getChannels(),
        supabase.from("profiles").select("id, full_name, email, avatar_url, role").eq("status", "active").order("full_name")
      ]);
      setChannels((chanRes.data as Channel[]) || []);
      setProfiles((profsRes.data as Profile[]) || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab.type === "channel") {
        // Resolve target channel
        const currentChannel = channels.find(c => c.id === activeTab.id || c.name === activeTab.id);
        if (currentChannel) {
          const { data } = await getChannelMessages(currentChannel.id);
          setMessages((data as ChatMsg[]) || []);
        } else {
          // Fallback if channel list not loaded yet
          const { data } = await getChannelMessages(activeTab.id);
          setMessages((data as ChatMsg[]) || []);
        }
      } else {
        const { data } = await getDirectMessages(activeTab.id);
        setMessages((data as ChatMsg[]) || []);
      }
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab, channels]);

  // Initial load
  useEffect(() => {
    loadChannelsAndProfiles();
  }, [loadChannelsAndProfiles]);

  useEffect(() => {
    loadMessages();
  }, [activeTab, loadMessages]);

  // Real-time listener
  useEffect(() => {
    const supabase = createClient();
    const table = activeTab.type === "channel" ? "team_messages" : "direct_messages";

    const channel = supabase
      .channel("chat-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table },
        () => {
          loadMessages();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, loadMessages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setInput("");

    try {
      if (activeTab.type === "channel") {
        const currentChannel = channels.find(c => c.id === activeTab.id || c.name === activeTab.id);
        const targetId = currentChannel ? currentChannel.id : activeTab.id;
        await sendChannelMessage(targetId, trimmed);
      } else {
        await sendDirectMessage(activeTab.id, trimmed);
      }
      await loadMessages();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleCreateChannelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    try {
      const { data } = await createChannel(newChannelName, newChannelPrivate);
      if (data) {
        setNewChannelName("");
        setShowCreateChannel(false);
        await loadChannelsAndProfiles();
        setActiveTab({ type: "channel", id: data.id });
      }
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handlePinToggle = async (msg: ChatMsg) => {
    try {
      const isChannel = activeTab.type === "channel";
      if (msg.is_pinned) {
        await unpinMessage(msg.id, isChannel);
      } else {
        await pinMessage(msg.id, isChannel);
      }
      await loadMessages();
    } catch (e) {
      console.error(e);
    }
  };

  const activeLabel = () => {
    if (activeTab.type === "channel") {
      const chan = channels.find(c => c.id === activeTab.id || c.name === activeTab.id);
      return `# ${chan?.name || activeTab.id}`;
    } else {
      const contact = profiles.find(p => p.id === activeTab.id);
      return contact?.full_name || "Direct Message";
    }
  };

  const filteredMessages = messages.filter(m => {
    const matchSearch = !searchQuery || m.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPinned = !showPinnedOnly || m.is_pinned;
    return matchSearch && matchPinned;
  });

  const leadershipRoles = ["super_admin", "admin", "hr_manager", "project_manager", "team_lead"];
  const channelAdminRoles = ["super_admin", "admin", "hr_manager", "project_manager"];
  const isLeadershipUser = leadershipRoles.includes(userRole);
  const canCreateChannel = channelAdminRoles.includes(userRole);

  // Filter profiles for DM section: if current user is not leadership, only show leadership contacts
  const visibleDMProfiles = profiles.filter(p => {
    if (p.id === user.id) return false;
    if (isLeadershipUser) return true;
    return leadershipRoles.includes(p.role);
  });

  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[500px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs text-[#0F172A] font-sans">
      {/* Sidebar List (Channels & DMs) */}
      <div className="w-56 border-r border-slate-200 flex flex-col justify-between shrink-0 bg-slate-50">
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Channels Header */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Group Channels</span>
              {canCreateChannel && (
                <button onClick={() => setShowCreateChannel(true)} className="p-0.5 hover:bg-slate-200 rounded text-slate-600" title="Create Channel">
                  <Plus size={13} />
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {channels.map(chan => (
                <button
                  key={chan.id}
                  onClick={() => setActiveTab({ type: "channel", id: chan.id })}
                  className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition-colors ${activeTab.type === "channel" && activeTab.id === chan.id ? "bg-[#0D9488] text-white font-semibold" : "text-slate-600 hover:bg-slate-200/50"}`}
                >
                  <Hash size={13} />
                  <span>{chan.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* DMs Header */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Direct Messages</span>
            </div>
            <div className="space-y-0.5">
              {visibleDMProfiles.length === 0 ? (
                <p className="px-2 py-1 text-[11px] text-slate-400 italic">No contacts available</p>
              ) : (
                visibleDMProfiles.map(contact => {
                  const isContactLeadership = leadershipRoles.includes(contact.role);
                  return (
                    <button
                      key={contact.id}
                      onClick={() => setActiveTab({ type: "dm", id: contact.id })}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors ${activeTab.type === "dm" && activeTab.id === contact.id ? "bg-[#0D9488] text-white font-semibold" : "text-slate-600 hover:bg-slate-200/50"}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center shrink-0 text-[9px] font-bold">
                          {contact.avatar_url ? (
                            <img src={contact.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            contact.full_name.charAt(0)
                          )}
                        </div>
                        <span className="truncate">{contact.full_name}</span>
                      </div>
                      {isContactLeadership && (
                        <span className={`text-[8px] font-bold px-1 py-0.2 rounded uppercase shrink-0 ${activeTab.type === "dm" && activeTab.id === contact.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                          {contact.role === "super_admin" || contact.role === "admin" ? "Admin" : contact.role === "hr_manager" ? "HR" : contact.role === "project_manager" ? "PM" : "TL"}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden bg-white">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              {activeLabel()}
            </span>
          </div>

          <div className="flex gap-2 items-center">
            {/* Search Input */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-7 pr-2.5 py-1 rounded-lg border text-[11px] focus:outline-none bg-transparent"
              />
            </div>

            <button
              onClick={() => setShowPinnedOnly(!showPinnedOnly)}
              className={`p-1.5 rounded-lg border flex items-center gap-1 font-semibold ${showPinnedOnly ? 'bg-amber-50 border-amber-200 text-amber-600' : 'text-slate-500'}`}
              title="Filter Pinned"
            >
              <Pin size={12} />
            </button>
          </div>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400">Loading messages...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <MessageSquare size={24} className="opacity-20 mx-auto mb-1.5" />
              <p>No messages matching query.</p>
            </div>
          ) : (
            filteredMessages.map(msg => {
              const isOwn = msg.sender_id === user.id;
              const sender = msg.sender || profiles.find(p => p.id === msg.sender_id);
              return (
                <div key={msg.id} className="flex gap-2.5 items-start group">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-[9px] font-bold shrink-0">
                    {sender?.avatar_url ? (
                      <img src={sender.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      sender?.full_name?.charAt(0) || "?"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-slate-800">{sender?.full_name || "Unknown"}</span>
                      <span className="text-[9px] text-slate-400">{formatTime(msg.created_at)}</span>
                      {msg.is_pinned && <Pin size={10} className="text-amber-500 fill-amber-500 shrink-0" />}
                    </div>
                    <p className="text-slate-700 leading-snug mt-0.5 font-sans break-words whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Actions */}
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 shrink-0">
                    <button
                      onClick={() => handlePinToggle(msg)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-amber-500"
                      title={msg.is_pinned ? "Unpin message" : "Pin message"}
                    >
                      {msg.is_pinned ? <PinOff size={12} /> : <Pin size={12} />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Textbox Area */}
        <div className="p-3 border-t bg-slate-50 shrink-0">
          <div className="flex items-end gap-2 bg-white border rounded-xl p-2 focus-within:border-[#0D9488] transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type message here..."
              rows={1}
              className="flex-1 outline-none text-xs bg-transparent resize-none leading-relaxed py-1"
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="p-1.5 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] disabled:opacity-50"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Create Channel Modal Dialog */}
      {showCreateChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl border shadow-xl max-w-sm w-full overflow-hidden text-xs">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-sm">Create Chat Channel</h3>
              <button onClick={() => setShowCreateChannel(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleCreateChannelSubmit} className="p-4 space-y-4">
              <div>
                <label className="block font-semibold mb-1">Channel Name *</label>
                <input
                  type="text" required placeholder="e.g. creative-sprint"
                  value={newChannelName}
                  onChange={e => setNewChannelName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox" checked={newChannelPrivate} onChange={e => setNewChannelPrivate(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>Set as Private Channel (Only invited members can view)</span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowCreateChannel(false)} className="px-4 py-2 border rounded-lg font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#0D9488] text-white font-semibold rounded-lg hover:bg-[#0F766E]">
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
