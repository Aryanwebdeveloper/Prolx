"use client";

import { useState, useEffect } from "react";
import { Eye, Mail, TrendingUp, BarChart3 } from "lucide-react";
import { getGlobalStats } from "@/app/actions";

export default function OverviewPanel() {
  const [stats, setStats] = useState({ users: 0, contacts: 0, portfolio: 0, blog: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const data = await getGlobalStats();
      setStats(data);
      setLoading(false);
    }
    loadStats();
  }, []);

  const statsCards = [
    { label: "Total Users", value: stats.users.toString(), trend: "Live", icon: Eye, color: "teal" },
    { label: "Leads Received", value: stats.contacts.toString(), trend: "Live", icon: Mail, color: "orange" },
    { label: "Portfolio Items", value: stats.portfolio.toString(), trend: "Live", icon: TrendingUp, color: "blue" },
    { label: "Blog Posts", value: stats.blog.toString(), trend: "Live", icon: BarChart3, color: "purple" },
  ];

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading overview...</div>;
  }

  return (
    <div className="space-y-6">
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
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Visitor Trend (Last 7 Days)
          </h3>
          <div className="flex items-end gap-3 h-40">
            {[65, 45, 78, 92, 68, 85, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-[#0D9488]/10 rounded-lg relative overflow-hidden" style={{ height: `${h}%` }}>
                  <div className="absolute bottom-0 left-0 right-0 bg-[#0D9488] rounded-lg" style={{ height: "100%" }} />
                </div>
                <span className="text-xs text-[#64748B]">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Lead Sources
          </h3>
          <div className="space-y-3">
            {[
              { source: "Organic Search", pct: 42, color: "#0D9488" },
              { source: "Direct Traffic", pct: 25, color: "#14B8A6" },
              { source: "Social Media", pct: 18, color: "#2DD4BF" },
              { source: "Referral", pct: 10, color: "#CCFBF1" },
              { source: "Paid Ads", pct: 5, color: "#F97316" },
            ].map(({ source, pct, color }) => (
              <div key={source} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-sm text-[#64748B] flex-1">{source}</span>
                <div className="w-32 h-2 bg-[#F0FDFA] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
                <span className="text-xs font-mono text-[#0F172A] w-10 text-right">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          Top Pages
        </h3>
        <div className="space-y-2">
          {[
            { page: "/", views: "4,521", bounce: "32%" },
            { page: "/services", views: "2,184", bounce: "28%" },
            { page: "/portfolio", views: "1,842", bounce: "22%" },
            { page: "/blog", views: "1,456", bounce: "18%" },
            { page: "/contact", views: "987", bounce: "45%" },
          ].map(({ page, views, bounce }) => (
            <div key={page} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl">
              <span className="text-sm font-mono text-[#0D9488]">{page}</span>
              <div className="flex items-center gap-6">
                <span className="text-sm text-[#0F172A] font-medium">{views} views</span>
                <span className="text-xs text-[#64748B]">{bounce} bounce</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
