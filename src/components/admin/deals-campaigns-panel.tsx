"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles, Tag, PlusCircle, Edit, Trash2, Save, X, Eye, TrendingUp,
  MessageSquare, Users, Download, Calendar, Flame, RefreshCw, Layers,
  CheckCircle2, Search, ChevronDown, ChevronRight, BarChart2, Zap,
  Clock, ShieldCheck, Award, Info
} from "lucide-react";
import {
  getAdminCampaigns, saveCampaign, savePackage, deletePackage,
  updateDealLeadStatus, DealCampaign, DealPackage
} from "@/app/deals-actions";

type SubTab = "campaigns" | "packages" | "analytics" | "leads";

const STATUS_COLORS: Record<string, string> = {
  "New": "bg-amber-100 text-amber-800",
  "Contacted": "bg-blue-100 text-blue-800",
  "In Progress": "bg-purple-100 text-purple-800",
  "Closed": "bg-emerald-100 text-emerald-800",
  "Lost": "bg-slate-100 text-slate-500",
};

const DEMO_LEADS = [
  { id: "demo-1", name: "Ahmad Raza", whatsapp_number: "03001234567", package_name: "Starter Business Website", deal_price: "PKR 9,999", business_type: "Restaurant / Café", status: "New", utm_source: "Facebook", created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: "demo-2", name: "Fatima Khan", whatsapp_number: "03211234567", package_name: "Professional Business Website", deal_price: "PKR 17,999", business_type: "Boutique / Clothing", status: "Contacted", utm_source: "Instagram", created_at: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: "demo-3", name: "Usman Ali", whatsapp_number: "03451234567", package_name: "E-Commerce Storefront", deal_price: "PKR 24,999", business_type: "E-Commerce Store", status: "In Progress", utm_source: "Direct", created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: "demo-4", name: "Sara Malik", whatsapp_number: "03121234567", package_name: "Salon & Beauty Booking Website", deal_price: "PKR 14,999", business_type: "Salon / Beauty", status: "Closed", utm_source: "Facebook", created_at: new Date(Date.now() - 3600000 * 48).toISOString() },
  { id: "demo-5", name: "Bilal Hassan", whatsapp_number: "03331234567", package_name: "Real Estate Property Portal", deal_price: "PKR 27,999", business_type: "Real Estate", status: "New", utm_source: "Instagram", created_at: new Date(Date.now() - 3600000 * 72).toISOString() },
];

