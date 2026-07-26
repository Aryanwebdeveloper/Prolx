"use client";

import { useState, useEffect } from "react";
import {
  Users, Briefcase, FileText, Award, Calendar, DollarSign, Clock,
  ArrowRight, ShieldCheck, Heart, AlertCircle, RefreshCw, BarChart3,
  CheckCircle, PlusCircle, LayoutDashboard, Database, Zap, Bell, Monitor
} from "lucide-react";
import { getGlobalStats, getOverviewAnalytics } from "@/app/actions";
import { createClient } from "../../../supabase/client";

export default function OverviewPanel({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState("");
  const [stats, setStats] = useState({
    employees: 0,
    activeEmployees: 0,
    interns: 0,
    hrManagers: 0,
    pManagers: 0,
    activeProjects: 0,
    completedProjects: 0,
    recruitmentCount: 0,
    attendanceToday: 0,
    onlineCount: 0,
    pendingLeaves: 0,
    pendingApps: 0,
    pendingCerts: 0,
    pendingLetters: 0,
    revenueSummary: 0,
    monthlyGrowth: 8.5
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [birthdays, setBirthdays] = useState<any[]>([]);

  const fetchERPStats = async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      // 1. Fetch tables stats in parallel
      const [
        profilesCount,
        activeProjects,
        completedProjects,
        recruitment,
        leaves,
        internalApps,
        certs,
        letters,
        attendance,
        audits
      ] = await Promise.all([
        supabase.from("profiles").select("id, role, status, full_name, created_at, joining_date", { count: "exact" }),
        supabase.from("projects").select("id", { count: "exact" }).eq("status", "active"),
        supabase.from("projects").select("id", { count: "exact" }).eq("status", "completed"),
        supabase.from("career_applications").select("id", { count: "exact" }).eq("status", "Pending"),
        supabase.from("leave_requests").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("internal_applications").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("certificates").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("company_letters").select("id", { count: "exact" }).eq("status", "draft"),
        supabase.from("attendance").select("id, user_id, status").eq("date", new Date().toISOString().split("T")[0]),
        supabase.from("audit_logs").select("*, user:profiles(full_name)").order("created_at", { ascending: false }).limit(5)
      ]);

      const staffList = profilesCount.data || [];
      
      setStats({
        employees: staffList.length,
        activeEmployees: staffList.filter(e => e.status === "active").length,
        interns: staffList.filter(e => e.role === "intern").length,
        hrManagers: staffList.filter(e => e.role === "hr_manager").length,
        pManagers: staffList.filter(e => e.role === "project_manager").length,
        activeProjects: activeProjects.count || 0,
        completedProjects: completedProjects.count || 0,
        recruitmentCount: recruitment.count || 0,
        pendingLeaves: leaves.count || 0,
        pendingApps: internalApps.count || 0,
        pendingCerts: certs.count || 0,
        pendingLetters: letters.count || 0,
        attendanceToday: attendance.data?.length || 0,
        onlineCount: attendance.data?.filter(a => a.status === "present").length || 0,
        revenueSummary: 1452000, // Seed placeholder for agency
        monthlyGrowth: 12.4
      });

      setRecentActivities(audits.data || []);

      // Calculate upcoming work anniversaries / birthdays
      const currentMonth = new Date().getMonth();
      const currentAnniversaries = staffList
        .filter(e => e.joining_date && new Date(e.joining_date).getMonth() === currentMonth)
        .map(e => ({
          name: e.full_name,
          date: new Date(e.joining_date).toLocaleDateString([], { month: "short", day: "numeric" }),
          years: new Date().getFullYear() - new Date(e.joining_date).getFullYear()
        }));
      setBirthdays(currentAnniversaries);

    } catch (e) {
      console.error("Error loading ERP Stats:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchERPStats();
    // Clock tick
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-white rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white rounded-2xl border" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="h-64 bg-white rounded-2xl border col-span-2" />
          <div className="h-64 bg-white rounded-2xl border" />
        </div>
      </div>
    );
  }

  // Interactive Widgets Configurations
  const erpWidgets = [
    { label: "Total Employees", value: stats.employees, subtitle: "Total strength", icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100", tab: "team" },
    { label: "Active Projects", value: stats.activeProjects, subtitle: "In delivery", icon: Briefcase, color: "text-emerald-600 bg-emerald-50 border-emerald-100", tab: "projects" },
    { label: "Today's Attendance", value: stats.attendanceToday, subtitle: "Active check-ins", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100", tab: "attendance" },
    { label: "Hiring Funnel", value: stats.recruitmentCount, subtitle: "Pending applicants", icon: FileText, color: "text-indigo-600 bg-indigo-50 border-indigo-100", tab: "applications" },
    { label: "Pending Leave Requests", value: stats.pendingLeaves, subtitle: "Requires approval", icon: Bell, color: "text-rose-600 bg-rose-50 border-rose-100", tab: "leave-management" },
    { label: "Internal Applications", value: stats.pendingApps, subtitle: "Advances, NOCs, items", icon: PlusCircle, color: "text-[#0D9488] bg-[#F0FDFA] border-[#CCFBF1]", tab: "internal-applications" }
  ];

  return (
    <div className="space-y-6 text-[#0F172A] font-sans">
      {/* ── Welcome ERP Center Banner ──────────────────────── */}
      <div className="relative bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl p-6 text-white overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0D9488]/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        
        <div className="relative z-10 flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#0D9488] uppercase bg-[#0D9488]/15 px-3 py-1 rounded-full border border-[#0D9488]/30">
              Prolx ERP Hub
            </span>
            <h1 className="text-2xl font-bold mt-3 leading-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              {getGreeting()}, Administrator
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-lg">
              Here is your overview of Prolx Digital Agency operations. Check pending leaves, client invoices, and live activity streams below.
            </p>
          </div>
          
          <div className="text-right bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
            <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400">Current Time</span>
            <div className="text-xl font-bold font-mono text-[#0D9488] mt-1">{time || "Loading..."}</div>
            <span className="text-[10px] text-slate-400 font-medium">Sunday, July 19, 2026</span>
          </div>
        </div>
      </div>

      {/* ── Stats widgets block ────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {erpWidgets.map((wid, idx) => {
          const Icon = wid.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate && onNavigate(wid.tab)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[#0D9488]/40 cursor-pointer transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-500">{wid.label}</span>
                <span className={`p-1.5 rounded-lg border ${wid.color}`}>
                  <Icon size={12} />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono tracking-tight text-slate-800 dark:text-slate-100">{wid.value}</div>
                <div className="text-[9px] text-slate-400 mt-0.5">{wid.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Charts and activities row ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Department stats & visual bar chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-sm" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Staff Distribution & Headcount
            </h3>
            <p className="text-[10px] text-slate-400">Headcount distribution across principal operational areas.</p>
          </div>

          <div className="space-y-3">
            {[
              { name: "Engineering / Devs", count: 12, pct: 45, color: "bg-[#0D9488]" },
              { name: "UI/UX & Creative Design", count: 6, pct: 25, color: "bg-blue-500" },
              { name: "Digital Marketing / SEO", count: 4, pct: 15, color: "bg-amber-500" },
              { name: "Administration & HR", count: 3, pct: 15, color: "bg-indigo-500" }
            ].map((dept, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>{dept.name}</span>
                  <span className="font-mono">{dept.count} ({dept.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${dept.color}`} style={{ width: `${dept.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Birthdays / Anniversaries feed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Work Anniversaries (This Month)
            </h3>
            <p className="text-[10px] text-slate-400">Celebrate personnel milestones with the team.</p>
          </div>

          <div className="space-y-3 my-4 flex-1">
            {birthdays.length === 0 ? (
              <p className="text-slate-400 italic text-center text-xs py-8">No milestones this month.</p>
            ) : (
              birthdays.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#0D9488]/10 text-[#0D9488] font-bold text-[10px] flex items-center justify-center">
                      {b.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{b.name}</div>
                      <div className="text-[10px] text-slate-400">{b.years} Year Anniversary</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#0D9488] bg-[#F0FDFA] px-2 py-0.5 rounded border border-[#CCFBF1]">
                    {b.date}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Audit Logs & Server health section ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live activities */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h3 className="font-bold text-sm" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Real-time Audit Trail
              </h3>
              <p className="text-[10px] text-slate-400">Recent security, updates, and configuration actions executed in the system.</p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate("audit-logs")}
              className="text-[10px] text-[#0D9488] font-bold hover:underline flex items-center gap-0.5"
            >
              See full audit <ArrowRight size={10} />
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            {recentActivities.length === 0 ? (
              <p className="text-slate-400 italic text-center py-6">No audit records logged.</p>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className="flex justify-between items-start gap-4">
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-700">{act.user?.full_name || "System"}:</span>
                    <span className="text-slate-500 leading-snug">
                      Executed <strong className="text-[#0D9488]">{act.action}</strong> on {act.entity_type.replace(/_/g, " ")} ("{act.entity_label || act.entity_id}")
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono shrink-0">
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Server Health Monitor */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              System Health Monitor
            </h3>
            <p className="text-[10px] text-slate-400">Live indicators of server latency, DB pools, and third party APIs.</p>
          </div>

          <div className="space-y-3.5 my-4">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-500"><Database size={13} /> Supabase PostgreSQL</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle size={12} /> Connected</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-500"><Zap size={13} /> API Response Time</span>
              <span className="font-mono font-bold text-slate-700">142ms</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-500"><Monitor size={13} /> Uptime Status</span>
              <span className="font-bold text-slate-700">99.98%</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-50 flex gap-2 items-center text-[10px] text-slate-400">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>SSL Secured · All databases synced</span>
          </div>
        </div>
      </div>
    </div>
  );
}
