"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Award, PlusCircle, Edit, Trash2, Search, RefreshCw, CheckCircle2,
  Clock, XCircle, ExternalLink, Copy, Check, X, Save, Eye,
  FileDown, Share2, Ban, ChevronDown, CheckSquare, Square, Download
} from "lucide-react";
import {
  getAllCertificates, createCertificate, updateCertificate, deleteCertificate,
  getAllProfiles, getCertificateStats, revokeCertificate, bulkRevokeCertificates, bulkDeleteCertificates
} from "@/app/certificate-actions";
import { formatCertDate, getCertStatus, CERTIFICATE_CONFIGS, CertificateType } from "@/lib/certificates";
import { generateCertificatePDF } from "@/lib/certificate-generator";
import { saveAs } from "file-saver";

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
  certificate_type: string;
  internship_field?: string;
  qr_code_url?: string;
  revoked_at?: string;
  revoked_reason?: string;
  profiles?: { full_name: string; email: string; role: string } | null;
};

type Profile = { id: string; full_name: string; email: string; role: string; };

const statusIcons: Record<string, React.ReactNode> = {
  active: <CheckCircle2 size={13} className="text-emerald-500" />,
  inactive: <XCircle size={13} className="text-gray-400" />,
  expired: <Clock size={13} className="text-orange-400" />,
  revoked: <Ban size={13} className="text-rose-500" />,
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  expired: "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
  revoked: "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
};

const FORM_DEFAULTS = {
  user_ids: [] as string[], // Supports bulk allocation
  certificate_type: "internship" as CertificateType,
  internship_field: "",
  issue_date: new Date().toISOString().split("T")[0],
};

