"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Award, PlusCircle, Edit, Trash2, Search, RefreshCw, CheckCircle2,
  Clock, XCircle, ExternalLink, Copy, Check, X, Save
} from "lucide-react";
import {
  getAllCertificates, createCertificate, updateCertificate, deleteCertificate, getAllProfiles
} from "@/app/certificate-actions";
import { formatCertDate, getCertStatus } from "@/lib/certificates";

type Certificate = {
  id: string;
  title: string;
  recipient_name: string;
  recipient_email?: string;
  issue_date: string;
  expiry_date?: string;
  status: string;
  category: string;
  issued_by: string;
  user_id: string;
  profiles?: { full_name: string; email: string; role: string } | null;
};

type Profile = { id: string; full_name: string; email: string; };

const statusIcons: Record<string, React.ReactNode> = {
  active: <CheckCircle2 size={13} className="text-emerald-500" />,
  inactive: <XCircle size={13} className="text-gray-400" />,
  expired: <Clock size={13} className="text-orange-400" />,
};
const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-gray-100 text-gray-600",
  expired: "bg-orange-100 text-orange-700",
};

const FORM_DEFAULTS = {
  user_id: "",
  title: "",
  description: "",
  recipient_name: "",
  recipient_email: "",
  issue_date: new Date().toISOString().split("T")[0],
  expiry_date: "",
  category: "General",
  issued_by: "Prolx Digital Agency",
  status: "active" as const,
};

export default function CertificateManagerPanel() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [form, setForm] = useState(FORM_DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [certsRes, profsRes] = await Promise.all([getAllCertificates(), getAllProfiles()]);
    setCerts((certsRes.data as Certificate[]) || []);
    setProfiles((profsRes.data as Profile[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCert) {
        await updateCertificate(editingCert.id, {
          title: form.title,
          description: form.description,
          recipient_name: form.recipient_name,
          recipient_email: form.recipient_email,
          issue_date: form.issue_date,
          expiry_date: form.expiry_date || undefined,
          status: form.status,
          category: form.category,
        });
      } else {
        await createCertificate({
          user_id: form.user_id,
          title: form.title,
          description: form.description,
          recipient_name: form.recipient_name,
          recipient_email: form.recipient_email,
          issue_date: form.issue_date,
          expiry_date: form.expiry_date || undefined,
          category: form.category,
          issued_by: form.issued_by,
        });
      }
      setShowForm(false);
      setEditingCert(null);
      setForm(FORM_DEFAULTS);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cert: Certificate) => {
    setEditingCert(cert);
    setForm({
      user_id: cert.user_id,
      title: cert.title,
      description: cert.profiles?.full_name || "",
      recipient_name: cert.recipient_name,
      recipient_email: cert.recipient_email || "",
      issue_date: cert.issue_date,
      expiry_date: cert.expiry_date || "",
      category: cert.category || "General",
      issued_by: cert.issued_by || "Prolx Digital Agency",
      status: cert.status as "active",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete certificate ${id}? This cannot be undone.`)) return;
    setActionLoading(id);
    await deleteCertificate(id);
    await load();
    setActionLoading(null);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = certs.filter(c => {
    const matchSearch = !search ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.recipient_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.title?.toLowerCase().includes(search.toLowerCase());
    const computed = getCertStatus(c.status, c.expiry_date);
    const matchStatus = statusFilter === "all" || computed === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-[#0F172A] text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Certificate Manager
          </h2>
          <p className="text-sm text-[#64748B] mt-1">
            Create, manage and track all Prolx-issued certificates. Each gets a unique verifiable ID.
          </p>
        </div>
        <button
          onClick={() => { setEditingCert(null); setForm(FORM_DEFAULTS); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl transition-all"
        >
          <PlusCircle size={16} /> Issue Certificate
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-[#0D9488]/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[#0F172A] text-lg" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              {editingCert ? `Edit: ${editingCert.id}` : "Issue New Certificate"}
            </h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#64748B]">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            {/* Assign to User */}
            {!editingCert && (
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Assign to User (optional)</label>
                <select
                  value={form.user_id}
                  onChange={e => {
                    const profile = profiles.find(p => p.id === e.target.value);
                    setForm(f => ({
                      ...f,
                      user_id: e.target.value,
                      recipient_name: profile?.full_name || f.recipient_name,
                      recipient_email: profile?.email || f.recipient_email,
                    }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
                >
                  <option value="">— No linked user —</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Recipient Name *</label>
              <input
                type="text" required value={form.recipient_name}
                onChange={e => setForm(f => ({ ...f, recipient_name: e.target.value }))}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Recipient Email</label>
              <input
                type="email" value={form.recipient_email}
                onChange={e => setForm(f => ({ ...f, recipient_email: e.target.value }))}
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Certificate Title *</label>
              <input
                type="text" required value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Web Development Excellence Award"
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Description</label>
              <textarea
                rows={2} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this certificate..."
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
              >
                {["General", "Web Development", "Design", "Marketing", "Project Completion", "Training", "Partnership", "Award"].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Issued By</label>
              <input
                type="text" value={form.issued_by}
                onChange={e => setForm(f => ({ ...f, issued_by: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Issue Date *</label>
              <input
                type="date" required value={form.issue_date}
                onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Expiry Date (optional)</label>
              <input
                type="date" value={form.expiry_date}
                onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
              />
            </div>

            {editingCert && (
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as "active" }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            )}

            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <button
                type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50"
              >
                <Save size={14} /> {saving ? "Saving..." : editingCert ? "Update Certificate" : "Issue Certificate"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-[#64748B] hover:text-[#0F172A] text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search certificates..."
              className="pl-9 pr-4 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] w-52"
            />
          </div>
          <div className="flex gap-1">
            {(["all", "active", "inactive", "expired"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === s ? "bg-[#0D9488] text-white" : "bg-[#F0FDFA] text-[#64748B] hover:bg-[#CCFBF1]"
                }`}
              >{s}</button>
            ))}
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0]">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#64748B] text-sm">Loading certificates...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Award size={32} className="text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[#64748B] text-sm">No certificates found. Issue your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["Certificate ID", "Recipient", "Title", "Issue Date", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(cert => {
                  const computed = getCertStatus(cert.status, cert.expiry_date);
                  return (
                    <tr key={cert.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[#0D9488] font-semibold">{cert.id}</span>
                          <button onClick={() => handleCopyId(cert.id)} className="text-[#94A3B8] hover:text-[#0D9488] transition-colors" title="Copy ID">
                            {copiedId === cert.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                          <a href={`/certificates/${cert.id}`} target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-[#0D9488] transition-colors" title="View Public Page">
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#0F172A]">{cert.recipient_name}</div>
                        {cert.recipient_email && <div className="text-xs text-[#64748B]">{cert.recipient_email}</div>}
                      </td>
                      <td className="py-3 px-4 text-[#64748B] max-w-[180px] truncate">{cert.title}</td>
                      <td className="py-3 px-4 text-xs text-[#64748B]">{formatCertDate(cert.issue_date)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[computed]}`}>
                          {statusIcons[computed]} {computed}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleEdit(cert)}
                            className="p-1.5 rounded-lg hover:bg-[#F0FDFA] text-[#0D9488] transition-colors" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(cert.id)} disabled={actionLoading === cert.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50" title="Delete">
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
        )}
      </div>
    </div>
  );
}
