"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar, Check, X, Search, RefreshCw, AlertCircle, FileText,
  Clock, CheckSquare, Plus, FileUp, Send, HelpCircle
} from "lucide-react";
import {
  getMyLeaveRequests, submitLeaveRequest, getLeaveTypes, getLeaveBalances
} from "@/app/leave-actions";
import { ImageUpload } from "../ui/image-upload";

type LeaveType = {
  id: string;
  name: string;
  code: string;
  color: string;
  default_days_per_year: number;
  is_paid: boolean;
  requires_attachment: boolean;
  is_active: boolean;
  description: string;
};

type LeaveRequest = {
  id: string;
  leave_type_id: string;
  subject: string;
  reason: string;
  start_date: string;
  end_date: string;
  total_days: number;
  is_half_day: boolean;
  half_day_period?: string;
  attachment_url?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  status: string;
  current_stage: string;
  rejection_reason?: string;
  admin_notes?: string;
  created_at: string;
  leave_type: LeaveType;
  approvals?: Array<{
    id: string;
    stage: string;
    action: string;
    comment?: string;
    approver: {
      full_name: string;
    };
  }>;
};

type LeaveBalance = {
  id: string;
  leave_type_id: string;
  total_days: number;
  used_days: number;
  pending_days: number;
  carried_over: number;
  leave_type: LeaveType;
};

