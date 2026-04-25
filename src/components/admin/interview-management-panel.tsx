"use client";

import { useState, useEffect } from "react";
import { Calendar, RefreshCw, Loader2, CheckCircle, XCircle, Clock, Star, MessageSquare, Trash2, Video, Link as LinkIcon } from "lucide-react";
import { getInterviews, updateInterview, deleteInterview } from "@/app/careers-actions";

export default function InterviewManagementPanel() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [notesForm, setNotesForm] = useState({ feedback: "", interviewer_notes: "", rating: 0 });
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await getInterviews();
    setInterviews(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    setSaving(true);
    await updateInterview(id, { status });
    setInterviews(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    setSaving(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedInterview) return;
    setSaving(true);
    const updates: any = {};
    if (notesForm.feedback) updates.feedback = notesForm.feedback;
    if (notesForm.interviewer_notes) updates.interviewer_notes = notesForm.interviewer_notes;
    if (notesForm.rating > 0) updates.rating = notesForm.rating;
    await updateInterview(selectedInterview.id, updates);
    setInterviews(prev => prev.map(i => i.id === selectedInterview.id ? { ...i, ...updates } : i));
    setSelectedInterview(null);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Cancel and delete this interview?")) return;
    await deleteInterview(id);
    setInterviews(prev => prev.filter(i => i.id !== id));
  };

  const statusColors: Record<string, string> = {
    Scheduled: "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
    "No-show": "bg-gray-100 text-gray-600",
  };

  const filtered = filterStatus ? interviews.filter(i => i.status === filterStatus) : interviews;

  const stats = [
    { label: "Total", count: interviews.length, color: "bg-[#0D9488]" },
    { label: "Scheduled", count: interviews.filter(i => i.status === "Scheduled").length, color: "bg-blue-500" },
    { label: "Completed", count: interviews.filter(i => i.status === "Completed").length, color: "bg-green-500" },
    { label: "Cancelled", count: interviews.filter(i => i.status === "Cancelled").length, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-bold text-[#0F172A] text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Interview Management
            </h2>
            <p className="text-sm text-[#64748B] mt-1">Track all scheduled interviews and manage the hiring pipeline.</p>
          </div>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl transition-all">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] focus:outline-none focus:border-[#0D9488]"
        >
          <option value="">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="No-show">No-show</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, count, color }) => (
          <div key={label} className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className={`w-2 h-2 rounded-full ${color} mb-2`} />
            <p className="text-2xl font-bold text-[#0F172A]">{count}</p>
            <p className="text-sm text-[#64748B]">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={32} className="animate-spin mx-auto text-[#0D9488] mb-4" />
            <p className="text-[#64748B]">Loading interviews...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar size={40} className="mx-auto text-[#CBD5E1] mb-3" />
            <p className="text-[#64748B]">No interviews found.</p>
            <p className="text-xs text-[#94A3B8] mt-1">Schedule interviews from the Applications panel.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Candidate</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Position</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Date & Time</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((interview) => (
                  <tr key={interview.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#0F172A]">{interview.career_applications?.name || "—"}</p>
                      <p className="text-xs text-[#64748B]">{interview.career_applications?.email || ""}</p>
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">
                      {interview.career_applications?.career_jobs?.title || "—"}
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">
                      <p>{new Date(interview.scheduled_at).toLocaleDateString()}</p>
                      <p className="text-xs">{new Date(interview.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">
                      <span className="flex items-center gap-1">
                        <Video size={13} className="text-[#0D9488]" />
                        {interview.interview_type || "Video Call"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[interview.status] || "bg-gray-100 text-gray-600"}`}>
                        {interview.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {interview.meeting_link && (
                          <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-[#F0FDFA] text-[#0D9488] transition-colors" title="Open Meeting Link">
                            <LinkIcon size={15} />
                          </a>
                        )}
                        <button
                          onClick={() => { setSelectedInterview(interview); setNotesForm({ feedback: interview.feedback || "", interviewer_notes: interview.interviewer_notes || "", rating: interview.rating || 0 }); }}
                          className="p-1.5 rounded-lg hover:bg-[#F0FDFA] text-[#0D9488] transition-colors" title="Notes & Feedback">
                          <MessageSquare size={15} />
                        </button>
                        {interview.status === "Scheduled" && (
                          <button onClick={() => handleStatusUpdate(interview.id, "Completed")}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors" title="Mark Completed">
                            <CheckCircle size={15} />
                          </button>
                        )}
                        {interview.status === "Scheduled" && (
                          <button onClick={() => handleStatusUpdate(interview.id, "No-show")}
                            className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors" title="Mark No-show">
                            <Clock size={15} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(interview.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Notes & Feedback
              </h3>
              <button onClick={() => setSelectedInterview(null)} className="text-[#64748B] hover:text-[#0F172A]">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">Candidate</p>
                <p className="text-sm font-medium text-[#0F172A]">{selectedInterview.career_applications?.name}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Rating (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setNotesForm(f => ({ ...f, rating: n }))}
                      className={`p-1 transition-colors ${notesForm.rating >= n ? "text-amber-400" : "text-[#CBD5E1]"}`}>
                      <Star size={22} fill={notesForm.rating >= n ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Interviewer Notes</label>
                <textarea rows={3} value={notesForm.interviewer_notes}
                  onChange={e => setNotesForm(f => ({ ...f, interviewer_notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none"
                  placeholder="Internal notes for the team..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Feedback for Candidate</label>
                <textarea rows={3} value={notesForm.feedback}
                  onChange={e => setNotesForm(f => ({ ...f, feedback: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none"
                  placeholder="Feedback to share with the candidate..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveNotes} disabled={saving}
                  className="flex-1 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  Save
                </button>
                <button onClick={() => setSelectedInterview(null)}
                  className="px-4 py-2.5 text-[#64748B] hover:text-[#0F172A] text-sm font-medium">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
