"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellDot, RefreshCw, ChevronRight, Clock, AlertCircle } from "lucide-react";
import { getAnnouncements, markAnnouncementRead } from "@/app/attendance-actions";
import type { StaffAnnouncement } from "@/types/erp";
import { createClient } from "../../../supabase/client";

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "bg-gray-100 text-gray-600" },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

const TYPE_CONFIG = {
  announcement: { label: "Announcement", icon: Bell },
  meeting: { label: "Meeting", icon: Clock },
  urgent: { label: "Urgent", icon: AlertCircle },
};

export default function AnnouncementsPanel({ userId }: { userId: string }) {
  const [announcements, setAnnouncements] = useState<StaffAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getAnnouncements(userId);
    setAnnouncements((data as StaffAnnouncement[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("ann-staff")
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_announcements" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const handleExpand = async (ann: StaffAnnouncement) => {
    setExpanded(expanded === ann.id ? null : ann.id);
    if (!ann.is_read) {
      await markAnnouncementRead(ann.id, userId);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === ann.id ? { ...a, is_read: true } : a))
      );
    }
  };

  const unreadCount = announcements.filter((a) => !a.is_read).length;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
      <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {unreadCount > 0 ? (
            <BellDot size={20} className="text-[#0D9488]" />
          ) : (
            <Bell size={20} className="text-[#94A3B8]" />
          )}
          <h3 className="font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Updates
          </h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full select-none animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={load}
          className="p-1.5 text-[#94A3B8] hover:text-[#0D9488] hover:bg-[#F0FDFA] rounded-lg transition-colors"
        >
          <RefreshCw size={14} />
        </button>
      </div>
      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center">
          <Bell size={24} className="text-[#CBD5E1] mx-auto mb-2" />
          <p className="text-sm text-[#94A3B8]">No updates from admin yet</p>
        </div>
      ) : (
        <div className="divide-y divide-[#F8FAFC]">
          {announcements.map((ann) => {
            const TypeIcon = TYPE_CONFIG[ann.type as keyof typeof TYPE_CONFIG]?.icon || Bell;
            const isExpanded = expanded === ann.id;
            return (
              <div key={ann.id} className={ann.is_read ? "bg-white" : "bg-[#F0FDFA]/40"}>
                <button
                  onClick={() => handleExpand(ann)}
                  className="w-full p-4 flex items-start gap-3 text-left hover:bg-[#F8FAFC] transition-all duration-150"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      ann.priority === "urgent"
                        ? "bg-red-100"
                        : ann.priority === "high"
                          ? "bg-orange-100"
                          : "bg-[#F0FDFA]"
                    }`}
                  >
                    <TypeIcon
                      size={15}
                      className={
                        ann.priority === "urgent"
                          ? "text-red-600"
                          : ann.priority === "high"
                            ? "text-orange-600"
                            : "text-[#0D9488]"
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#0F172A]">{ann.title}</span>
                      {!ann.is_read && <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                          PRIORITY_CONFIG[ann.priority as keyof typeof PRIORITY_CONFIG]?.color ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {ann.priority}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5 truncate">{ann.body}</p>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5 font-medium">
                      {new Date(ann.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {ann.creator && ` · ${ann.creator.full_name}`}
                    </p>
                  </div>
                  <ChevronRight
                    size={13}
                    className={`text-[#94A3B8] shrink-0 mt-1 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  />
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 ml-11">
                    <div className="bg-[#F8FAFC] rounded-xl p-3 text-sm text-[#475569] whitespace-pre-wrap border border-[#E2E8F0] leading-relaxed">
                      {ann.body}
                    </div>
                    {ann.scheduled_date && (
                      <p className="text-xs text-[#64748B] mt-2 flex items-center gap-1.5">
                        <Clock size={11} /> Scheduled: <strong>{ann.scheduled_date}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
