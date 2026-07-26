"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Activity, Search, RefreshCw, User, Clock, Eye } from "lucide-react";
import { createClient } from "../../../supabase/client";

type AuditEntry = {
  id: string;
  user_id: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
    role: string;
  };
};

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  INSERT: { bg: "#F0FDF4", text: "#16A34A" },
  UPDATE: { bg: "#EFF6FF", text: "#2563EB" },
  DELETE: { bg: "#FEF2F2", text: "#DC2626" },
  LOGIN:  { bg: "#F5F3FF", text: "#7C3AED" },
  LOGOUT: { bg: "#FFF7ED", text: "#EA580C" },
};

export default function AuditLogPanel() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("audit_log")
        .select(`
          *,
          user:profiles!audit_log_user_id_fkey(full_name, email, role)
        `)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      setEntries(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const filtered = entries.filter(e => {
    const matchSearch = !search ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      (e.table_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.user?.full_name || "").toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === "all" || e.action === filterAction;
    return matchSearch && matchAction;
  });

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  }

  return (
    <div className="space-y-5 text-xs">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-slate-800 text-base" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Audit Log & Security Trail
          </h2>
          <p className="text-slate-400 text-[11px]">
            Complete chronological record of all system events and data changes
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 border rounded-lg font-semibold text-slate-500 hover:bg-slate-50">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap bg-white border rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 border rounded-lg px-3 py-1.5 flex-1 min-w-[200px] max-w-xs">
          <Search size={12} className="text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search user, action, table..."
            className="bg-transparent outline-none w-full"
          />
        </div>
        <select
          value={filterAction} onChange={e => setFilterAction(e.target.value)}
          className="px-3 py-1.5 border rounded-lg focus:outline-none"
        >
          <option value="all">All Actions</option>
          <option value="INSERT">INSERT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="LOGIN">LOGIN</option>
        </select>
      </div>

      {/* Log Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">Loading audit trail...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Shield size={28} className="text-slate-200 mx-auto mb-2" />
            <p>No audit records found matching your search.</p>
          </div>
        ) : (
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="py-2.5 px-4 text-left font-semibold text-slate-500">Time</th>
                <th className="py-2.5 px-4 text-left font-semibold text-slate-500">User</th>
                <th className="py-2.5 px-4 text-left font-semibold text-slate-500">Action</th>
                <th className="py-2.5 px-4 text-left font-semibold text-slate-500">Table</th>
                <th className="py-2.5 px-4 text-left font-semibold text-slate-500">Record ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(entry => {
                const ac = ACTION_COLORS[entry.action] || { bg: "#F8FAFC", text: "#64748B" };
                return (
                  <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {formatTime(entry.created_at)}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#0D9488]/10 flex items-center justify-center text-[#0D9488] shrink-0">
                          <User size={10} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">{entry.user?.full_name || "System"}</p>
                          <p className="text-slate-400 capitalize">{entry.user?.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className="inline-block px-2 py-0.5 rounded font-bold uppercase tracking-wide"
                        style={{ background: ac.bg, color: ac.text }}
                      >
                        {entry.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      {entry.table_name || "—"}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[10px] text-slate-400 truncate max-w-[140px]">
                      {entry.record_id || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 border-t bg-slate-50">
          <span className="text-slate-500">
            Showing {page * PAGE_SIZE + 1}–{page * PAGE_SIZE + filtered.length}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 font-semibold hover:bg-slate-100"
            >
              ← Prev
            </button>
            <button
              disabled={entries.length < PAGE_SIZE}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 font-semibold hover:bg-slate-100"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
