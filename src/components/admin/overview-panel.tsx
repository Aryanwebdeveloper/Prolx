"use client";

import { useState, useEffect } from "react";
import { Eye, Mail, TrendingUp, BarChart3, User, Clock, Activity } from "lucide-react";
import { getGlobalStats, getOverviewAnalytics, getLiveVisitors } from "@/app/actions";

const COLORS = ["#0D9488", "#14B8A6", "#2DD4BF", "#F97316", "#6366F1"];

export default function OverviewPanel() {
  const [stats, setStats] = useState({ users: 0, contacts: 0, portfolio: 0, blog: 0 });
  const [analytics, setAnalytics] = useState<{
    visitorTrend: { label: string; count: number }[];
    leadSources: { source: string; pct: number }[];
    recentLeads: { name: string; email: string; service: string; created_at: string; status: string }[];
    topPagesHistory: { page: string; views: number }[];
  }>({ visitorTrend: [], leadSources: [], recentLeads: [], topPagesHistory: [] });
  const [liveData, setLiveData] = useState<{ activeCount: number, topPages: { path: string, count: number }[] }>({ activeCount: 0, topPages: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [statsData, analyticsData, live] = await Promise.all([
        getGlobalStats(),
        getOverviewAnalytics(),
        getLiveVisitors(),
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
      setLiveData(live);
      setLoading(false);
    }
    loadData();

    // Poll live visitors every 15 seconds
    const interval = setInterval(async () => {
      const live = await getLiveVisitors();
      setLiveData(live);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const statsCards = [
    { label: "Total Users", value: stats.users.toString(), trend: "Live", icon: Eye, color: "teal" },
    { label: "Leads Received", value: stats.contacts.toString(), trend: "Live", icon: Mail, color: "orange" },
    { label: "Portfolio Items", value: stats.portfolio.toString(), trend: "Live", icon: TrendingUp, color: "blue" },
    { label: "Blog Posts", value: stats.blog.toString(), trend: "Live", icon: BarChart3, color: "purple" },
  ];

  const maxCount = Math.max(...analytics.visitorTrend.map((d) => d.count), 1);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 animate-pulse">
              <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
              <div className="h-7 bg-gray-100 rounded w-16 mb-1" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 h-56 animate-pulse" />
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 h-56 animate-pulse" />
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 h-48 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Traffic Widget */}
      <div className="bg-[#0F172A] rounded-2xl p-6 text-white overflow-hidden relative">
        {/* Animated background rings */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0D9488]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        
        <div className="relative z-10 grid md:grid-cols-3 gap-8">
          <div className="col-span-1 border-r border-white/10 pr-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <span className="text-sm font-semibold tracking-wider text-emerald-400 uppercase">Live Right Now</span>
            </div>
            <div className="text-6xl font-bold mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {liveData.activeCount}
            </div>
            <p className="text-slate-400 text-sm">active visitors on site</p>
          </div>
          
          <div className="col-span-2">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Activity size={16} /> Top Active Pages
            </h3>
            {liveData.topPages.length === 0 ? (
              <div className="text-slate-500 text-sm py-4">No active pages to display.</div>
            ) : (
              <div className="space-y-3">
                {liveData.topPages.slice(0, 3).map((page, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2 border border-white/5">
                    <span className="font-mono text-sm text-slate-200 truncate pr-4">{page.path}</span>
                    <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded text-xs">
                      {page.count} active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map(({ label, value, trend, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                color === "teal" ? "bg-[#CCFBF1]" : color === "orange" ? "bg-[#FFF7ED]" : color === "blue" ? "bg-blue-50" : "bg-purple-50"
              }`}>
                <Icon size={18} className={
                  color === "teal" ? "text-[#0D9488]" : color === "orange" ? "text-[#F97316]" : color === "blue" ? "text-blue-500" : "text-purple-500"
                } />
              </div>
              <span className="text-xs font-semibold text-[#0D9488] bg-[#F0FDFA] px-2 py-0.5 rounded-full">{trend}</span>
            </div>
            <div className="text-2xl font-bold text-[#0F172A] mb-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
            <div className="text-xs text-[#64748B]">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visitor Trend – historical page views per day */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Visitor Trend (Last 7 Days)
            </h3>
            <span className="text-xs text-[#64748B] bg-[#F0FDFA] px-2 py-0.5 rounded-full">Unique visitors</span>
          </div>
          {analytics.visitorTrend.every((d) => d.count === 0) ? (
            <div className="flex flex-col items-center justify-center h-40 text-[#94A3B8]">
              <BarChart3 size={32} className="mb-2 opacity-30" />
              <p className="text-sm">No traffic recorded in the last 7 days</p>
            </div>
          ) : (
            <div className="flex items-end gap-3 h-40 mt-4">
              {analytics.visitorTrend.map(({ label, count }, i) => {
                const heightPct = Math.max((count / maxCount) * 100, count > 0 ? 8 : 2);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {count > 0 && (
                      <span className="absolute -top-5 text-xs font-mono text-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity">
                        {count}
                      </span>
                    )}
                    <div
                      className="w-full rounded-lg bg-gradient-to-t from-[#0D9488] to-[#2DD4BF] transition-all duration-500"
                      style={{ height: `${heightPct}%`, opacity: count === 0 ? 0.15 : 1 }}
                    />
                    <span className="text-xs text-[#64748B]">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Traffic Sources – grouping by referrer */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Traffic Sources
            </h3>
            <span className="text-xs text-[#64748B] bg-[#F0FDFA] px-2 py-0.5 rounded-full">By referring site</span>
          </div>
          {analytics.leadSources.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-[#94A3B8]">
              <Mail size={32} className="mb-2 opacity-30" />
              <p className="text-sm">No traffic sources recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {analytics.leadSources.map(({ source, pct }, i) => (
                <div key={source} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-[#64748B] flex-1 truncate">{source}</span>
                  <div className="w-32 h-2 bg-[#F0FDFA] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                  <span className="text-xs font-mono text-[#0F172A] w-10 text-right">{pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Pages History */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Top Pages (Last 7 Days)
            </h3>
            <span className="text-xs text-[#64748B] bg-[#F0FDFA] px-2 py-0.5 rounded-full">Most visited URLs</span>
          </div>
          {analytics.topPagesHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-[#94A3B8]">
              <Eye size={32} className="mb-2 opacity-30" />
              <p className="text-sm">No page views recorded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {analytics.topPagesHistory.map(({ page, views }, i) => (
                <div key={page} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl gap-3 group hover:bg-[#F1F5F9] transition-colors">
                  <div className="w-6 h-6 rounded bg-[#E2E8F0] text-[#64748B] flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm font-mono text-[#0D9488] flex-1 truncate">{page}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm text-[#0F172A] font-medium">{views}</span>
                    <span className="text-xs text-[#64748B]">views</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Recent Leads
            </h3>
            <span className="text-xs text-[#64748B] bg-[#F0FDFA] px-2 py-0.5 rounded-full">Latest contact submissions</span>
          </div>
          {analytics.recentLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-[#94A3B8]">
              <User size={32} className="mb-2 opacity-30" />
              <p className="text-sm">No leads yet — they'll appear here once someone contacts you</p>
            </div>
          ) : (
            <div className="space-y-2">
              {analytics.recentLeads.map((lead, i) => {
                const date = new Date(lead.created_at);
                const timeAgo = (() => {
                  const diff = Date.now() - date.getTime();
                  const mins = Math.floor(diff / 60000);
                  if (mins < 60) return `${mins}m ago`;
                  const hrs = Math.floor(mins / 60);
                  if (hrs < 24) return `${hrs}h ago`;
                  return `${Math.floor(hrs / 24)}d ago`;
                })();
                const statusColor =
                  lead.status === "Replied" ? "text-emerald-600 bg-emerald-50"
                  : lead.status === "Read" ? "text-blue-600 bg-blue-50"
                  : "text-[#F97316] bg-[#FFF7ED]";
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#CCFBF1] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#0D9488]">{lead.name?.charAt(0)?.toUpperCase() || "?"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{lead.name}</p>
                      <p className="text-xs text-[#64748B] truncate">{lead.email}</p>
                    </div>
                    <span className="text-xs text-[#64748B] shrink-0 font-mono">{lead.service || "General"}</span>
                    <div className="flex items-center gap-1 text-xs text-[#94A3B8] shrink-0">
                      <Clock size={11} />
                      {timeAgo}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusColor}`}>
                      {lead.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