export default function CertificateManagerPanel() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    internships: 0,
    awards: 0,
    excellence: 0,
    active: 0,
    revoked: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [form, setForm] = useState(FORM_DEFAULTS);
  const [saving, setSaving] = useState(false);
  
  // Search & Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Selection/Bulk state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Preview PDF Modal
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewingName, setPreviewingName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [certsRes, profsRes, statsRes] = await Promise.all([
      getAllCertificates(),
      getAllProfiles(),
      getCertificateStats()
    ]);
    setCerts((certsRes.data as Certificate[]) || []);
    setProfiles((profsRes.data as Profile[]) || []);
    setStats(statsRes);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePreviewPDF = async (cert: Certificate) => {
    try {
      const type = (cert.certificate_type as CertificateType) || "internship";
      const blob = await generateCertificatePDF({
        type,
        recipientName: cert.recipient_name,
        certId: cert.id,
        issueDate: cert.issue_date,
        internshipField: cert.internship_field,
        verificationUrl: cert.qr_code_url || `${window.location.origin}/certificates/${cert.id}`,
      });
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
      setPreviewingName(cert.recipient_name);
    } catch (err) {
      alert("Error generating certificate preview: " + (err as Error).message);
    }
  };

  const handleDownloadPDF = async (cert: Certificate) => {
    try {
      const type = (cert.certificate_type as CertificateType) || "internship";
      const blob = await generateCertificatePDF({
        type,
        recipientName: cert.recipient_name,
        certId: cert.id,
        issueDate: cert.issue_date,
        internshipField: cert.internship_field,
        verificationUrl: cert.qr_code_url || `${window.location.origin}/certificates/${cert.id}`,
      });
      saveAs(blob, `PROLX-CERT-${cert.recipient_name.replace(/\s+/g, "_")}-${cert.id}.pdf`);
    } catch (err) {
      alert("Error downloading PDF: " + (err as Error).message);
    }
  };

  const handleCopyLink = (certId: string) => {
    const url = `${window.location.origin}/certificates/${certId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(certId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = async (certId: string) => {
    const reason = prompt("Enter reason for revoking this certificate:", "Violated internship agreement or left early");
    if (reason === null) return; // cancelled
    await revokeCertificate(certId, reason);
    await load();
  };

  const handleDelete = async (certId: string) => {
    if (!confirm(`Are you sure you want to delete certificate ${certId}? This action is irreversible.`)) return;
    await deleteCertificate(certId);
    await load();
  };

  // Form Submissions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.user_ids.length === 0) {
      alert("Please select at least one staff member.");
      return;
    }

    setSaving(true);
    try {
      const config = CERTIFICATE_CONFIGS[form.certificate_type];
      
      // Determine the category
      let category = "Internship";
      if (form.certificate_type === "excellence") category = "Excellence";
      else if (form.certificate_type === "opa") category = "Award";

      // Build field name representation
      const internshipField = form.internship_field || config.displayName;

      // Issue all certificates sequentially (handles bulk creation)
      for (const userId of form.user_ids) {
        const profile = profiles.find(p => p.id === userId);
        if (!profile) continue;

        await createCertificate({
          user_id: userId,
          certificate_type: form.certificate_type,
          internship_field: internshipField,
          issue_date: form.issue_date,
          recipient_name: profile.full_name,
          recipient_email: profile.email,
          title: config.displayName,
          category,
        });
      }

      setShowForm(false);
      setForm(FORM_DEFAULTS);
      await load();
    } catch (err) {
      alert("Error generating certificates: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Bulk Actions
  const handleBulkRevoke = async () => {
    if (selectedIds.length === 0) return;
    const reason = prompt(`Enter reason to revoke ${selectedIds.length} certificates:`, "Revoked by bulk action");
    if (reason === null) return;
    setLoading(true);
    await bulkRevokeCertificates(selectedIds, reason);
    setSelectedIds([]);
    await load();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} certificates?`)) return;
    setLoading(true);
    await bulkDeleteCertificates(selectedIds);
    setSelectedIds([]);
    await load();
  };

  const handleBulkDownload = async () => {
    if (selectedIds.length === 0) return;
    alert("Starting sequential downloads. Please allow multiple file downloads in your browser.");
    for (const id of selectedIds) {
      const cert = certs.find(c => c.id === id);
      if (cert) {
        await handleDownloadPDF(cert);
      }
    }
  };

  // Filtering
  const filtered = certs.filter(c => {
    const matchSearch = !search ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.recipient_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.internship_field?.toLowerCase().includes(search.toLowerCase());
      
    const computed = getCertStatus(c.status, c.expiry_date);
    const matchStatus = statusFilter === "all" || computed === statusFilter;
    const matchType = typeFilter === "all" || c.certificate_type === typeFilter;
    
    return matchSearch && matchStatus && matchType;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 text-[#0F172A]">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Issued", value: stats.total, color: "text-[#0F172A] border-l-4 border-slate-400" },
          { label: "Internships", value: stats.internships, color: "text-blue-600 border-l-4 border-blue-500" },
          { label: "Perf. Awards", value: stats.awards, color: "text-amber-600 border-l-4 border-amber-500" },
          { label: "Excellence", value: stats.excellence, color: "text-indigo-600 border-l-4 border-indigo-500" },
          { label: "Active", value: stats.active, color: "text-emerald-600 border-l-4 border-emerald-500" },
          { label: "Revoked", value: stats.revoked, color: "text-rose-600 border-l-4 border-rose-500" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{card.label}</div>
            <div className={`text-2xl font-bold mt-1 ${card.color.split(" ")[0]}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Main Header / Actions Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Certificates Management Module
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate and verify professional credentials for team members with dynamic custom templates.
          </p>
        </div>
        <button
          onClick={() => { setEditingCert(null); setForm(FORM_DEFAULTS); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
        >
          <PlusCircle size={15} /> Issue New Certificate(s)
        </button>
      </div>

      {/* Bulk Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-[#F0FDFA] dark:bg-slate-950 border border-teal-200 dark:border-teal-900 p-3 rounded-lg flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-medium text-teal-800 dark:text-teal-300">
            Selected <strong>{selectedIds.length}</strong> certificates
          </span>
          <div className="flex gap-2">
            <button onClick={handleBulkDownload} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 text-slate-700 dark:text-slate-300 rounded text-xs font-medium hover:bg-slate-50">
              <Download size={13} /> Download PDF ZIP/Sequential
            </button>
            <button onClick={handleBulkRevoke} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-xs font-medium">
              <Ban size={13} /> Revoke Selected
            </button>
            <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium">
              <Trash2 size={13} /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Filters Area */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#0D9488] bg-transparent"
          />
        </div>
        <div>
          <select
            value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#0D9488] bg-transparent"
          >
            <option value="all">All Certificate Types</option>
            {Object.entries(CERTIFICATE_CONFIGS).map(([val, conf]) => (
              <option key={val} value={val}>{conf.displayName}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#0D9488] bg-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button onClick={load} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded border border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Reload
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading certificate data...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Award size={32} className="text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No certificates found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600">
                      {selectedIds.length === filtered.length ? <CheckSquare size={15} /> : <Square size={15} />}
                    </button>
                  </th>
                  <th className="py-3 px-4">Certificate ID</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Specialization / Type</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(cert => {
                  const computed = getCertStatus(cert.status, cert.expiry_date);
                  const isSelected = selectedIds.includes(cert.id);
                  const config = CERTIFICATE_CONFIGS[cert.certificate_type as CertificateType] || CERTIFICATE_CONFIGS.internship;
                  
                  return (
                    <tr key={cert.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${isSelected ? "bg-teal-50/20" : ""}`}>
                      <td className="py-3 px-4">
                        <button onClick={() => toggleSelect(cert.id)} className="text-slate-400 hover:text-slate-600">
                          {isSelected ? <CheckSquare size={15} className="text-[#0D9488]" /> : <Square size={15} />}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-[#0D9488]">{cert.id}</td>
                      <td className="py-3 px-4 font-medium">{cert.recipient_name}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-700 dark:text-slate-300">{config.displayName}</div>
                        {cert.internship_field && <div className="text-[10px] text-slate-400">{cert.internship_field}</div>}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{formatCertDate(cert.issue_date)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusColors[computed]}`}>
                          {statusIcons[computed]} {computed}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => handlePreviewPDF(cert)} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Preview PDF">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => handleDownloadPDF(cert)} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Download PDF">
                            <FileDown size={14} />
                          </button>
                          <button onClick={() => handleCopyLink(cert.id)} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Copy Verification URL">
                            {copiedId === cert.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                          {computed === "active" && (
                            <button onClick={() => handleRevoke(cert.id)} className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded text-slate-600" title="Revoke Certificate">
                              <Ban size={14} />
                            </button>
                          )}
                          <button onClick={() => handleDelete(cert.id)} className="p-1 hover:bg-slate-100 rounded text-rose-500 hover:bg-rose-50" title="Delete">
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

      {/* Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Issue Certificate(s)
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Select Staff (Support Multi-select for bulk allocation) */}
              <div>
                <label className="block text-xs font-semibold mb-1">Select Employee(s) *</label>
                <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded p-2 space-y-1 bg-slate-50/50">
                  {profiles
                    .filter(p => p.role === 'staff' || p.role === 'admin')
                    .map(p => {
                      const isChecked = form.user_ids.includes(p.id);
                      return (
                        <label key={p.id} className="flex items-center gap-2 py-1 px-1.5 hover:bg-slate-100/50 rounded cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setForm(f => ({
                                ...f,
                                user_ids: isChecked ? f.user_ids.filter(x => x !== p.id) : [...f.user_ids, p.id]
                              }));
                            }}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span>{p.full_name} ({p.email})</span>
                        </label>
                      );
                    })}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Select one or more employees to batch generate credentials.</p>
              </div>

              {/* Template selector */}
              <div>
                <label className="block text-xs font-semibold mb-1">Template / Certificate Type *</label>
                <select
                  value={form.certificate_type}
                  onChange={e => setForm(f => ({ ...f, certificate_type: e.target.value as CertificateType }))}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#0D9488] bg-transparent"
                >
                  {Object.entries(CERTIFICATE_CONFIGS).map(([val, conf]) => (
                    <option key={val} value={val}>{conf.displayName}</option>
                  ))}
                </select>
              </div>

              {/* Specialization / Notes — shown for all certificate types */}
              <div>
                <label className="block text-xs font-semibold mb-1">Specialization / Notes <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={form.internship_field}
                  onChange={e => setForm(f => ({ ...f, internship_field: e.target.value }))}
                  placeholder={form.certificate_type.startsWith('internship') ? 'e.g. Full Stack Web Development' : 'e.g. Q2 2026 — Best Project Lead'}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#0D9488] bg-transparent"
                />
                <p className="text-[10px] text-slate-400 mt-1">Additional context shown in the certificate record (not printed on the PDF).</p>
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-xs font-semibold mb-1">Issue Date</label>
                <input
                  type="date"
                  value={form.issue_date}
                  onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#0D9488] bg-transparent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded text-xs">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded text-xs font-semibold hover:bg-[#0F766E] disabled:opacity-50"
                >
                  {saving ? "Generating..." : "Generate Credentials"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewBlobUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm">
                Document Preview: {previewingName}
              </h3>
              <button
                onClick={() => {
                  URL.revokeObjectURL(previewBlobUrl);
                  setPreviewBlobUrl(null);
                }}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 bg-slate-100">
              <iframe
                src={previewBlobUrl}
                className="w-full h-full border-none"
                title="Certificate PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
