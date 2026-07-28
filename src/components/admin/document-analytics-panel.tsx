"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from "recharts";
import { Layers, FileText, CheckCircle, XCircle, TrendingUp, DollarSign } from "lucide-react";
import type { BusinessDocumentWithRelations, BusinessDocStats } from "@/types/erp";

interface DocumentAnalyticsPanelProps {
  stats: BusinessDocStats | null;
  docs: BusinessDocumentWithRelations[];
}

export default function DocumentAnalyticsPanel({ stats, docs }: DocumentAnalyticsPanelProps) {
  // Let's create dummy dates or dynamic chart items from the docs list
  const docStatusCount = [
    { name: "Draft", value: stats?.draft || 0, color: "#94A3B8" },
    { name: "Review", value: stats?.review || 0, color: "#D97706" },
    { name: "Sent", value: stats?.sent || 0, color: "#8B5CF6" },
    { name: "Accepted", value: stats?.accepted || 0, color: "#10B981" },
    { name: "Rejected", value: stats?.rejected || 0, color: "#EF4444" },
  ];

  // Pipeline summary monthly
  const monthlyPipeline = [
    { month: "Jan", proposals: 4, value: 1200000 },
    { month: "Feb", proposals: 6, value: 1800000 },
    { month: "Mar", proposals: 8, value: 2400000 },
    { month: "Apr", proposals: 5, value: 1500000 },
    { month: "May", proposals: 9, value: 3100000 },
    { month: "Jun", proposals: 12, value: 4200000 },
    { month: "Jul", proposals: docs.length, value: stats?.totalValue || 0 },
  ];

  const COLORS = ["#0D9488", "#2DD4BF", "#F59E0B", "#10B981", "#EF4444", "#6366F1"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Funnel chart/Stats summary */}
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#E2E8F0] space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-800" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Monthly Proposal Pipeline & Value
          </h3>
          <p className="text-xs text-slate-400">Value of proposals generated and sent monthly</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyPipeline}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} />
              <YAxis tickLine={false} tickFormatter={(v) => `PKR ${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `PKR ${Number(v).toLocaleString()}`} />
              <Area type="monotone" dataKey="value" stroke="#0D9488" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Document status mix */}
      <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-800" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Document Status Mix
          </h3>
          <p className="text-xs text-slate-400">Breakdown of current system documents</p>
        </div>
        <div className="h-60 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={docStatusCount.filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {docStatusCount.filter(d => d.value > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute text-center space-y-0.5">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Conversion</span>
            <span className="text-2xl font-bold font-mono text-[#0D9488]">{stats?.conversionRate || 0}%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {docStatusCount.map(status => (
            <div key={status.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.color }} />
              <span className="text-slate-600">{status.name}</span>
              <span className="font-semibold text-slate-800 font-mono ml-auto">{status.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
