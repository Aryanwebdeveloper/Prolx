"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, Users } from "lucide-react";
import { createClient } from "../../../supabase/client";

type CalEvent = {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  start_time?: string;
  location?: string; // UI only, mapped to description
  created_by?: string;
  event_type?: string; // 'holiday', 'birthday', 'anniversary', 'interview', 'meeting', 'deadline', 'announcement', 'milestone', 'other'
};

const EVENT_COLORS: Record<string, string> = {
  holiday: "#0D9488",
  meeting: "#3B82F6",
  interview: "#8B5CF6",
  announcement: "#F97316",
  milestone: "#EAB308",
  deadline: "#EF4444",
  birthday: "#EC4899",
  anniversary: "#D946EF",
  other: "#64748B",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPanel({ userRole = "admin" }: { userRole?: string }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", start_time: "", location: "", type: "meeting" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const canAddEvents = ["super_admin", "admin", "hr_manager", "project_manager"].includes(userRole);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const startOf = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`;
      const endOf = new Date(viewYear, viewMonth + 1, 0);
      const endStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(endOf.getDate()).padStart(2, "0")}`;

      const { data } = await supabase
        .from("company_events")
        .select("*")
        .gte("start_date", startOf)
        .lte("start_date", endStr)
        .order("start_date", { ascending: true });

      setEvents(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [viewYear, viewMonth]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const getDateStr = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const eventsForDate = (day: number) =>
    events.filter(e => e.start_date === getDateStr(day));

  const selectedEvents = selectedDate
    ? events.filter(e => e.start_date === selectedDate)
    : [];

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !newEvent.title.trim()) return;
    setSaving(true);
    setAddError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const finalDesc = newEvent.location 
        ? `${newEvent.description || ""}\n\nLocation: ${newEvent.location}`.trim()
        : newEvent.description || null;

      const { error } = await supabase.from("company_events").insert({
        title: newEvent.title.trim(),
        description: finalDesc,
        start_date: selectedDate,
        start_time: newEvent.start_time || null,
        event_type: newEvent.type,
        created_by: user?.id || null,
      });
      if (error) {
        setAddError(error.message);
        return;
      }
      setNewEvent({ title: "", description: "", start_time: "", location: "", type: "meeting" });
      setShowAddModal(false);
      await loadEvents();
    } catch (err) {
      setAddError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-5 text-xs">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-slate-800 text-base" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Company Calendar
          </h2>
          <p className="text-slate-400 text-[11px]">Team events, holidays, leave schedules and interviews</p>
        </div>
        {selectedDate && canAddEvents && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0D9488] text-white font-semibold rounded-lg shadow-sm"
          >
            <Plus size={13} /> Add Event
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Calendar Grid */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Month Nav */}
          <div className="flex items-center justify-between p-4 border-b bg-slate-50">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-200 rounded-lg">
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-slate-700">{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-200 rounded-lg">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 bg-slate-50 border-b">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-2">{d}</div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="h-16 border-b border-r border-slate-100" />;
              const dateStr = getDateStr(day);
              const dayEvents = eventsForDate(day);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-16 border-b border-r border-slate-100 p-1 cursor-pointer transition-colors
                    ${isSelected ? "bg-[#0D9488]/10 border-[#0D9488]" : "hover:bg-slate-50"}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] mb-1
                    ${isToday ? "bg-[#0D9488] text-white" : "text-slate-700"}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        className="truncate text-[9px] font-bold px-1 py-0.5 rounded"
                        style={{ background: `${EVENT_COLORS[ev.event_type || "other"]}20`, color: EVENT_COLORS[ev.event_type || "other"] }}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-slate-400">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Events Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50">
            <h3 className="font-bold text-slate-700">
              {selectedDate
                ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                : "Select a date"}
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {!selectedDate && (
              <p className="text-slate-400 text-center py-8">Click any date to view or add events.</p>
            )}
            {selectedDate && selectedEvents.length === 0 && (
              <p className="text-slate-400 text-center py-8">No events on this date.</p>
            )}
            {selectedEvents.map(ev => (
              <div key={ev.id} className="rounded-lg border p-3" style={{ borderLeft: `3px solid ${EVENT_COLORS[ev.event_type || "other"]}` }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-slate-800">{ev.title}</div>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: `${EVENT_COLORS[ev.event_type || "other"]}20`, color: EVENT_COLORS[ev.event_type || "other"] }}>{ev.event_type || "other"}</span>
                </div>
                {ev.description && <p className="text-slate-500 leading-snug mb-1">{ev.description}</p>}
                <div className="space-y-1 text-[10px] text-slate-400">
                  {ev.start_time && (
                    <div className="flex items-center gap-1"><Clock size={10} />{ev.start_time}</div>
                  )}
                  {ev.location && (
                    <div className="flex items-center gap-1"><MapPin size={10} />{ev.location}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full text-xs overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-slate-50">
              <h3 className="font-bold">Add Event — {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</h3>
              <button onClick={() => { setShowAddModal(false); setAddError(null); }}><X size={16} /></button>
            </div>
            <form onSubmit={handleAddEvent} className="p-4 space-y-3">
              <div>
                <label className="block font-semibold mb-1">Event Title *</label>
                <input required type="text" placeholder="e.g. Team standup"
                  value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488]" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea rows={2} placeholder="Optional notes..."
                  value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Time</label>
                  <input type="time" value={newEvent.start_time} onChange={e => setNewEvent({ ...newEvent, start_time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488]" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Event Type</label>
                  <select value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488]">
                    <option value="meeting">Meeting</option>
                    <option value="holiday">Holiday</option>
                    <option value="interview">Interview</option>
                    <option value="announcement">Announcement</option>
                    <option value="milestone">Milestone</option>
                    <option value="deadline">Deadline</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Location</label>
                <input type="text" placeholder="e.g. Google Meet / Office"
                  value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488]" />
              </div>

              {/* Inline Error */}
              {addError && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[11px] leading-snug">
                  <strong>Error:</strong> {addError}
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <button type="button" onClick={() => { setShowAddModal(false); setAddError(null); }} className="flex-1 py-2 border rounded-lg font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-[#0D9488] text-white font-semibold rounded-lg hover:bg-[#0F766E] disabled:opacity-60 transition-colors">
                  {saving ? "Saving..." : "Add Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
