"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText, Search, RefreshCw, Plus, FileUp, Send, AlertCircle, Eye,
  X, MessageSquare, Shield, Clock, HelpCircle, Inbox
} from "lucide-react";
import {
  getMyApplications, submitInternalApplication, addApplicationComment
} from "@/app/internal-application-actions";
import { ImageUpload } from "../ui/image-upload";

type Application = {
  id: string;
  type: string;
  subject: string;
  description: string;
  priority: string;
  attachment_url?: string;
  status: string;
  reviewed_at?: string;
  admin_notes?: string;
  created_at: string;
  reviewer?: {
    full_name: string;
  };
  comments?: Array<{
    id: string;
    comment: string;
    is_internal: boolean;
    created_at: string;
    user: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
  }>;
};

export default function MyApplicationsPanel() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [form, setForm] = useState({
    type: "salary_advance",
    subject: "",
    description: "",
    priority: "normal",
    attachment_url: ""
  });

  // Comments/Review details states
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newComment, setNewComment] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getMyApplications();
      setApps((data as Application[]) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await submitInternalApplication(form);
      if (error) throw error;
      
      setShowApplyModal(false);
      setForm({
        type: "salary_advance", subject: "", description: "", priority: "normal", attachment_url: ""
      });
      await loadData();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !newComment.trim()) return;
    try {
      await addApplicationComment(selectedApp.id, newComment, false);
      setNewComment("");
      // Reload comments
      const { data } = await getMyApplications();
      const updated = (data as Application[]).find(a => a.id === selectedApp.id);
      if (updated) setSelectedApp(updated);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (status === "rejected") return "bg-rose-50 text-rose-700 border-rose-100";
    if (status === "on_hold") return "bg-slate-50 text-slate-500 border-slate-100";
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  return (
    <div className="space-y-6 text-[#0F172A]">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            <Inbox size={18} className="text-[#0D9488]" /> Internal Applications
          </h2>
          <p className="text-xs text-slate-500">Submit requests for salary advances, equipment, NOC credentials, or department transfers.</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold rounded-lg shadow-sm"
        >
          <Plus size={14} /> Submit Application
        </button>
      </div>

      {/* Grid List of Requests */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-xs">My Request History</h3>
          <button onClick={loadData} className="p-1 hover:bg-slate-100 rounded text-slate-400">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading history...</div>
        ) : apps.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={28} className="text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-500">You haven't submitted any internal applications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {apps.map(app => (
              <div key={app.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0D9488] capitalize">{app.type.replace(/_/g, " ")}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${app.priority === 'urgent' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                      {app.priority}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-700">{app.subject}</div>
                  <div className="text-[10px] text-slate-400 italic">"{app.description}"</div>
                  <div className="text-[10px] text-slate-500">Submitted: {new Date(app.created_at).toLocaleDateString()}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0 md:justify-end">
                  <button
                    onClick={() => { setSelectedApp(app); setShowDetailModal(true); }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded border hover:bg-slate-50 text-[10px] font-semibold text-slate-600"
                  >
                    <Eye size={12} /> Discussion
                  </button>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-bold capitalize ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-sm" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Submit Application / Request
              </h3>
              <button onClick={() => setShowApplyModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Request Type *</label>
                  <select
                    required
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent"
                  >
                    <option value="salary_advance">Salary Advance</option>
                    <option value="equipment_request">Equipment Request</option>
                    <option value="laptop_request">Laptop Request</option>
                    <option value="noc">No Objection Certificate (NOC)</option>
                    <option value="experience_letter">Experience Letter Request</option>
                    <option value="department_transfer">Department Transfer</option>
                    <option value="remote_work">Remote Work Request</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Priority *</label>
                  <select
                    required
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Subject / Header *</label>
                <input
                  type="text" required placeholder="e.g. Request for secondary monitor setup"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Detailed description / Justification *</label>
                <textarea
                  required
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Explain your requirements clearly here..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent min-h-20"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Attach document (e.g. Quotes/Invoices/NOC draft)</label>
                <ImageUpload
                  value={form.attachment_url}
                  bucket="application-attachments"
                  label="Upload document/image"
                  onChange={(url) => setForm(f => ({ ...f, attachment_url: url }))}
                  onRemove={() => setForm(f => ({ ...f, attachment_url: "" }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowApplyModal(false)} className="px-4 py-2 border rounded-lg font-semibold">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
                >
                  <Send size={12} /> {submitting ? "Submitting..." : "Send Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Details & discussion modal */}
      {showDetailModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 shadow-xl max-w-lg w-full h-[75vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b shrink-0 bg-slate-50">
              <h3 className="font-bold text-sm">
                Request Details: {selectedApp.subject}
              </h3>
              <button onClick={() => { setShowDetailModal(false); setSelectedApp(null); }} className="p-1 hover:bg-slate-100 rounded">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="bg-slate-50/50 p-3 rounded-lg border space-y-2">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="font-semibold text-slate-500">Category</span>
                  <span className="font-bold text-[#0D9488] capitalize">{selectedApp.type.replace(/_/g, " ")}</span>
                </div>
                <div className="flex flex-col gap-1 border-b pb-1.5">
                  <span className="font-semibold text-slate-500">Justification</span>
                  <p className="text-slate-700 bg-white p-2 border rounded">"{selectedApp.description}"</p>
                </div>
                {selectedApp.admin_notes && (
                  <div className="flex flex-col gap-1 border-b pb-1.5">
                    <span className="font-semibold text-rose-600">Admin Resolution / Remarks</span>
                    <p className="text-slate-700 bg-rose-50/50 p-2 border border-rose-100 rounded font-medium">"{selectedApp.admin_notes}"</p>
                  </div>
                )}
              </div>

              {/* Chat Thread */}
              <div>
                <h4 className="font-bold text-slate-700 mb-1.5 flex items-center gap-1"><MessageSquare size={13} /> Discussion History</h4>
                <div className="border rounded-lg max-h-32 overflow-y-auto p-2 bg-slate-50 space-y-2">
                  {!selectedApp.comments || selectedApp.comments.filter(c => !c.is_internal).length === 0 ? (
                    <p className="text-slate-400 italic py-4 text-center">No discussion logged.</p>
                  ) : (
                    selectedApp.comments.filter(c => !c.is_internal).map(c => (
                      <div key={c.id} className="p-2 bg-white rounded border border-slate-100">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                          <span>{c.user?.full_name}</span>
                          <span>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700">{c.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* New Comment form */}
              {selectedApp.status === "pending" || selectedApp.status === "under_review" || selectedApp.status === "on_hold" ? (
                <form onSubmit={handleAddComment} className="flex gap-2 items-end pt-2 border-t">
                  <input
                    type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                    placeholder="Type message to reviewer..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none text-xs"
                  />
                  <button type="submit" className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-lg text-xs shadow-sm">
                    Send
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
