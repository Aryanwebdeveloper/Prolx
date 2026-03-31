"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock, Search, RefreshCw, Filter, X, Edit3, Trash2,
  CheckCircle, AlertCircle, UserCheck, UserX, Calendar,
  ChevronLeft, ChevronRight, TrendingUp, Settings, FileText, Camera, ShieldAlert
} from "lucide-react";
import {
  getAllAttendance, upsertAttendance, deleteAttendance, getTodayAllAttendance,
  getAttendanceSettings, updateAttendanceSettings, autoManageAbsences
} from "@/app/attendance-actions";
import { getAllProfiles } from "@/app/certificate-actions";
import type { AttendanceWithUser } from "@/types/erp";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";

type AttendanceStatus = "present" | "absent" | "late" | "half_day";

const STATUS_CONFIG = {
  present: { label: "Present", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  absent: { label: "Absent", color: "bg-red-100 text-red-700", icon: UserX },
  late: { label: "Late", color: "bg-orange-100 text-orange-700", icon: AlertCircle },
  half_day: { label: "Half Day", color: "bg-yellow-100 text-yellow-700", icon: Clock },
} as const;

function formatTime(ts: string | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function calcDuration(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn || !checkOut) return "—";
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  if (diff <= 0) return "—";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function calcTotalDuration(sessions: Array<{ check_in: string; check_out: string | null }> | null | undefined): string {
  if (!sessions || sessions.length === 0) return "—";
  let totalDiff = 0;
  for (const s of sessions) {
    if (s.check_in && s.check_out) {
      totalDiff += new Date(s.check_out).getTime() - new Date(s.check_in).getTime();
    }
  }
  if (totalDiff <= 0) return "—";
  const h = Math.floor(totalDiff / 3600000);
  const m = Math.floor((totalDiff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

// ─── Edit Attendance Modal ─────────────────────────────────────
function EditAttendanceModal({
  record, staffList, onClose, onSaved,
}: {
  record: Partial<AttendanceWithUser> & { user_id?: string; date?: string; task_description?: string | null; completed_tasks?: string | null };
  staffList: { id: string; full_name: string; email: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [userId, setUserId] = useState(record.user_id || "");
  const [date, setDate] = useState(record.date || new Date().toISOString().split("T")[0]);
  const [checkIn, setCheckIn] = useState(record.check_in ? new Date(record.check_in).toTimeString().slice(0, 5) : "");
  const [checkOut, setCheckOut] = useState(record.check_out ? new Date(record.check_out).toTimeString().slice(0, 5) : "");
  const [status, setStatus] = useState<AttendanceStatus>(record.status || "present");
  const [notes, setNotes] = useState(record.notes || "");
  const [taskDesc, setTaskDesc] = useState(record.task_description || "");
  const [compTasks, setCompTasks] = useState(record.completed_tasks || "");
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!userId) return setError("Select a staff member");
    if (!date) return setError("Date is required");
    setSaving(true);

    const checkInISO = checkIn ? new Date(`${date}T${checkIn}:00`).toISOString() : undefined;
    const checkOutISO = checkOut ? new Date(`${date}T${checkOut}:00`).toISOString() : undefined;

    const { error: err } = await upsertAttendance({
      user_id: userId,
      date,
      check_in: checkInISO,
      check_out: checkOutISO,
      status,
      notes,
      task_description: taskDesc,
      completed_tasks: compTasks
    });
    setSaving(false);
    if (err) return setError(err.message);
    onSaved();
    onClose();
  };

  const isNew = !record.id;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-[#0F172A]">{isNew ? "Add Attendance" : "Edit Attendance"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Staff Member *</label>
              <select
                className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 bg-white"
                value={userId} onChange={e => setUserId(e.target.value)}
                disabled={!isNew}
              >
                <option value="">Select staff…</option>
                {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Date *</label>
              <input type="date"
                className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                value={date} onChange={e => setDate(e.target.value)} disabled={!isNew}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Status</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-2 text-[11px] rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    status === s
                      ? `${STATUS_CONFIG[s].color} border-transparent font-semibold`
                      : "border-[#E2E8F0] text-[#64748B] hover:border-[#0D9488] hover:text-[#0D9488]"
                  }`}
                >
                  {(() => { const Icon = STATUS_CONFIG[s].icon; return <Icon size={13} />; })()}
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Check-in Time</label>
              <input type="time"
                className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                value={checkIn} onChange={e => setCheckIn(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Check-out Time</label>
              <input type="time"
                className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                value={checkOut} onChange={e => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Planned Tasks (Check-in)</label>
            <textarea
              className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
              rows={2} placeholder="Planned tasks..." value={taskDesc} onChange={e => setTaskDesc(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Completed Tasks (Check-out)</label>
            <textarea
              className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
              rows={2} placeholder="Completed tasks..." value={compTasks} onChange={e => setCompTasks(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Internal Notes</label>
            <input
              className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
              placeholder="Admin internal notes..." value={notes} onChange={e => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>
        <div className="p-6 pt-0 border-t border-[#E2E8F0] flex justify-end gap-3 mt-4 mt-6">
          <br/>
          <button onClick={onClose} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC]">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-sm bg-[#0D9488] text-white rounded-xl hover:bg-[#0f766e] disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Today Overview Card ────────────────────────────────────────
function TodayStats({ stats }: { stats: { present: number; late: number; absent: number; total: number } }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Total Staff", value: stats.total, color: "bg-[#0F172A]", icon: UserCheck },
        { label: "Present Today", value: stats.present, color: "bg-emerald-500", icon: CheckCircle },
        { label: "Late Today", value: stats.late, color: "bg-orange-500", icon: AlertCircle },
        { label: "Absent Today", value: stats.absent, color: "bg-red-500", icon: UserX },
      ].map(({ label, value, color, icon: Icon }) => (
        <div key={label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={20} className="text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A] font-mono">{value}</div>
            <div className="text-xs text-[#64748B]">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────
export default function AttendanceManagerPanel() {
  const [records, setRecords] = useState<AttendanceWithUser[]>([]);
  const [staffList, setStaffList] = useState<{ id: string; full_name: string; email: string; role: string }[]>([]);
  const [todayStats, setTodayStats] = useState({ present: 0, late: 0, absent: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editRecord, setEditRecord] = useState<Partial<AttendanceWithUser> | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // Additional feature modals
  const [showInfo, setShowInfo] = useState<AttendanceWithUser | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings state
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [exCheckIn, setExCheckIn] = useState("09:00");
  const [holidaysText, setHolidaysText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [attRes, profilesRes, todayRes, settingsRes] = await Promise.all([
      getAllAttendance({
        status: statusFilter !== "all" ? statusFilter as AttendanceStatus : undefined,
        userId: staffFilter || undefined,
        month,
      }),
      getAllProfiles(),
      getTodayAllAttendance(),
      getAttendanceSettings()
    ]);
    setRecords((attRes.data as AttendanceWithUser[]) || []);
    setStaffList(((profilesRes.data as { id: string; full_name: string; email: string; role: string }[]) || []).filter(p => p.role === "staff"));
    setTodayStats(todayRes.stats);
    
    // Load config state
    if (settingsRes) {
      setExCheckIn(settingsRes.expectedCheckInTime || "09:00");
      setHolidaysText((settingsRes.holidays || []).join("\n"));
    }
    
    setLoading(false);
  }, [statusFilter, staffFilter, month]);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.user?.full_name?.toLowerCase().includes(q) || r.user?.email?.toLowerCase().includes(q);
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this attendance record?")) return;
    setDeleting(id);
    await deleteAttendance(id);
    setDeleting(null);
    load();
  };
  
  const handleRunAutoAbsence = async () => {
    if (!confirm("Run auto-manage absences? This will mark any missing records for past staff working days as 'Absent' (ignoring weekends and holidays).")) return;
    setLoading(true);
    const { count, error } = await autoManageAbsences();
    setLoading(false);
    if (error) {
       alert("Error managing absences: " + error.message);
    } else {
       alert(`Auto-manage complete. ${count || 0} missing days marked as absent.`);
       load();
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    const hList = holidaysText.split("\n").map(l => l.trim()).filter(Boolean);
    const { error } = await updateAttendanceSettings({
      expectedCheckInTime: exCheckIn,
      holidays: hList
    });
    setSettingsLoading(false);
    if (error) alert("Error saving settings: " + error.message);
    else {
      setShowSettings(false);
      load();
    }
  };

  const summary = {
    present: filtered.filter(r => r.status === "present").length,
    late: filtered.filter(r => r.status === "late").length,
    absent: filtered.filter(r => r.status === "absent").length,
    half_day: filtered.filter(r => r.status === "half_day").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A]">Attendance Manager</h1>
          <div className="flex gap-3 text-sm">
             <button
               onClick={handleRunAutoAbsence}
               className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-semibold transition"
             >
                <ShieldAlert size={16} /> Auto-Manage Absences
             </button>
             <button
               onClick={() => setShowSettings(true)}
               className="flex items-center gap-2 px-4 py-2 border border-[#E2E8F0] bg-white rounded-xl hover:bg-gray-50 transition font-medium"
             >
                <Settings size={16} /> Config / Holidays
             </button>
          </div>
      </div>

      <TodayStats stats={todayStats} />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
              placeholder="Search by staff name or email…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => {
              const d = new Date(month + "-01");
              d.setMonth(d.getMonth() - 1);
              setMonth(d.toISOString().slice(0, 7));
            }} className="p-2 border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC]">
              <ChevronLeft size={16} />
            </button>
            <input type="month"
              className="px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 bg-white"
              value={month} onChange={e => setMonth(e.target.value)}
            />
            <button onClick={() => {
              const d = new Date(month + "-01");
              d.setMonth(d.getMonth() + 1);
              setMonth(d.toISOString().slice(0, 7));
            }} className="p-2 border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC]">
              <ChevronRight size={16} />
            </button>
          </div>

          <select
            className="px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
            value={staffFilter} onChange={e => setStaffFilter(e.target.value)}
          >
            <option value="">All Staff</option>
            {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>

          <select
            className="px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>

          <button onClick={() => load()} className="p-2.5 border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] text-[#64748B]">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0D9488] text-white text-sm rounded-xl hover:bg-[#0f766e]"
          >
            <Calendar size={16} /> Add Record
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(s => {
            const cfg = STATUS_CONFIG[s];
            const Icon = cfg.icon;
            return (
              <div key={s} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                <Icon size={12} /> {cfg.label}: {summary[s]}
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Clock size={32} className="text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[#64748B] text-sm">No attendance records for this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {["Staff", "Date", "Check In", "Check Out", "Status", "Details/Tasks", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(record => {
                  const cfg = STATUS_CONFIG[record.status as AttendanceStatus] || STATUS_CONFIG.present;
                  const hasTasks = !!record.task_description || !!record.completed_tasks;
                  const hasImage = !!record.check_in_photo_url || !!record.check_out_photo_url;
                  return (
                    <tr key={record.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#0F172A]">{record.user?.full_name || "—"}</div>
                        <div className="text-xs text-[#94A3B8]">{record.user?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-[#64748B] font-mono text-xs">{record.date}</td>
                      <td className="px-4 py-3 font-mono text-[#0F172A]">{formatTime(record.check_in)}</td>
                      <td className="px-4 py-3 font-mono text-[#0F172A]">{formatTime(record.check_out)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                          {(() => { const Icon = cfg.icon; return <Icon size={11} />; })()}
                          {cfg.label}
                        </span>
                        <div className="text-xs text-[#64748B] mt-1 font-mono">
                          {record.sessions?.length ? calcTotalDuration(record.sessions) : calcDuration(record.check_in, record.check_out)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                         <div className="flex gap-2">
                            {hasTasks ? (
                               <button 
                                 onClick={() => setShowInfo(record)}
                                 title="View Details"
                                 className="flex items-center gap-1 text-[10px] uppercase font-bold text-[#0D9488] bg-teal-50 px-2 py-1 rounded hover:bg-teal-100"
                               >
                                <FileText size={12} /> Tasks
                               </button>
                            ) : <span className="text-gray-300">-</span>}
                            {hasImage && (
                                <button 
                                onClick={() => setShowInfo(record)}
                                title="View Proof Photo"
                                className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100"
                              >
                               <Camera size={12} /> Prooof
                              </button>
                            )}
                         </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditRecord(record)} className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0D9488] hover:bg-[#F0FDFA]" title="Edit">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDelete(record.id)} disabled={deleting === record.id}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-red-500 hover:bg-red-50" title="Delete">
                            {deleting === record.id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

                      {/* Record Info View Modal */}
      <Dialog open={!!showInfo} onOpenChange={() => setShowInfo(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
           {showInfo && (
              <>
                 <DialogHeader>
                    <DialogTitle>Attendance Details - {showInfo.user?.full_name}</DialogTitle>
                    <DialogDescription>{showInfo.date} | Status: <span className="font-bold">{showInfo.status.toUpperCase()}</span></DialogDescription>
                 </DialogHeader>

                 <div className="space-y-6 mt-4">
                    {showInfo.sessions && showInfo.sessions.length > 0 && (
                      <div className="bg-white rounded-xl p-4 border border-[#E2E8F0]">
                        <h4 className="text-sm font-bold flex items-center gap-2 border-b pb-2 mb-3">
                          <Clock size={16} className="text-[#0D9488]" /> Session Timeline
                        </h4>
                        <div className="space-y-2">
                          {showInfo.sessions.map((s, idx) => (
                             <div key={idx} className="flex justify-between items-center bg-[#F8FAFC] p-2 rounded text-xs font-mono">
                               <span>Session {idx + 1}</span>
                               <span className="text-[#64748B]">
                                 {formatTime(s.check_in)} - {s.check_out ? formatTime(s.check_out) : "Active"}
                               </span>
                               <span className="font-bold text-[#0F172A]">
                                  {calcTotalDuration([s])}
                               </span>
                             </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                       <h4 className="text-sm font-bold flex items-center gap-2 border-b pb-2 mb-3">
                         <FileText size={16} className="text-gray-500"/> Check-in Tasks
                       </h4>
                       <p className="text-sm text-gray-700 whitespace-pre-wrap">{showInfo.task_description || <em className="text-gray-400">None provided</em>}</p>
                       
                       {showInfo.check_in_photo_url && (
                          <div className="mt-4">
                             <a href={showInfo.check_in_photo_url} target="_blank" rel="noreferrer" className="block p-1 border rounded bg-white">
                                <img src={showInfo.check_in_photo_url} alt="Check-in proof" className="max-h-64 object-contain rounded" />
                             </a>
                             <p className="text-xs text-gray-400 text-center mt-1">Check-in Proof Image</p>
                          </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                       <h4 className="text-sm font-bold flex items-center gap-2 border-b pb-2 mb-3">
                         <CheckCircle size={16} className="text-[#0D9488]" /> Completed Check-out Tasks
                       </h4>
                       <p className="text-sm text-gray-700 whitespace-pre-wrap">{showInfo.completed_tasks || <em className="text-gray-400">None provided</em>}</p>

                       {showInfo.check_out_photo_url && (
                          <div className="mt-4">
                             <a href={showInfo.check_out_photo_url} target="_blank" rel="noreferrer" className="block p-1 border rounded bg-white">
                                <img src={showInfo.check_out_photo_url} alt="Check-out proof" className="max-h-64 object-contain rounded" />
                             </a>
                             <p className="text-xs text-gray-400 text-center mt-1">Check-out Proof Image</p>
                          </div>
                      )}
                    </div>

                    {showInfo.notes && (
                      <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-sm border border-orange-100">
                         <strong>Admin Note:</strong> {showInfo.notes}
                      </div>
                    )}
                 </div>
              </>
           )}
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Attendance Configuration</DialogTitle>
               <DialogDescription>Set expected timings and holiday dates.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveSettings} className="space-y-4 py-2">
                 <div>
                    <label className="block text-sm font-medium mb-1">Expected Check-in Time</label>
                    <input 
                      type="time" required
                      className="w-full text-sm px-3 py-2 border rounded-xl"
                      value={exCheckIn} onChange={e => setExCheckIn(e.target.value)}
                    />
                    <p className="text-xs text-gray-400 mt-1">Check-ins after this time will be marked as "Late".</p>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Holidays (YYYY-MM-DD)</label>
                    <textarea 
                      className="w-full text-sm px-3 py-2 border rounded-xl font-mono"
                      rows={4}
                      placeholder="e.g.&#10;2026-12-25&#10;2026-05-01"
                      value={holidaysText} onChange={e => setHolidaysText(e.target.value)}
                    />
                    <p className="text-xs text-gray-400 mt-1">Dates added here are ignored by the Auto-Manage Absences tool. One date per line.</p>
                 </div>

                 <button 
                  type="submit" disabled={settingsLoading}
                  className="w-full py-2 bg-[#0F172A] text-white rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
                 >
                   {settingsLoading ? "Saving..." : "Save Settings"}
                 </button>
            </form>
         </DialogContent>
      </Dialog>

      {showAdd && (
        <EditAttendanceModal record={{}} staffList={staffList} onClose={() => setShowAdd(false)} onSaved={load} />
      )}
      {editRecord && (
        <EditAttendanceModal record={editRecord} staffList={staffList} onClose={() => setEditRecord(null)} onSaved={() => { load(); setEditRecord(null); }} />
      )}
    </div>
  );
}
