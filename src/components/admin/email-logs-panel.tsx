"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Loader2, CheckCircle, XCircle, AlertTriangle, Search, Send, Mail } from "lucide-react";
import { getEmailLogs, resendLoggedEmail } from "@/app/careers-actions";

export default function EmailLogsPanel() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [resendingId, setResendingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await getEmailLogs();
    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleResend = async (id: string) => {
    setResendingId(id);
    await resendLoggedEmail(id);
    await load();
    setResendingId(null);
  };

  const filtered = logs.filter(log => {
    const matchStatus = !filterStatus || log.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !search || log.recipient_email?.toLowerCase().includes(q) || log.subject?.toLowerCase().includes(q) || log.recipient_name?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const templateLabels: Record<string, string> = {
    application_received: "Application Received",
    shortlisted: "Shortlisted",
    interview_scheduled: "Interview Scheduled",
    rejected: "Rejected",
    hired: "Hired",
    custom: "Custom Email",
  };

  const stats = [
    { label: "Total Sent", count: logs.filter(l => l.status === "sent").length, color: "bg-green-500" },
    { label: "Failed", count: logs.filter(l => l.status === "failed").length, color: "bg-red-500" },
    { label: "Total Emails", count: logs.length, color: "bg-[#0D9488]" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-bold text-[#0F172A] text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Email Logs
            </h2>
            <p className="text-sm text-[#64748B] mt-1">Full audit trail of all automated and manual emails sent.</p>
          </div>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl transition-all">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search recipient or subject..."
              className="pl-8 pr-3 py-2 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:border-[#0D9488] w-64"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] focus:outline-none focus:border-[#0D9488]"
          >
            <option value="">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
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
            <p className="text-[#64748B]">Loading email logs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Mail size={40} className="mx-auto text-[#CBD5E1] mb-3" />
            <p className="text-[#64748B]">No email logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Recipient</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Subject</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Sent At</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#0F172A]">{log.recipient_name || log.recipient_email}</p>
                      <p className="text-xs text-[#64748B]">{log.recipient_email}</p>
                    </td>
                    <td className="py-3 px-4 text-[#64748B] max-w-xs">
                      <p className="truncate">{log.subject}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-[#F1F5F9] text-[#64748B] text-xs rounded-full">
                        {templateLabels[log.template_type] || log.template_type || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {log.status === "sent" ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <CheckCircle size={13} /> Sent
                        </span>
                      ) : log.status === "failed" ? (
                        <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                          <XCircle size={13} /> Failed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-500 text-xs font-medium">
                          <AlertTriangle size={13} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#64748B] text-xs">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {log.status === "failed" && (
                        <button
                          onClick={() => handleResend(log.id)}
                          disabled={resendingId === log.id}
                          className="px-3 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-[#94A3B8] text-white text-xs font-medium rounded-lg flex items-center gap-1 ml-auto transition-colors"
                        >
                          {resendingId === log.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                          Resend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
