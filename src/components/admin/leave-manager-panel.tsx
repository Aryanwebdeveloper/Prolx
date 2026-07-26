"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar, Check, X, Search, RefreshCw, Eye, MessageSquare, AlertCircle,
  FileText, Settings, User, BarChart, Plus, Trash2, Edit2, ShieldAlert
} from "lucide-react";
import {
  getLeaveRequests, approveLeaveRequest, rejectLeaveRequest,
  getLeaveTypes, createLeaveType, updateLeaveType,
  getAllLeaveBalances, upsertLeaveBalance
} from "@/app/leave-actions";
import { getAllProfiles } from "@/app/certificate-actions";

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
  user_id: string;
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
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    department?: string;
    designation?: string;
  };
  approvals?: Array<{
    id: string;
    stage: string;
    action: string;
    comment?: string;
    approver: {
      id: string;
      full_name: string;
      role: string;
    };
  }>;
};

type Profile = { id: string; full_name: string; email: string; role: string; department?: string };

type LeaveBalance = {
  id: string;
  user_id: string;
  leave_type_id: string;
  year: number;
  total_days: number;
  used_days: number;
  pending_days: number;
  carried_over: number;
  leave_type: LeaveType;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
};

export default function LeaveManagerPanel() {
  const [activeTab, setActiveTab] = useState<"requests" | "balances" | "types">("requests");
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // Modals / Modifying States
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");
  const [comment, setComment] = useState("");
  const [actioning, setActioning] = useState(false);

  // Leave Type Form
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [typeForm, setTypeForm] = useState({
    name: "", code: "", color: "#0D9488", default_days_per_year: 14,
    is_paid: true, allow_half_day: true, requires_attachment: false, description: ""
  });

  // Balance Form
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceForm, setBalanceForm] = useState({
    user_id: "", leave_type_id: "", total_days: 14, carried_over: 0, year: new Date().getFullYear()
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqsRes, balRes, typesRes, profsRes] = await Promise.all([
        getLeaveRequests(),
        getAllLeaveBalances(),
        getLeaveTypes(false),
        getAllProfiles()
      ]);
      setRequests((reqsRes.data as LeaveRequest[]) || []);
      setBalances((balRes.data as LeaveBalance[]) || []);
      setLeaveTypes((typesRes.data as LeaveType[]) || []);
      setProfiles((profsRes.data as Profile[]) || []);
    } catch (err) {
      console.error("Error loading leave management data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Request actions
  const handleApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setActioning(true);
    try {
      const stage = selectedRequest.current_stage as any;
      if (approvalAction === "approve") {
        await approveLeaveRequest(selectedRequest.id, stage, comment);
      } else {
        await rejectLeaveRequest(selectedRequest.id, stage, comment);
      }
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setComment("");
      await loadData();
    } catch (err) {
      alert("Action failed: " + (err as Error).message);
    } finally {
      setActioning(false);
    }
  };

  // Leave Type actions
  const handleTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActioning(true);
    try {
      if (editingType) {
        await updateLeaveType(editingType.id, typeForm);
      } else {
        await createLeaveType(typeForm);
      }
      setShowTypeForm(false);
      setEditingType(null);
      await loadData();
    } catch (err) {
      alert("Failed to save leave type: " + (err as Error).message);
    } finally {
      setActioning(false);
    }
  };

  const handleEditType = (type: LeaveType) => {
    setEditingType(type);
    setTypeForm({
      name: type.name, code: type.code, color: type.color,
      default_days_per_year: type.default_days_per_year,
      is_paid: type.is_paid, allow_half_day: type.is_active, // mapping fields
      requires_attachment: type.requires_attachment, description: type.description || ""
    });
    setShowTypeForm(true);
  };

  // Balance adjustment actions
  const handleBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceForm.user_id || !balanceForm.leave_type_id) {
      alert("Please select employee and leave type");
      return;
    }
    setActioning(true);
    try {
      await upsertLeaveBalance(balanceForm);
      setShowBalanceModal(false);
      await loadData();
    } catch (err) {
      alert("Failed to adjust balance: " + (err as Error).message);
    } finally {
      setActioning(false);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const matchSearch = !search ||
      r.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.subject?.toLowerCase().includes(search.toLowerCase()) ||
      r.reason?.toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchType = typeFilter === "all" || r.leave_type_id === typeFilter;
    
    return matchSearch && matchStatus && matchType;
  });

  const getStageLabel = (stage: string) => {
    if (stage === "hr_review") return "HR Review";
    if (stage === "manager_review") return "Manager Review";
    if (stage === "admin_review") return "Admin Approval";
    return stage;
  };

  const getStatusColor = (status: string) => {
    if (status === "approved") return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    if (status === "rejected") return "bg-rose-100 text-rose-800 border border-rose-200";
    if (status === "cancelled") return "bg-slate-100 text-slate-800 border border-slate-200";
    return "bg-amber-100 text-amber-800 border border-amber-200";
  };

  return (
    <div className="space-y-6 text-[#0F172A]">
      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Leave Management Workspace
          </h2>
          <p className="text-xs text-slate-500">
            Review staff leave applications, configure department policies, manage balances, and handle multi-stage approval pipelines.
          </p>
        </div>
        
        {/* Navigation Tabs inside header */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "requests" ? "bg-[#0D9488] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Leave Requests
          </button>
          <button
            onClick={() => setActiveTab("balances")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "balances" ? "bg-[#0D9488] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Leave Balances
          </button>
          <button
            onClick={() => setActiveTab("types")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "types" ? "bg-[#0D9488] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Policy & Types
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 grid grid-cols-1 md:grid-cols-4 gap-3 shadow-sm">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search employee or reason..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:border-[#0D9488]"
              />
            </div>
            <div>
              <select
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:border-[#0D9488]"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <select
                value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:border-[#0D9488]"
              >
                <option value="all">All Leave Types</option>
                {leaveTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button onClick={loadData} className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-600">
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Reload
              </button>
            </div>
          </div>

          {/* List/Table of leave requests */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500">Loading leave requests...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No leave requests found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Employee</th>
                      <th className="py-3.5 px-4">Leave Type</th>
                      <th className="py-3.5 px-4">Period</th>
                      <th className="py-3.5 px-4">Days</th>
                      <th className="py-3.5 px-4">Current Stage</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredRequests.map(req => (
                      <tr
                        key={req.id}
                        onClick={() => { setSelectedRequest(req); setApprovalAction("approve"); setShowApprovalModal(true); }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#0D9488]/10 flex items-center justify-center text-[#0D9488] font-bold text-xs shrink-0">
                              {req.user?.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 dark:text-slate-200">{req.user?.full_name}</div>
                              <div className="text-[10px] text-slate-400">{req.user?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: req.leave_type?.color || "#0D9488" }} />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{req.leave_type?.name || req.subject}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          <div className="font-mono text-[11px]">{new Date(req.start_date).toLocaleDateString()} to {new Date(req.end_date).toLocaleDateString()}</div>
                          {req.is_half_day && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded capitalize font-medium">{req.half_day_period} Half Day</span>}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">{req.total_days} d</td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-600 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] capitalize">
                            {getStageLabel(req.current_stage)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end items-center gap-1.5">
                            {req.status === "pending" && (
                              <>
                                <button
                                  onClick={() => { setSelectedRequest(req); setApprovalAction("approve"); setShowApprovalModal(true); }}
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-semibold text-[10px] flex items-center gap-1 shadow-sm"
                                  title="Approve"
                                >
                                  <Check size={13} /> Approve
                                </button>
                                <button
                                  onClick={() => { setSelectedRequest(req); setApprovalAction("reject"); setShowApprovalModal(true); }}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-[10px] flex items-center gap-1 shadow-sm"
                                  title="Reject"
                                >
                                  <X size={13} /> Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => { setSelectedRequest(req); setApprovalAction("approve"); setShowApprovalModal(true); }}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 font-semibold text-[10px] flex items-center gap-1 border"
                              title="View full details"
                            >
                              <Eye size={13} /> Details
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
        </div>
      )}

      {activeTab === "balances" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
            <div>
              <h3 className="font-bold text-sm">Leave Balance Catalog</h3>
              <p className="text-xs text-slate-400">View and adjust available paid/unpaid leaves for all registered employees.</p>
            </div>
            <button
              onClick={() => { setBalanceForm({ user_id: "", leave_type_id: "", total_days: 14, carried_over: 0, year: new Date().getFullYear() }); setShowBalanceModal(true); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              <Plus size={14} /> Adjust Balance
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500">Loading leave balances...</div>
            ) : balances.length === 0 ? (
              <div className="p-12 text-center">
                <BarChart size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No leave balances logged yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Leave Type</th>
                      <th className="py-3 px-4">Year</th>
                      <th className="py-3 px-4">Carried Over</th>
                      <th className="py-3 px-4">Total Leave</th>
                      <th className="py-3 px-4">Used</th>
                      <th className="py-3 px-4">Pending</th>
                      <th className="py-3 px-4">Available</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {balances.map(bal => {
                      const available = bal.total_days + bal.carried_over - bal.used_days - bal.pending_days;
                      return (
                        <tr key={bal.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                            {bal.user?.full_name || "Unknown User"}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bal.leave_type?.color }} />
                              {bal.leave_type?.name}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">{bal.year}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{bal.carried_over}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">{bal.total_days}</td>
                          <td className="py-3 px-4 font-mono text-rose-600">{bal.used_days}</td>
                          <td className="py-3 px-4 font-mono text-amber-600">{bal.pending_days}</td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-600">{available}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "types" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
            <div>
              <h3 className="font-bold text-sm">Leave & Holiday Policies</h3>
              <p className="text-xs text-slate-400">Configure standard annual caps, payment eligibility, and attachments requirements for different leave categories.</p>
            </div>
            <button
              onClick={() => { setEditingType(null); setTypeForm({ name: "", code: "", color: "#0D9488", default_days_per_year: 14, is_paid: true, allow_half_day: true, requires_attachment: false, description: "" }); setShowTypeForm(true); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              <Plus size={14} /> Add Leave Type
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaveTypes.map(type => (
              <div key={type.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100">
                      Code: {type.code}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${type.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {type.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: type.color }} />
                    {type.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 min-h-8 mb-3">{type.description || "No description provided."}</p>

                  <div className="space-y-1.5 border-t border-slate-100 pt-3 text-slate-500 text-[11px]">
                    <div className="flex justify-between">
                      <span>Annual Quota:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{type.default_days_per_year} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paid Type:</span>
                      <span className="font-medium text-slate-700">{type.is_paid ? 'Yes (Paid)' : 'No (Unpaid)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requires Attachment:</span>
                      <span>{type.requires_attachment ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t border-slate-50 pt-3">
                  <button
                    onClick={() => handleEditType(type)}
                    className="flex items-center gap-1 px-3 py-1.5 border rounded text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <Edit2 size={11} /> Modify Policy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Request Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-sm">
                Review Leave: {selectedRequest.user?.full_name}
              </h3>
              <button onClick={() => { setShowApprovalModal(false); setSelectedRequest(null); }} className="p-1 hover:bg-slate-100 rounded">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50/50 p-3 rounded-lg border space-y-2">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="font-semibold text-slate-500">Subject / Category</span>
                  <span className="font-medium text-slate-800">{selectedRequest.subject}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="font-semibold text-slate-500">Leave Period</span>
                  <span className="font-medium text-slate-800">
                    {new Date(selectedRequest.start_date).toLocaleDateString()} to {new Date(selectedRequest.end_date).toLocaleDateString()} ({selectedRequest.total_days} Days)
                  </span>
                </div>
                <div className="flex flex-col gap-1 border-b pb-1.5">
                  <span className="font-semibold text-slate-500">Reason</span>
                  <span className="text-slate-700 italic">"{selectedRequest.reason}"</span>
                </div>
                {selectedRequest.attachment_url && (
                  <div className="flex justify-between pt-1">
                    <span className="font-semibold text-slate-500">Attachment / Proof</span>
                    <a href={selectedRequest.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#0D9488] font-bold hover:underline">
                      <FileText size={12} /> View Document
                    </a>
                  </div>
                )}
              </div>

              {/* Approval History */}
              {selectedRequest.approvals && selectedRequest.approvals.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-600 mb-1.5">Previous Approvals & Notes</h4>
                  <div className="space-y-2 max-h-24 overflow-y-auto border rounded-lg p-2 bg-slate-50">
                    {selectedRequest.approvals.map(app => (
                      <div key={app.id} className="border-b last:border-0 pb-1.5">
                        <div className="flex justify-between font-semibold text-[10px]">
                          <span>{app.approver?.full_name} ({getStageLabel(app.stage)})</span>
                          <span className={app.action === 'approved' ? 'text-emerald-600' : 'text-rose-600'}>{app.action}</span>
                        </div>
                        {app.comment && <div className="text-[10px] text-slate-500 italic mt-0.5">"{app.comment}"</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.status === "pending" ? (
                <form onSubmit={handleApprovalSubmit} className="space-y-3 pt-3 border-t">
                  <div>
                    <label className="block font-semibold mb-1">
                      {approvalAction === "approve" ? "Approval Notes" : "Reason for Rejection"}
                    </label>
                    <textarea
                      required={approvalAction === "reject"}
                      value={comment} onChange={e => setComment(e.target.value)}
                      placeholder={approvalAction === "approve" ? "e.g. Approved. Please hand over active tasks before leaving." : "Provide clear justification for rejection..."}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent min-h-16"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setShowApprovalModal(false); setSelectedRequest(null); }} className="px-4 py-2 border rounded-lg font-semibold">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actioning}
                      className={`px-4 py-2 text-white font-semibold rounded-lg shadow-sm ${approvalAction === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"} disabled:opacity-50`}
                    >
                      {actioning ? "Processing..." : approvalAction === "approve" ? "Approve Request" : "Reject Request"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-end pt-2 border-t">
                  <button type="button" onClick={() => { setShowApprovalModal(false); setSelectedRequest(null); }} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold">
                    Close Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-sm">Adjust Leave Balance</h3>
              <button onClick={() => setShowBalanceModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleBalanceSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Select Employee *</label>
                <select
                  required
                  value={balanceForm.user_id}
                  onChange={e => setBalanceForm(f => ({ ...f, user_id: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent"
                >
                  <option value="">-- Choose Employee --</option>
                  {profiles.filter(p => p.role !== 'client').map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Select Leave Type *</label>
                <select
                  required
                  value={balanceForm.leave_type_id}
                  onChange={e => setBalanceForm(f => ({ ...f, leave_type_id: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent"
                >
                  <option value="">-- Choose Leave Type --</option>
                  {leaveTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Total Days</label>
                  <input
                    type="number" required min={0}
                    value={balanceForm.total_days}
                    onChange={e => setBalanceForm(f => ({ ...f, total_days: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Carried Over</label>
                  <input
                    type="number" required min={0}
                    value={balanceForm.carried_over}
                    onChange={e => setBalanceForm(f => ({ ...f, carried_over: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Year</label>
                <input
                  type="number" required
                  value={balanceForm.year}
                  onChange={e => setBalanceForm(f => ({ ...f, year: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowBalanceModal(false)} className="px-4 py-2 border rounded-lg font-semibold">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actioning}
                  className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {actioning ? "Adjusting..." : "Update Balance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Type Modal */}
      {showTypeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-sm">
                {editingType ? 'Edit Leave Category Policy' : 'Create Leave Category Policy'}
              </h3>
              <button onClick={() => setShowTypeForm(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleTypeSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold mb-1">Category Name *</label>
                  <input
                    type="text" required placeholder="e.g. Compassionate Leave"
                    value={typeForm.name}
                    onChange={e => setTypeForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Code *</label>
                  <input
                    type="text" required placeholder="e.g. COMP"
                    value={typeForm.code}
                    onChange={e => setTypeForm(f => ({ ...f, code: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Annual Cap (Days) *</label>
                  <input
                    type="number" required min={0}
                    value={typeForm.default_days_per_year}
                    onChange={e => setTypeForm(f => ({ ...f, default_days_per_year: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Policy Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={typeForm.color}
                      onChange={e => setTypeForm(f => ({ ...f, color: e.target.value }))}
                      className="w-8 h-8 rounded border p-0 cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-slate-500 uppercase">{typeForm.color}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description / Policy Details</label>
                <textarea
                  value={typeForm.description}
                  onChange={e => setTypeForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the rules and parameters for applying to this category..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent min-h-16"
                />
              </div>

              <div className="space-y-2 border-t pt-3 font-semibold text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={typeForm.is_paid}
                    onChange={e => setTypeForm(f => ({ ...f, is_paid: e.target.checked }))}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>This category is fully paid (deductible allowance)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={typeForm.allow_half_day}
                    onChange={e => setTypeForm(f => ({ ...f, allow_half_day: e.target.checked }))}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Allow half-day applications</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={typeForm.requires_attachment}
                    onChange={e => setTypeForm(f => ({ ...f, requires_attachment: e.target.checked }))}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Require proof/attachment (e.g. Medical certificate)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowTypeForm(false)} className="px-4 py-2 border rounded-lg font-semibold">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actioning}
                  className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {actioning ? "Saving..." : "Save Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