export default function DealsCampaignsPanel() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("campaigns");
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [packages, setPackages] = useState<DealPackage[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [isDemoData, setIsDemoData] = useState(false);

  // Search & Filter
  const [leadSearch, setLeadSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);

  const [campaignForm, setCampaignForm] = useState({
    id: "", title: "", slug: "14-august", subtitle: "",
    announcement_text: "", countdown_end_date: "",
    total_slots: 20, available_slots: 7, is_active: true,
  });

  const [packageForm, setPackageForm] = useState({
    id: "", campaign_id: "", category_id: "business", category_name: "Business Website",
    name: "", regular_price_pkr: 19999, deal_price_pkr: 9999, description: "",
    features: "", delivery_estimate: "3 to 5 Days", is_popular: false,
    badge_text: "14 August Deal", display_order: 1, is_active: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminCampaigns();
      const realLeads = data.leads || [];
      setCampaigns(data.campaigns as any || []);
      setPackages(data.packages as any || []);
      setLeads(realLeads);
      setAnalytics(data.analytics || []);
      setIsDemoData(false);
    } catch (e) {
      console.error(e);
      setLeads([]);
      setIsDemoData(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleEditCampaign = (camp: any) => {
    setEditingCampaign(camp);
    setCampaignForm({
      id: camp.id, title: camp.title || "", slug: camp.slug || "14-august",
      subtitle: camp.subtitle || "", announcement_text: camp.announcement_text || "",
      countdown_end_date: camp.countdown_end_date ? new Date(camp.countdown_end_date).toISOString().slice(0, 16) : "",
      total_slots: camp.total_slots ?? 20, available_slots: camp.available_slots ?? 7,
      is_active: camp.is_active ?? true,
    });
    setShowCampaignModal(true);
  };

  const handleSaveCampaign = async () => {
    setSaving(true);
    try {
      await saveCampaign(campaignForm);
      setShowCampaignModal(false);
      loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleEditPackage = (pkg: any) => {
    setEditingPackage(pkg);
    setPackageForm({
      id: pkg.id, campaign_id: pkg.campaign_id || "",
      category_id: pkg.category_id || "business", category_name: pkg.category_name || "Business Website",
      name: pkg.name || "", regular_price_pkr: pkg.regular_price_pkr || 19999,
      deal_price_pkr: pkg.deal_price_pkr || 9999, description: pkg.description || "",
      features: Array.isArray(pkg.features) ? pkg.features.join("\n") : pkg.features || "",
      delivery_estimate: pkg.delivery_estimate || "3 to 5 Days",
      is_popular: pkg.is_popular || false, badge_text: pkg.badge_text || "14 August Deal",
      display_order: pkg.display_order || 1, is_active: pkg.is_active ?? true,
    });
    setShowPackageModal(true);
  };

  const handleSavePackage = async () => {
    setSaving(true);
    try {
      await savePackage(packageForm);
      setShowPackageModal(false);
      loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    await deletePackage(id);
    loadData();
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    if (isDemoData) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      return;
    }
    await updateDealLeadStatus(leadId, newStatus);
    loadData();
  };

  const exportLeadsCSV = () => {
    const data = isDemoData ? DEMO_LEADS : leads;
    if (data.length === 0) return alert("No leads to export.");
    const headers = ["Date", "Name", "WhatsApp", "Package", "Price", "Business Type", "Status", "UTM Source"];
    const rows = data.map((l) => [
      new Date(l.created_at).toLocaleDateString(),
      `"${l.name || ''}"`, `"${l.whatsapp_number || ''}"`, `"${l.package_name || ''}"`,
      `"${l.deal_price || ''}"`, `"${l.business_type || ''}"`, `"${l.status || ''}"`, `"${l.utm_source || 'Direct'}"`,
    ]);
    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `prolx_14_august_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter((l) => {
    const q = leadSearch.toLowerCase();
    const matchSearch = !leadSearch ||
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.whatsapp_number && l.whatsapp_number.includes(leadSearch)) ||
      (l.package_name && l.package_name.toLowerCase().includes(q));
    return matchSearch && (statusFilter === "all" || l.status === statusFilter);
  });

  // Dynamic Real Analytics calculations strictly from database
  const pageViews = analytics.filter(a => a.event_type === "page_view").length;
  const ctaClicks = analytics.filter(a => a.event_type === "cta_click").length;
  const waClicks = analytics.filter(a => a.event_type === "whatsapp_click").length;
  const totalLeadsCount = leads.length;

  // Real conversion rate calculation
  const totalEngagements = waClicks + ctaClicks + totalLeadsCount;
  const convRate = pageViews > 0
    ? ((totalEngagements / pageViews) * 100).toFixed(1)
    : totalLeadsCount > 0 ? "100.0" : "0.0";

  // Dynamic traffic channels breakdown calculated from real utm_source data
  const trafficChannelCounts = (() => {
    const counts: Record<string, number> = { "Facebook": 0, "Instagram": 0, "Direct / Organic": 0 };
    let totalSources = 0;

    const sourcesList = [
      ...analytics.map(a => a.utm_source),
      ...leads.map(l => l.utm_source)
    ].filter(Boolean);

    sourcesList.forEach(src => {
      const lower = String(src).toLowerCase();
      totalSources++;
      if (lower.includes("fb") || lower.includes("facebook")) {
        counts["Facebook"]++;
      } else if (lower.includes("ig") || lower.includes("insta")) {
        counts["Instagram"]++;
      } else {
        counts["Direct / Organic"]++;
      }
    });

    if (totalSources === 0) {
      return [
        { label: "Direct / Organic", pct: 100, color: "bg-slate-400" },
        { label: "Facebook Ads", pct: 0, color: "bg-blue-400" },
        { label: "Instagram Ads", pct: 0, color: "bg-pink-400" },
      ];
    }

    return [
      { label: "Facebook Ads", pct: Math.round((counts["Facebook"] / totalSources) * 100), color: "bg-blue-400" },
      { label: "Instagram Ads", pct: Math.round((counts["Instagram"] / totalSources) * 100), color: "bg-pink-400" },
      { label: "Direct / Organic", pct: Math.round((counts["Direct / Organic"] / totalSources) * 100), color: "bg-slate-400" },
    ];
  })();

  const SUBTABS: { id: SubTab; label: string; shortLabel: string; icon: any; count?: number }[] = [
    { id: "campaigns", label: "Campaign Settings", shortLabel: "Campaign", icon: Sparkles },
    { id: "packages", label: "Deal Packages & Pricing", shortLabel: "Packages", icon: Tag },
    { id: "analytics", label: "Analytics & Tracking", shortLabel: "Analytics", icon: TrendingUp },
    { id: "leads", label: `Leads (${leads.length})`, shortLabel: `Leads (${leads.length})`, icon: Users, count: leads.length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <RefreshCw size={28} className="animate-spin text-[#0D9488] mx-auto" />
          <p className="text-sm text-[#64748B]">Loading Deals & Campaigns data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      {/* ── HEADER CARD ── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl">🇵🇰</span>
              <h2 className="font-bold text-[#0F172A] text-lg" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Deals & Campaigns Manager
              </h2>
              <span className="bg-[#006633] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                14 August Active
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Manage Independence Day deals, package pricing, remaining project slots, leads, and conversion analytics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="Refresh"
              className="p-2 border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-xl text-[#64748B] transition-colors"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <a
              href="/deals/14-august"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl text-xs transition-all shadow-sm"
            >
              <Eye size={13} /> <span className="hidden sm:inline">Preview Live Page</span><span className="sm:hidden">Preview</span>
            </a>
          </div>
        </div>

        {/* Sub Tabs — Horizontally scrollable on mobile */}
        <div className="flex items-center gap-1.5 border-t border-[#E2E8F0] mt-4 pt-4 overflow-x-auto pb-1 scrollbar-none">
          {SUBTABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                  isActive ? "bg-[#0D9488] text-white shadow-sm" : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                }`}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 1. CAMPAIGNS TAB ── */}
      {activeSubTab === "campaigns" && (
        <div className="space-y-4">
          {campaigns.map((camp) => (
            <div key={camp.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider bg-[#F0FDFA] px-2 py-0.5 rounded-md">
                      /{camp.slug}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${camp.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {camp.is_active ? "● Active" : "● Inactive"}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#0F172A] text-base mt-1">{camp.title}</h3>
                  <p className="text-xs text-[#64748B] italic mt-0.5">{camp.subtitle}</p>
                </div>
                <button
                  onClick={() => handleEditCampaign(camp)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0D9488] font-bold rounded-xl text-xs transition-colors shrink-0"
                >
                  <Edit size={13} /> Edit
                </button>
              </div>

              {/* Campaign Stats Grid */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total Slots", value: camp.total_slots, color: "text-[#0F172A]" },
                  { label: "Available Slots", value: camp.available_slots, color: "text-emerald-600 font-bold" },
                  {
                    label: "Countdown End",
                    value: camp.countdown_end_date ? new Date(camp.countdown_end_date).toLocaleDateString("en-PK") : "Default",
                    color: "text-[#0F172A] font-mono text-xs"
                  },
                  {
                    label: "Slots Used",
                    value: `${Math.round(((camp.total_slots - camp.available_slots) / camp.total_slots) * 100)}%`,
                    color: "text-amber-600 font-bold"
                  },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
                    <p className="text-[10px] text-[#64748B] font-semibold">{stat.label}</p>
                    <p className={`text-sm mt-0.5 ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Slots Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${((camp.total_slots - camp.available_slots) / camp.total_slots) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#64748B] mt-1">
                  <span>{camp.total_slots - camp.available_slots} slots booked</span>
                  <span>{camp.available_slots} remaining</span>
                </div>
              </div>

              {/* Announcement Text */}
              {camp.announcement_text && (
                <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[11px] text-emerald-700 font-medium">📢 {camp.announcement_text}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── 2. PACKAGES TAB ── */}
      {activeSubTab === "packages" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#0F172A] text-base">Deal Packages & Pricing</h3>
              <p className="text-xs text-[#64748B]">{packages.length} packages configured</p>
            </div>
            <button
              onClick={() => {
                setEditingPackage(null);
                setPackageForm({
                  id: "", campaign_id: campaigns[0]?.id || "", category_id: "business",
                  category_name: "Business Website", name: "", regular_price_pkr: 19999,
                  deal_price_pkr: 9999, description: "", features: "",
                  delivery_estimate: "3 to 5 Days", is_popular: false,
                  badge_text: "14 August Deal", display_order: packages.length + 1, is_active: true,
                });
                setShowPackageModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              <PlusCircle size={14} /> <span className="hidden sm:inline">Add Package</span><span className="sm:hidden">Add</span>
            </button>
          </div>

          {/* Mobile Cards view */}
          <div className="space-y-3">
            {packages.map((pkg: any) => {
              const savings = pkg.regular_price_pkr - pkg.deal_price_pkr;
              const savePct = Math.round((savings / pkg.regular_price_pkr) * 100);
              const isExpanded = expandedPackage === pkg.id;
              return (
                <div key={pkg.id} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedPackage(isExpanded ? null : pkg.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-[#64748B] font-mono bg-[#F8FAFC] px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                            #{pkg.display_order}
                          </span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
                            {pkg.badge_text || "Deal"}
                          </span>
                          {pkg.is_popular && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">🔥 Popular</span>
                          )}
                        </div>
                        <div className="font-bold text-[#0F172A] text-sm mt-1">{pkg.name}</div>
                        <div className="text-[10px] text-[#64748B]">{pkg.category_name}</div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-black text-emerald-600 text-base">PKR {Number(pkg.deal_price_pkr).toLocaleString()}</div>
                        <div className="text-[10px] line-through text-[#94A3B8]">PKR {Number(pkg.regular_price_pkr).toLocaleString()}</div>
                        <div className="text-[10px] text-amber-600 font-bold">{savePct}% OFF</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-[#64748B]">⏱ {pkg.delivery_estimate}</span>
                      <ChevronDown size={14} className={`text-[#94A3B8] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {/* Expanded Features */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-[#F1F5F9]">
                      <p className="text-[11px] text-[#64748B] mt-3 leading-relaxed">{pkg.description}</p>
                      {pkg.features && (
                        <div className="mt-3 space-y-1.5">
                          <p className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider">Features:</p>
                          {(Array.isArray(pkg.features) ? pkg.features : String(pkg.features).split("\n").filter(Boolean)).map((f: string, i: number) => (
                            <div key={i} className="flex items-start gap-1.5 text-[11px] text-[#374151]">
                              <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleEditPackage(pkg)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0D9488] font-bold rounded-xl text-xs transition-colors"
                        >
                          <Edit size={13} /> Edit Package
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 font-bold rounded-xl text-xs transition-colors"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table view — hidden on small screens */}
          <div className="hidden xl:block bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold text-left">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Package Name & Category</th>
                    <th className="py-3 px-4">Regular Price</th>
                    <th className="py-3 px-4">Azadi Deal Price</th>
                    <th className="py-3 px-4">Savings</th>
                    <th className="py-3 px-4">Delivery</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg: any) => {
                    const savings = pkg.regular_price_pkr - pkg.deal_price_pkr;
                    return (
                      <tr key={pkg.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-mono font-bold text-[#64748B]">{pkg.display_order}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-bold text-[#0F172A]">{pkg.name}</div>
                              <div className="text-[10px] text-[#64748B]">{pkg.category_name}</div>
                            </div>
                            {pkg.is_popular && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold">🔥</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 line-through text-[#64748B]">PKR {Number(pkg.regular_price_pkr).toLocaleString()}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">PKR {Number(pkg.deal_price_pkr).toLocaleString()}</td>
                        <td className="py-3 px-4 text-amber-600 font-semibold">PKR {savings.toLocaleString()}</td>
                        <td className="py-3 px-4 text-[#64748B]">{pkg.delivery_estimate}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => handleEditPackage(pkg)} className="p-1.5 rounded-lg hover:bg-[#F0FDFA] text-[#0D9488]">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeletePackage(pkg.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. ANALYTICS TAB ── */}
      {activeSubTab === "analytics" && (
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Page Views", value: pageViews, icon: Eye, color: "#0D9488", bg: "#F0FDFA" },
              { label: "CTA Clicks", value: ctaClicks, icon: Zap, color: "#3B82F6", bg: "#EFF6FF" },
              { label: "WhatsApp Clicks", value: waClicks, icon: MessageSquare, color: "#25D366", bg: "#F0FFF4" },
              { label: "Total Leads", value: totalLeadsCount, icon: Users, color: "#F59E0B", bg: "#FFFBEB" },
            ].map((card, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#64748B] leading-tight">{card.label}</span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: card.bg }}>
                    <card.icon size={16} style={{ color: card.color }} />
                  </div>
                </div>
                <div className="text-2xl font-black font-mono text-[#0F172A]">{card.value}</div>
              </div>
            ))}
          </div>

          {/* Conversion Summary */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 shadow-sm">
            <h3 className="font-bold text-[#0F172A] text-base mb-4 flex items-center gap-2">
              <BarChart2 size={18} className="text-[#0D9488]" /> Campaign Conversion Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div className="text-[#64748B] text-xs font-semibold">Estimated Conversion Rate</div>
                <div className="text-3xl font-black text-emerald-600 font-mono mt-1">{convRate}%</div>
                <p className="text-[10px] text-[#64748B] mt-1">Visitors who submitted a lead or clicked WhatsApp.</p>
              </div>

              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div className="text-[#64748B] text-xs font-semibold mb-2">Top Traffic Channels</div>
                <div className="space-y-2">
                  {trafficChannelCounts.map((ch, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#374151] font-medium">{ch.label}</span>
                        <span className="font-bold text-[#0F172A] font-mono">{ch.pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`${ch.color} h-full rounded-full transition-all duration-300`} style={{ width: `${ch.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Package Interest Breakdown (Dynamic from real database leads) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 shadow-sm">
            <h3 className="font-bold text-[#0F172A] text-sm mb-4">Package Interest Breakdown</h3>
            <div className="space-y-2.5">
              {(() => {
                // Dynamically count leads per package name
                const packageCounts: Record<string, number> = {};
                leads.forEach((l: any) => {
                  const pName = l.package_name || "Other Deals";
                  packageCounts[pName] = (packageCounts[pName] || 0) + 1;
                });

                // Standard packages list to ensure all major packages appear even if 0 leads
                const defaultPackages = [
                  "Professional Business Website",
                  "E-Commerce Storefront",
                  "Starter Business Website",
                  "Restaurant & Café Website",
                  "Salon & Beauty Booking Website",
                  "Real Estate Property Portal",
                  "Boutique & Fashion Showcase",
                ];

                const allPackageNames = Array.from(
                  new Set([...defaultPackages, ...Object.keys(packageCounts)])
                );

                return allPackageNames.map((name, i) => {
                  const count = packageCounts[name] || 0;
                  const pct = totalLeadsCount > 0 ? Math.round((count / totalLeadsCount) * 100) : 0;

                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-[#374151] font-medium truncate pr-2">{name}</span>
                          <span className="text-[#64748B] shrink-0 font-mono">
                            {count} {count === 1 ? "lead" : "leads"} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#0D9488] to-emerald-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(pct, count > 0 ? 5 : 0)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── 4. LEADS TAB ── */}
      {activeSubTab === "leads" && (
        <div className="space-y-4">
          {/* Demo data notice */}
          {isDemoData && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
              <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-700">Showing Demo Data</p>
                <p className="text-[11px] text-amber-600 mt-0.5">
                  No real leads in database yet. These are sample leads to preview the interface. Real leads will appear here when visitors submit the demo form on the live page.
                </p>
              </div>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 shadow-sm space-y-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-[#F8FAFC] rounded-xl px-3 py-2.5 border border-[#E2E8F0]">
              <Search size={14} className="text-[#94A3B8] shrink-0" />
              <input
                type="text"
                placeholder="Search by name, WhatsApp, or package..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="w-full bg-transparent text-xs outline-none text-[#0F172A] placeholder-[#94A3B8]"
              />
              {leadSearch && (
                <button onClick={() => setLeadSearch("")} className="text-[#94A3B8] hover:text-[#0F172A]">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filters Row */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold text-[#64748B]">Filter:</span>
                {["all", "New", "Contacted", "In Progress", "Closed", "Lost"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                      statusFilter === s
                        ? "bg-[#0D9488] text-white"
                        : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
              <button
                onClick={exportLeadsCSV}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-xl text-xs transition-all shadow-sm"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[
              { label: "Total", count: leads.length, color: "text-[#0F172A]" },
              { label: "New", count: leads.filter(l => l.status === "New").length, color: "text-amber-600" },
              { label: "Contacted", count: leads.filter(l => l.status === "Contacted").length, color: "text-blue-600" },
              { label: "Closed", count: leads.filter(l => l.status === "Closed").length, color: "text-emerald-600" },
              { label: "Lost", count: leads.filter(l => l.status === "Lost").length, color: "text-slate-400" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-2.5 text-center shadow-sm">
                <div className={`text-lg font-black font-mono ${s.color}`}>{s.count}</div>
                <div className="text-[10px] text-[#64748B] font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Lead Cards (Mobile-first) */}
          <div className="space-y-3">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#0F172A] text-sm">{lead.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[lead.status] || "bg-slate-100 text-slate-600"}`}>
                        {lead.status}
                      </span>
                    </div>
                    <a
                      href={`https://wa.me/${(lead.whatsapp_number || '').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#0D9488] font-bold hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <MessageSquare size={11} /> {lead.whatsapp_number}
                    </a>
                    <div className="text-[11px] text-[#374151] mt-1 font-medium">{lead.package_name}</div>
                    <div className="text-[11px] text-emerald-600 font-bold">{lead.deal_price}</div>
                  </div>

                  <div className="shrink-0 text-right space-y-1">
                    <div className="text-[10px] text-[#94A3B8]">{new Date(lead.created_at).toLocaleDateString()}</div>
                    <div className="text-[10px] text-[#64748B] bg-[#F8FAFC] px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                      {lead.utm_source || "Direct"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 flex-wrap border-t border-[#F1F5F9] pt-3">
                  <span className="text-[10px] text-[#64748B]">{lead.business_type || "N/A"}</span>

                  <div className="ml-auto flex items-center gap-2">
                    {/* Status Selector */}
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border-none focus:outline-none cursor-pointer ${STATUS_COLORS[lead.status] || "bg-slate-100"}`}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                      <option value="Lost">Lost</option>
                    </select>

                    <a
                      href={`https://wa.me/${(lead.whatsapp_number || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${lead.name}! Thank you for your interest in our ${lead.package_name} Azadi Special Deal. We'd love to discuss your website requirements!`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-[#25D366] text-white font-bold text-[10px] rounded-lg inline-flex items-center gap-1"
                    >
                      <MessageSquare size={11} /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {filteredLeads.length === 0 && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center shadow-sm">
                <Users size={32} className="text-[#CBD5E1] mx-auto mb-2" />
                <p className="text-sm text-[#64748B] font-semibold">No leads found</p>
                <p className="text-xs text-[#94A3B8] mt-1">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CAMPAIGN EDIT MODAL ── */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-5 sm:p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-[#0F172A]">Edit Campaign Settings</h3>
              <button onClick={() => setShowCampaignModal(false)} className="p-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#64748B]">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#374151]">Campaign Title</label>
                <input type="text" value={campaignForm.title}
                  onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0D9488] text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#374151]">Headline Subtitle</label>
                <input type="text" value={campaignForm.subtitle}
                  onChange={(e) => setCampaignForm({ ...campaignForm, subtitle: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0D9488] text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#374151]">Announcement Banner Text</label>
                <input type="text" value={campaignForm.announcement_text}
                  onChange={(e) => setCampaignForm({ ...campaignForm, announcement_text: e.target.value })}
                  placeholder="e.g. 🇵🇰 Up to 50% OFF — Limited Time!"
                  className="w-full p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0D9488] text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#374151]">Total Slots</label>
                  <input type="number" value={campaignForm.total_slots}
                    onChange={(e) => setCampaignForm({ ...campaignForm, total_slots: Number(e.target.value) })}
                    className="w-full p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0D9488] text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#374151]">Available Slots</label>
                  <input type="number" value={campaignForm.available_slots}
                    onChange={(e) => setCampaignForm({ ...campaignForm, available_slots: Number(e.target.value) })}
                    className="w-full p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0D9488] font-bold text-emerald-600 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#374151]">Countdown End Date & Time</label>
                <input type="datetime-local" value={campaignForm.countdown_end_date}
                  onChange={(e) => setCampaignForm({ ...campaignForm, countdown_end_date: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0D9488] font-mono text-sm"
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <input type="checkbox" id="camp-active" checked={campaignForm.is_active}
                  onChange={(e) => setCampaignForm({ ...campaignForm, is_active: e.target.checked })}
                  className="w-4 h-4 accent-[#0D9488]"
                />
                <label htmlFor="camp-active" className="text-sm font-semibold text-[#374151] cursor-pointer">
                  Campaign is Active (visible on live page)
                </label>
              </div>
            </div>

            <div className="pt-2 flex gap-2 border-t border-[#E2E8F0]">
              <button onClick={() => setShowCampaignModal(false)}
                className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-[#64748B] font-semibold text-sm"
              >
                Cancel
              </button>
              <button onClick={handleSaveCampaign} disabled={saving}
                className="flex-1 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PACKAGE EDIT MODAL ── */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg p-5 sm:p-6 space-y-4 shadow-xl max-h-[92vh] overflow-y-auto">
            {/* Drag handle for mobile */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-1 sm:hidden" />

            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-[#0F172A]">
                {editingPackage ? "Edit Pricing Package" : "Add New Package"}
              </h3>
              <button onClick={() => setShowPackageModal(false)} className="p-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#64748B]">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#374151]">Package Name</label>
                  <input type="text" value={packageForm.name}
                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                    placeholder="Starter Business Website"
                    className="w-full p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0D9488] text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#374151]">Category</label>
                  <select value={packageForm.category_id}
                    onChange={(e) => {
                      const map: Record<string, string> = {
                        business: "Business Website", ecommerce: "E-Commerce Website",
                        restaurant: "Restaurant & Café", boutique: "Boutique & Fashion",
                        salon: "Salon & Beauty", realestate: "Real Estate Website",
                      };
                      setPackageForm({ ...packageForm, category_id: e.target.value, category_name: map[e.target.value] || e.target.value });
                    }}
                    className="w-full p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0D9488] text-sm"
                  >
                    <option value="business">Business Website</option>
                    <option value="ecommerce">E-Commerce Website</option>
                    <option value="restaurant">Restaurant & Café</option>
                    <option value="boutique">Boutique & Fashion</option>
                    <option value="salon">Salon & Beauty</option>
                    <option value="realestate">Real Estate Website</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#374151]">Package Description</label>
                <textarea rows={2} value={packageForm.description}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  placeholder="Brief description of this package..."
                  className="w-full p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0D9488] resize-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#374151]">Regular Price (PKR)</label>
                  <input type="number" value={packageForm.regular_price_pkr}
                    onChange={(e) => setPackageForm({ ...packageForm, regular_price_pkr: Number(e.target.value) })}
                    className="w-full p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0D9488] line-through text-[#64748B] text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#374151]">Azadi Deal Price (PKR)</label>
                  <input type="number" value={packageForm.deal_price_pkr}
                    onChange={(e) => setPackageForm({ ...packageForm, deal_price_pkr: Number(e.target.value) })}
                    className="w-full p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0D9488] font-bold text-emerald-600 text-sm"
                  />
                </div>
              </div>

              {/* Live Savings Preview */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2">
                <Sparkles size={14} className="text-emerald-500" />
                <span className="text-[11px] text-emerald-700 font-bold">
                  Savings: PKR {(packageForm.regular_price_pkr - packageForm.deal_price_pkr).toLocaleString()}
                  {" "}({Math.round(((packageForm.regular_price_pkr - packageForm.deal_price_pkr) / packageForm.regular_price_pkr) * 100)}% OFF)
                </span>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#374151]">Features (one per line)</label>
                <textarea rows={5} value={packageForm.features}
                  onChange={(e) => setPackageForm({ ...packageForm, features: e.target.value })}
                  placeholder={"Mobile Responsive\nWhatsApp Integration\nGoogle Maps\nSEO Friendly\nFast Loading"}
                  className="w-full p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0D9488] leading-relaxed font-mono text-sm"
                />
                <p className="text-[10px] text-[#94A3B8] mt-1">Enter each feature on a new line</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#374151]">Delivery Estimate</label>
                  <select value={packageForm.delivery_estimate}
                    onChange={(e) => setPackageForm({ ...packageForm, delivery_estimate: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0D9488] text-sm"
                  >
                    <option>3 to 5 Days</option>
                    <option>4 to 6 Days</option>
                    <option>5 to 7 Days</option>
                    <option>7 to 10 Days</option>
                    <option>10 to 14 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#374151]">Badge Tag</label>
                  <input type="text" value={packageForm.badge_text}
                    onChange={(e) => setPackageForm({ ...packageForm, badge_text: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0D9488] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#374151]">Display Order</label>
                  <input type="number" value={packageForm.display_order}
                    onChange={(e) => setPackageForm({ ...packageForm, display_order: Number(e.target.value) })}
                    className="w-full p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0D9488] text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input type="checkbox" checked={packageForm.is_popular}
                      onChange={(e) => setPackageForm({ ...packageForm, is_popular: e.target.checked })}
                      className="w-4 h-4 accent-[#0D9488]"
                    />
                    <span className="text-sm font-semibold text-[#374151]">Mark as Popular</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={packageForm.is_active}
                      onChange={(e) => setPackageForm({ ...packageForm, is_active: e.target.checked })}
                      className="w-4 h-4 accent-[#0D9488]"
                    />
                    <span className="text-sm font-semibold text-[#374151]">Active (visible)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2 border-t border-[#E2E8F0]">
              <button onClick={() => setShowPackageModal(false)}
                className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-[#64748B] font-semibold text-sm"
              >
                Cancel
              </button>
              <button onClick={handleSavePackage} disabled={saving}
                className="flex-1 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                Save Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
