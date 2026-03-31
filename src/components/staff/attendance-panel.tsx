"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Clock, CheckCircle, AlertCircle, RefreshCw, LogIn, LogOut, Camera } from "lucide-react";
import { getTodayAttendance, checkIn, checkOut, getMyAttendance } from "@/app/attendance-actions";
import type { AttendanceRecord } from "@/types/erp";
import { createClient } from "../../../supabase/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type AttendanceStatus = "present" | "absent" | "late" | "half_day";

const STATUS_CONFIG = {
  present: { label: "Present", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  absent: { label: "Absent", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
  late: { label: "Late", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  half_day: { label: "Half Day", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
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

function LiveClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
      setDate(now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="text-center">
      <div className="text-5xl font-mono font-bold text-[#0F172A] tracking-wider tabular-nums">{time}</div>
      <div className="text-sm text-[#64748B] mt-2">{date}</div>
    </div>
  );
}

export default function AttendancePanel({ userId }: { userId: string }) {
  const supabase = createClient();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [error, setError] = useState("");

  // Check In / Out Modal State
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  
  const [taskDesc, setTaskDesc] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [todayRes, historyRes] = await Promise.all([
      getTodayAttendance(userId),
      getMyAttendance(userId, { month }),
    ]);
    setTodayRecord(todayRes.data as AttendanceRecord | null);
    setHistory((historyRes.data as AttendanceRecord[]) || []);
    setLoading(false);
  }, [userId, month]);

  useEffect(() => { load(); }, [load]);

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${todayRecord?.date || new Date().toISOString().split("T")[0]}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('attendance_proofs')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }
    
    const { data } = supabase.storage.from("attendance_proofs").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const submitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDesc.trim()) return;
    
    setActionLoading(true);
    setError("");
    try {
      let photoUrl = "";
      if (proofFile) {
        photoUrl = await uploadFile(proofFile);
      }
      
      const { error: err } = await checkIn(userId, taskDesc, photoUrl);
      if (err) throw err;
      
      setShowCheckIn(false);
      setTaskDesc("");
      setProofFile(null);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
    setActionLoading(false);
  };

  const submitCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDesc.trim()) return;
    
    setActionLoading(true);
    setError("");
    try {
      let photoUrl = "";
      if (proofFile) {
        photoUrl = await uploadFile(proofFile);
      }
      
      const { error: err } = await checkOut(userId, taskDesc, photoUrl);
      if (err) throw err;
      
      setShowCheckOut(false);
      setTaskDesc("");
      setProofFile(null);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
    setActionLoading(false);
  };

  const sessions = todayRecord?.sessions || [];
  const hasOpenSession = sessions.length > 0 && !sessions[sessions.length - 1].check_out;
  
  const canCheckIn = !todayRecord || !hasOpenSession;
  const canCheckOut = hasOpenSession;

  // Monthly summary
  const summary = {
    present: history.filter(r => r.status === "present").length,
    late: history.filter(r => r.status === "late").length,
    absent: history.filter(r => r.status === "absent").length,
    half_day: history.filter(r => r.status === "half_day").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Check-in / Check-out Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8">
        <LiveClock />

        {/* Today Status */}
        <div className="flex justify-center mt-6 mb-8">
          {todayRecord ? (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${STATUS_CONFIG[todayRecord.status as AttendanceStatus]?.color || "bg-gray-100 text-gray-600"}`}>
              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[todayRecord.status as AttendanceStatus]?.dot || "bg-gray-400"} animate-pulse`} />
              {STATUS_CONFIG[todayRecord.status as AttendanceStatus]?.label || todayRecord.status} — Today
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              Not Checked In Yet
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => { setTaskDesc(""); setProofFile(null); setShowCheckIn(true); }}
            disabled={!canCheckIn}
            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-semibold transition-all ${
              canCheckIn
                ? "bg-[#0D9488] text-white hover:bg-[#0f766e] shadow-lg shadow-teal-200 hover:shadow-teal-300 hover:scale-105"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <LogIn size={18} />
            Check In
          </button>
          <button
            onClick={() => { setTaskDesc(""); setProofFile(null); setShowCheckOut(true); }}
            disabled={!canCheckOut}
            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-semibold transition-all ${
              canCheckOut
                ? "bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-lg shadow-slate-200 hover:shadow-slate-300 hover:scale-105"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <LogOut size={18} />
            Check Out
          </button>
        </div>

        {/* Today's timestamps */}
        {todayRecord && !!todayRecord.check_in && (
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#F8FAFC]">
            {[
              { label: "First In", value: formatTime(todayRecord.check_in), icon: LogIn, color: "text-emerald-600" },
              { label: "Last Out", value: formatTime(todayRecord.check_out), icon: LogOut, color: "text-[#0F172A]" },
              { label: "Active Hrs", value: todayRecord.sessions?.length ? calcTotalDuration(todayRecord.sessions) : calcDuration(todayRecord.check_in, todayRecord.check_out), icon: Clock, color: "text-[#0D9488]" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="text-center">
                <Icon size={18} className={`mx-auto mb-1 ${color}`} />
                <div className="font-mono font-bold text-[#0F172A]">{value}</div>
                <div className="text-xs text-[#94A3B8]">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Present", value: summary.present, color: "bg-emerald-100 text-emerald-700" },
          { label: "Late", value: summary.late, color: "bg-orange-100 text-orange-700" },
          { label: "Absent", value: summary.absent, color: "bg-red-100 text-red-700" },
          { label: "Half Day", value: summary.half_day, color: "bg-yellow-100 text-yellow-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 text-center">
            <div className={`text-2xl font-bold font-mono ${color.split(" ")[1]}`}>{value}</div>
            <div className="text-xs text-[#64748B] mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-bold text-[#0F172A]">Attendance History</h3>
          <input
            type="month"
            className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 bg-white"
            value={month} onChange={e => setMonth(e.target.value)}
          />
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center">
            <Clock size={28} className="text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[#64748B] text-sm">No attendance records for this month</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-0 border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {["Date", "Check In", "Check Out", "Status"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(record => {
                  const cfg = STATUS_CONFIG[record.status as AttendanceStatus] || STATUS_CONFIG.present;
                  return (
                    <tr key={record.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                       <td className="px-5 py-3 text-[#64748B] whitespace-nowrap">
                         <div className="font-mono text-xs">{record.date}</div>
                         {(record.check_in_photo_url || record.check_out_photo_url) && (
                            <div className="flex gap-1 mt-1 text-[#0D9488]">
                               <Camera size={14} />
                               <span className="text-[10px]">Photo Proof</span>
                            </div>
                         )}
                       </td>
                      <td className="px-5 py-3 font-mono text-[#0F172A] whitespace-nowrap">
                        {formatTime(record.check_in)}
                        {record.task_description && <div className="text-xs text-[#64748B] font-sans truncate max-w-[150px]" title={record.task_description}>{record.task_description}</div>}
                      </td>
                      <td className="px-5 py-3 font-mono text-[#0F172A] whitespace-nowrap">
                        {formatTime(record.check_out)}
                        {record.completed_tasks && <div className="text-xs text-[#64748B] font-sans truncate max-w-[150px]" title={record.completed_tasks}>{record.completed_tasks}</div>}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                        <div className="text-xs text-[#64748B] mt-1 font-mono">
                           {record.sessions?.length ? calcTotalDuration(record.sessions) : calcDuration(record.check_in, record.check_out)}
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

      {/* Check In Modal */}
      <Dialog open={showCheckIn} onOpenChange={setShowCheckIn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check In</DialogTitle>
            <DialogDescription>Submit your check in details for today.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCheckIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Today's Planned Tasks <span className="text-red-500">*</span></label>
              <textarea 
                required
                className="w-full text-sm px-3 py-2 border rounded-xl"
                rows={3} 
                placeholder="What tasks are you planning to work on?" 
                value={taskDesc} 
                onChange={(e) => setTaskDesc(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Photo Proof (Optional)</label>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="w-full text-sm border rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-l-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" 
                onChange={(e) => setProofFile(e.target.files?.[0] || null)} 
              />
              <p className="text-xs text-gray-400 mt-1">Take a photo using mobile or upload an image.</p>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button 
              type="submit" 
              disabled={actionLoading || !taskDesc.trim()} 
              className="w-full py-2 bg-[#0D9488] text-white rounded-xl text-sm font-semibold hover:bg-teal-700 disabled:opacity-50"
            >
              {actionLoading ? "Submitting..." : "Confirm Check In"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Check Out Modal */}
      <Dialog open={showCheckOut} onOpenChange={setShowCheckOut}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check Out</DialogTitle>
            <DialogDescription>Submit your completed tasks before checking out.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCheckOut} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Completed Tasks <span className="text-red-500">*</span></label>
              <textarea 
                required
                className="w-full text-sm px-3 py-2 border rounded-xl"
                rows={3} 
                placeholder="What did you complete today?" 
                value={taskDesc} 
                onChange={(e) => setTaskDesc(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Photo Proof (Optional)</label>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="w-full text-sm border rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-l-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" 
                onChange={(e) => setProofFile(e.target.files?.[0] || null)} 
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button 
              type="submit" 
              disabled={actionLoading || !taskDesc.trim()} 
              className="w-full py-2 bg-[#0F172A] text-white rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {actionLoading ? "Submitting..." : "Confirm Check Out"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