export default function LeaveRequestPanel({ userId }: { userId: string }) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);

  // Toggle inline form or modal view
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    leave_type_id: "",
    subject: "",
    reason: "",
    start_date: "",
    end_date: "",
    total_days: 1,
    is_half_day: false,
    half_day_period: "morning",
    attachment_url: "",
    emergency_contact: "",
    emergency_phone: ""
  });

  const [validationWarning, setValidationWarning] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqsRes, balRes, typesRes] = await Promise.all([
        getMyLeaveRequests(),
        getLeaveBalances(userId),
        getLeaveTypes(true)
      ]);
      setRequests((reqsRes.data as LeaveRequest[]) || []);
      setBalances((balRes.data as LeaveBalance[]) || []);
      const types = (typesRes.data as LeaveType[]) || [];
      setLeaveTypes(types);
      
      // Auto select first leave category if not selected yet
      setForm(f => ({ ...f, leave_type_id: f.leave_type_id || (types[0]?.id || "") }));
    } catch (err) {
      console.error("Error loading leave data:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle date calculations and warnings
  useEffect(() => {
    if (!form.start_date || !form.end_date) {
      setValidationWarning("");
      return;
    }

    const start = new Date(form.start_date);
    const end = new Date(form.end_date);

    if (end < start) {
      setValidationWarning("End date cannot be earlier than start date.");
      return;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (form.is_half_day) {
      diffDays = 0.5;
    }

    setForm(f => ({ ...f, total_days: diffDays }));

    if (form.leave_type_id) {
      const bal = balances.find(b => b.leave_type_id === form.leave_type_id);
      if (bal) {
        const available = bal.total_days + bal.carried_over - bal.used_days - bal.pending_days;
        if (available < diffDays) {
          setValidationWarning(`Notice: Request (${diffDays} days) exceeds your remaining quota (${available} days available).`);
        } else {
          setValidationWarning("");
        }
      }
    }
  }, [form.start_date, form.end_date, form.is_half_day, form.leave_type_id, balances]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.leave_type_id) {
      alert("Please select a leave category");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await submitLeaveRequest(form);
      if (error) throw error;

      setShowApplyForm(false);
      setForm({
        leave_type_id: leaveTypes[0]?.id || "",
        subject: "", reason: "", start_date: "", end_date: "",
        total_days: 1, is_half_day: false, half_day_period: "morning",
        attachment_url: "", emergency_contact: "", emergency_phone: ""
      });
      await loadData();
    } catch (err) {
      alert("Submission failed: " + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "rejected") return "bg-rose-50 text-rose-700 border-rose-200";
    if (status === "cancelled") return "bg-slate-100 text-slate-600 border-slate-200";
    return "bg-amber-50 text-amber-700 border-amber-200 animate-pulse";
  };

  const selectedCategory = leaveTypes.find(t => t.id === form.leave_type_id);

  return (
    <div className="space-y-6 text-[#0F172A]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#0D9488] uppercase bg-[#0D9488]/15 px-3 py-1 rounded-full border border-[#0D9488]/30">
            Employee Workspace
          </span>
          <h2 className="text-xl font-bold mt-2 flex items-center gap-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Leave Management & Quota
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Track your annual leave allowances, submit new leave applications, and view real-time status updates from HR and Managers.
          </p>
        </div>
        <button
          onClick={() => setShowApplyForm(!showApplyForm)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all ${
            showApplyForm
              ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
              : "bg-[#0D9488] hover:bg-[#0F766E] text-white"
          }`}
        >
          {showApplyForm ? <X size={15} /> : <Plus size={15} />}
          {showApplyForm ? "Close Form" : "New Leave Application"}
        </button>
      </div>

      {/* Quota Balances cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {balances.map(bal => {
          const available = bal.total_days + bal.carried_over - bal.used_days - bal.pending_days;
          return (
            <div key={bal.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{bal.leave_type?.name}</span>
                <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: bal.leave_type?.color || "#0D9488" }} />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-3xl font-bold font-mono text-slate-800 dark:text-slate-100">{available}</span>
                  <span className="text-[10px] text-slate-400 font-medium ml-1">days left</span>
                </div>
                <div className="text-[10px] text-slate-400 text-right space-y-0.5">
                  <div>Pending: <span className="font-semibold text-amber-600">{bal.pending_days}d</span></div>
                  <div>Used: <span className="font-semibold text-rose-600">{bal.used_days}d</span></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline Application Form Section */}
      {showApplyForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
          <div className="border-b pb-4 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Submit New Leave Request
              </h3>
              <p className="text-xs text-slate-500">Fill in the details below to route your request to HR and Management.</p>
            </div>
            <button onClick={() => setShowApplyForm(false)} className="text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* 1. Category Selector Pills & Dropdown */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  1. Select Leave Category *
                </label>
                <select
                  value={form.leave_type_id}
                  onChange={e => setForm(f => ({ ...f, leave_type_id: e.target.value }))}
                  className="px-3 py-1 bg-white dark:bg-slate-900 border rounded-lg text-xs font-semibold text-[#0D9488] focus:outline-none focus:border-[#0D9488]"
                >
                  <option value="">-- Choose Category --</option>
                  {leaveTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {leaveTypes.map(t => {
                  const isSelected = form.leave_type_id === t.id;
                  const bal = balances.find(b => b.leave_type_id === t.id);
                  const rem = bal ? bal.total_days + bal.carried_over - bal.used_days - bal.pending_days : t.default_days_per_year;
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setForm(f => ({ ...f, leave_type_id: t.id }))}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-[#0D9488] bg-[#F0FDFA] shadow-sm ring-2 ring-[#0D9488]/30 font-bold"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color || "#0D9488" }} />
                        <span className="font-mono text-[9px] text-slate-400 font-bold uppercase">{t.code}</span>
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-100 truncate">{t.name}</div>
                      <div className="text-[10px] text-slate-400 mt-1 font-medium">{rem} days available</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Dates & Period Selection */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                2. Select Leave Duration
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Start Date *</label>
                  <input
                    type="date" required
                    value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border rounded-xl focus:outline-none focus:border-[#0D9488] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">End Date *</label>
                  <input
                    type="date" required
                    value={form.end_date}
                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border rounded-xl focus:outline-none focus:border-[#0D9488] text-xs font-mono"
                  />
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border flex flex-col justify-center items-center text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Duration</span>
                  <span className="text-xl font-bold font-mono text-[#0D9488] mt-0.5">{form.total_days} {form.total_days === 1 ? 'Day' : 'Days'}</span>
                </div>
              </div>

              {/* Half-day toggle */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.is_half_day}
                    onChange={e => setForm(f => ({ ...f, is_half_day: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-[#0D9488] focus:ring-[#0D9488]"
                  />
                  <span>Apply as Half-Day Leave</span>
                </label>

                {form.is_half_day && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Period:</span>
                    <select
                      value={form.half_day_period}
                      onChange={e => setForm(f => ({ ...f, half_day_period: e.target.value }))}
                      className="px-3 py-1.5 rounded-lg border text-xs bg-white dark:bg-slate-900 font-medium"
                    >
                      <option value="morning">First Half (Morning)</option>
                      <option value="afternoon">Second Half (Afternoon)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Reason & Description */}
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Summary *
                </label>
                <input
                  type="text" required placeholder="e.g. Family Function / Medical Appointment"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:border-[#0D9488] bg-transparent text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Justification / Reason *
                </label>
                <textarea
                  required
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Provide complete context for your leave request..."
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:border-[#0D9488] bg-transparent text-xs min-h-20"
                />
              </div>
            </div>

            {/* 4. Emergency Contacts & Document */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text" placeholder="Contact person name"
                  value={form.emergency_contact}
                  onChange={e => setForm(f => ({ ...f, emergency_contact: e.target.value }))}
                  className="w-full px-3.5 py-2 border rounded-xl focus:outline-none bg-transparent"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Phone Number
                </label>
                <input
                  type="text" placeholder="+92 300 0000000"
                  value={form.emergency_phone}
                  onChange={e => setForm(f => ({ ...f, emergency_phone: e.target.value }))}
                  className="w-full px-3.5 py-2 border rounded-xl focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Medical / Supporting Attachment */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Supporting Document / Medical Proof {selectedCategory?.requires_attachment && <span className="text-rose-500">*</span>}
              </label>
              <ImageUpload
                value={form.attachment_url}
                bucket="leave-attachments"
                label="Upload prescription / proof document"
                onChange={(url) => setForm(f => ({ ...f, attachment_url: url }))}
                onRemove={() => setForm(f => ({ ...f, attachment_url: "" }))}
              />
            </div>

            {validationWarning && (
              <div className="flex gap-2 items-center p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                <AlertCircle size={15} className="shrink-0 text-amber-600" />
                <span className="font-medium text-xs">{validationWarning}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowApplyForm(false)}
                className="px-5 py-2.5 border rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl shadow-md disabled:opacity-50"
              >
                <Send size={14} />
                {submitting ? "Submitting Request..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave Requests History List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              My Application History & Real-Time Tracking
            </h3>
            <p className="text-xs text-slate-400">Track progress through HR and Manager approval stages.</p>
          </div>
          <button onClick={loadData} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading leave requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar size={32} className="text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">You haven't submitted any leave requests yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {requests.map(req => (
              <div key={req.id} className="p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: req.leave_type?.color || "#0D9488" }} />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{req.leave_type?.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({req.total_days} {req.total_days === 1 ? 'day' : 'days'})</span>
                  </div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{req.subject}</div>
                  <div className="text-slate-500 italic text-[11px]">"{req.reason}"</div>
                  <div className="text-[11px] text-slate-400 font-medium pt-1">
                    Period: <span className="font-mono text-slate-700 dark:text-slate-300">{new Date(req.start_date).toLocaleDateString()}</span> to <span className="font-mono text-slate-700 dark:text-slate-300">{new Date(req.end_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0 md:justify-end">
                  <div className="text-right text-[11px] text-slate-400">
                    <div>Current Stage: <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{req.current_stage.replace(/_/g, " ")}</span></div>
                    {req.rejection_reason && <div className="text-rose-500 font-medium mt-0.5">Reason: "{req.rejection_reason}"</div>}
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-bold capitalize shadow-sm ${getStatusBadge(req.status)}`}>
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
