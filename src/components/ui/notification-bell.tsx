"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, MailOpen, AlertCircle } from "lucide-react";
import {
  getMyNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification
} from "@/app/notification-actions";
import { createClient } from "../../../supabase/client";

export default function NotificationBell({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const { data, unreadCount: count } = await getMyNotifications(8);
      setNotifications(data || []);
      setUnreadCount(count || 0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new notifications in real-time
    const supabase = createClient();
    const channel = supabase
      .channel("realtime-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markNotificationRead(id);
    await fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    await fetchNotifications();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(id);
    await fetchNotifications();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full select-none animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 text-xs text-[#0F172A]">
          <div className="p-3 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <span className="font-bold">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] text-[#0D9488] font-bold hover:underline flex items-center gap-1"
              >
                <MailOpen size={10} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell size={24} className="mx-auto mb-1.5 opacity-20" />
                <p>No new updates.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    setIsOpen(false);
                    if (n.link && onNavigate) onNavigate(n.link);
                  }}
                  className={`p-3 hover:bg-slate-50/50 cursor-pointer transition-colors ${!n.is_read ? "bg-teal-50/10 font-medium" : ""}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{n.title}</span>
                    <div className="flex gap-1 shrink-0">
                      {!n.is_read && (
                        <button
                          onClick={(e) => handleMarkRead(n.id, e)}
                          className="p-1 hover:bg-slate-100 rounded text-[#0D9488]"
                          title="Mark read"
                        >
                          <Check size={11} />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(n.id, e)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-500"
                        title="Delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">{n.message}</p>
                  <span className="text-[9px] text-slate-400 mt-1 block">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 border-t text-center bg-slate-50 dark:bg-slate-800/30">
            <button
              onClick={() => {
                setIsOpen(false);
                if (onNavigate) onNavigate("notifications");
              }}
              className="text-[#0D9488] font-bold hover:underline"
            >
              See all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
