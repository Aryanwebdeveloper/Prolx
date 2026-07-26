"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart3, TrendingUp, Users, DollarSign, Calendar,
  Download, RefreshCw, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { createClient } from "../../../supabase/client";

type StatCard = {
  label: string;
  value: string | number;
  trend?: string;
  up?: boolean;
  icon: React.ElementType;
  color: string;
};

function StatCard({ label, value, trend, up, icon: Icon, color }: StatCard) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex justify-between items-start">
      <div>
        <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold font-mono mt-1" style={{ color }}>{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-1 text-[11px] font-semibold ${up ? 'text-emerald-600' : 'text-rose-500'}`}>
            {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </div>
        )}
      </div>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
  );
}

export default function AnalyticsPanel() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeProjects: 0,
    totalLeaveRequests: 0,
    pendingApplications: 0,
    totalCertificates: 0,
    totalInvoices: 0,
  });
  const [taskBreakdown, setTaskBreakdown] = useState({ todo: 0, in_progress: 0, done: 0, cancelled: 0 });
  const [leaveBreakdown, setLeaveBreakdown] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const [
        { count: empCount },
        { count: projCount },
        { count: leaveCount },
        { count: appCount },
        { count: certCount },
        { count: invCount },
        { data: taskData },
        { data: leaveData }
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("leave_requests").select("*", { count: "exact", head: true }),
        supabase.from("internal_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("certificates").select("*", { count: "exact", head: true }),
        supabase.from("invoices").select("*", { count: "exact", head: true }),
        supabase.from("staff_tasks").select("status"),
        supabase.from("leave_requests").select("status"),
      ]);

      setStats({
        totalEmployees: empCount || 0,
        activeProjects: projCount || 0,
        totalLeaveRequests: leaveCount || 0,
        pendingApplications: appCount || 0,
        totalCertificates: certCount || 0,
        totalInvoices: invCount || 0,
      });

      // Task breakdown
      const td = taskData || [];
      setTaskBreakdown({
        todo: td.filter(t => t.status === "todo").length,
        in_progress: td.filter(t => t.status === "in_progress").length,
        done: td.filter(t => t.status === "done").length,
        cancelled: td.filter(t => t.status === "cancelled").length,
      });

      // Leave breakdown
      const ld = leaveData || [];
      setLeaveBreakdown({
        pending: ld.filter(l => l.status === "pending").length,
        approved: ld.filter(l => l.status === "approved").length,
        rejected: ld.filter(l => l.status === "rejected").length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const statCards: StatCard[] = [
    { label: "Active Employees", value: stats.totalEmployees, trend: "+3 this month", up: true, icon: Users, color: "#0D9488" },
    { label: "Active Projects", value: stats.activeProjects, trend: "2 completing", up: true, icon: BarChart3, color: "#3B82F6" },
    { label: "Leave Requests", value: stats.totalLeaveRequests, icon: Calendar, color: "#F97316" },
    { label: "Pending HR Apps", value: stats.pendingApplications, icon: TrendingUp, color: "#EF4444" },
    { label: "Certificates Issued", value: stats.totalCertificates, trend: "+12 this year", up: true, icon: Download, color: "#8B5CF6" },
    { label: "Total Invoices", value: stats.totalInvoices, icon: DollarSign, color: "#10B981" },
  ];

  const taskTotal = taskBreakdown.todo + taskBreakdown.in_progress + taskBreakdown.done + taskBreakdown.cancelled || 1;
  const leaveTotal = leaveBreakdown.pending + leaveBreakdown.approved + leaveBreakdown.rejected || 1;

  return (
    <div className="space-y-6 text-xs">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-slate-800 text-base" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Analytics & Business Reports
          </h2>
          <p className="text-slate-400 text-[11px] mt-0.5">Live business intelligence dashboard across all departments</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 border rounded-lg font-semibold text-slate-500 hover:bg-slate-50">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map(card => <StatCard key={card.label} {...card} />)}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Task Breakdown */}
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4">Task Status Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: "To Do", count: taskBreakdown.todo, color: "#64748B" },
              { label: "In Progress", count: taskBreakdown.in_progress, color: "#F97316" },
              { label: "Done", count: taskBreakdown.done, color: "#10B981" },
              { label: "Cancelled", count: taskBreakdown.cancelled, color: "#94A3B8" },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="font-semibold" style={{ color: item.color }}>{item.label}</span>
                  <span className="font-mono font-bold text-slate-700">{item.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(item.count / taskTotal) * 100}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Breakdown */}
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4">Leave Request Status</h3>
          <div className="space-y-3">
            {[
              { label: "Pending Approval", count: leaveBreakdown.pending, color: "#F97316" },
              { label: "Approved", count: leaveBreakdown.approved, color: "#10B981" },
              { label: "Rejected", count: leaveBreakdown.rejected, color: "#EF4444" },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="font-semibold" style={{ color: item.color }}>{item.label}</span>
                  <span className="font-mono font-bold text-slate-700">{item.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(item.count / leaveTotal) * 100}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white rounded-xl p-5 shadow-sm">
        <h3 className="font-bold mb-2">Quick Insights Summary</h3>
        <ul className="space-y-1.5 text-[11px] text-teal-100">
          <li>• <strong className="text-white">{taskBreakdown.in_progress}</strong> tasks are currently in progress across the team.</li>
          <li>• <strong className="text-white">{leaveBreakdown.pending}</strong> leave requests are awaiting approval.</li>
          <li>• <strong className="text-white">{stats.pendingApplications}</strong> HR applications need to be reviewed.</li>
          <li>• <strong className="text-white">{stats.totalCertificates}</strong> certificates have been issued to employees.</li>
        </ul>
      </div>
    </div>
  );
}
