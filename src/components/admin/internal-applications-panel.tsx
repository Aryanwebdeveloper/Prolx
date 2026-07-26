"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText, Search, Filter, RefreshCw, Check, X, Eye, MessageSquare,
  Clock, AlertCircle, FileDown, Plus, ChevronRight, User, Archive, Ban
} from "lucide-react";
import {
  getInternalApplications, updateApplicationStatus, addApplicationComment
} from "@/app/internal-application-actions";

type Application = {
  id: string;
  user_id: string;
  type: string;
  subject: string;
  description: string;
  priority: string;
  attachment_url?: string;
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  admin_notes?: string;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    role: string;
  };
  reviewer?: {
    id: string;
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

export default function InternalApplicationsPanel() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Detail / Action state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [notes, setNotes] = useState("");
  const [actioning, setActioning] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getInternalApplications();
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

  const handleAction = async (status: "approved" | "rejected" | "under_review" | "on_hold") => {
    if (!selectedApp) return;
    setActioning(true);
    try {
      await updateApplicationStatus(selectedApp.id, status, notes);
      setNotes("");
      setShowDetailModal(false);
      setSelectedApp(null);
      await loadData();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    } finally {
      setActioning(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !newComment.trim()) return;
    try {
      await addApplicationComment(selectedApp.id, newComment, isInternalComment);
      setNewComment("");
      // Reload comments for this specific application
      const { data } = await getInternalApplications({ userId: selectedApp.user_id });
      const updated = (data as Application[]).find(a => a.id === selectedApp.id);
      if (updated) setSelectedApp(updated);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = apps.filter(a => {
    const matchSearch = !search ||
      a.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.subject?.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter === "all" || a.type === typeFilter;
    const matchStatus = statusFilter === "all" || a.status === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  const getStatusColor = (status: string) => {
    if (status === "approved") return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    if (status === "rejected") return "bg-rose-100 text-rose-800 border border-rose-200";
    if (status === "on_hold") return "bg-slate-100 text-slate-800 border border-slate-200";
    return "bg-amber-100 text-amber-800 border border-amber-200";
  };

  const getPriorityColor = (prio: string) => {
    if (prio === "urgent") return "text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded";
    if (prio === "high") return "text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded";
    return "text-slate-500 bg-slate-50 px-2 py-0.5 rounded";
  };

  return (
    <div className="space-y-6 text-[#0F172A]">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Internal Applications Registry
          </h2>
          <p className="text-xs text-slate-500">
            Review equipment requests, salary advances, transfer petitions, and reference credential queries.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3 shadow-sm">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search applications..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:border-[#0D9488]"
          />
        </div>
        <div>
          <select
            value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-transparent focus:outline-none focus:border-[#0D9488]"
          >
            <option value="all">All Request Types</option>
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
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-transparent focus:outline-none focus:border-[#0D9488]"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button onClick={loadData} className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-600">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Reload
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading requests catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={32} className="text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No applications registered.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Date Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{app.user?.full_name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{app.user?.role}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#0D9488] capitalize">
                      {app.type.replace(/_/g, " ")}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 max-w-[200px] truncate">
                      {app.subject}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`capitalize font-semibold text-[10px] ${getPriorityColor(app.priority)}`}>
                        {app.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => { setSelectedApp(app); setNotes(app.admin_notes || ""); setShowDetailModal(true); }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                        title="Review Application"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {showDetailModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full h-[80vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b shrink-0 bg-slate-50">
              <h3 className="font-bold text-sm">
                Application Review: {selectedApp.user?.full_name}
              </h3>
              <button onClick={() => { setShowDetailModal(false); setSelectedApp(null); }} className="p-1 hover:bg-slate-100 rounded">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="bg-slate-50/50 p-3 rounded-lg border space-y-2">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="font-semibold text-slate-500">Application Category</span>
                  <span className="font-bold text-[#0D9488] capitalize">{selectedApp.type.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="font-semibold text-slate-500">Subject</span>
                  <span className="font-medium text-slate-800">{selectedApp.subject}</span>
                </div>
                <div className="flex flex-col gap-1 border-b pb-1.5">
                  <span className="font-semibold text-slate-500">Details / Description</span>
                  <p className="text-slate-700 italic font-mono bg-white p-2 border rounded">"{selectedApp.description}"</p>
                </div>
                {selectedApp.attachment_url && (
                  <div className="flex justify-between pt-1">
                    <span className="font-semibold text-slate-500">Attachment Upload</span>
                    <a href={selectedApp.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#0D9488] font-bold hover:underline">
                      <FileDown size={12} /> Download/View
                    </a>
                  </div>
                )}
              </div>

              {/* Chat Comments Thread */}
              <div>
                <h4 className="font-bold text-slate-700 mb-1.5 flex items-center gap-1"><MessageSquare size={13} /> Thread Context</h4>
                <div className="border rounded-lg max-h-36 overflow-y-auto p-2 bg-slate-50 space-y-2">
                  {!selectedApp.comments || selectedApp.comments.length === 0 ? (
                    <p className="text-slate-400 italic py-4 text-center">No discussion logged.</p>
                  ) : (
                    selectedApp.comments.map(c => (
                      <div key={c.id} className="p-2 bg-white rounded border border-slate-100">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                          <span>{c.user?.full_name} {c.is_internal && <span className="text-rose-500 text-[9px] bg-rose-50 px-1 rounded">Internal</span>}</span>
                          <span>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700">{c.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* New Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2 items-end pt-2 border-t">
                <div className="flex-1">
                  <input
                    type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                    placeholder="Type message to employee..."
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none text-xs"
                  />
                  <label className="flex items-center gap-1 mt-1 cursor-pointer font-semibold text-[10px] text-slate-500">
                    <input
                      type="checkbox" checked={isInternalComment} onChange={e => setIsInternalComment(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Post as internal review note (Employee won't see this)</span>
                  </label>
                </div>
                <button type="submit" className="px-3 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-lg text-xs shadow-sm">
                  Send
                </button>
              </form>

              {/* Review notes & actions */}
              <div className="pt-4 border-t space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Official Admin Notes / Resolution rationale</label>
                  <textarea
                    value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Enter notes visible to the requester upon status changes..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent min-h-16"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleAction("approved")}
                    disabled={actioning}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction("rejected")}
                    disabled={actioning}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction("on_hold")}
                    disabled={actioning}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg border disabled:opacity-50"
                  >
                    Put On Hold
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
