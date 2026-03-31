"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText, Plus, Search, Eye, Trash2, Download, RefreshCw,
  Mail, Archive, Filter, X, BookOpen, ChevronRight, FileCheck,
  FileSignature, Briefcase, Award, GraduationCap, Banknote,
  UserX, TrendingUp, AlertTriangle, ShieldCheck, LogOut
} from "lucide-react";
import {
  getLetters, createLetter, deleteLetter
} from "@/app/letter-actions";
import { getAllProfiles } from "@/app/certificate-actions";
import type { CompanyLetterWithProfiles } from "@/types/erp";
import { getLetterTypeLabel, getLetterTemplateFields, type LetterType } from "@/types/erp";

// ─── Letter Type Config ─────────────────────────────────────────
const LETTER_TYPES: { type: LetterType; label: string; icon: React.ElementType; color: string }[] = [
  { type: "offer_letter", label: "Offer Letter", icon: Briefcase, color: "bg-blue-100 text-blue-700" },
  { type: "internship_letter", label: "Internship Letter", icon: GraduationCap, color: "bg-cyan-100 text-cyan-700" },
  { type: "paid_internship_letter", label: "Paid Internship", icon: Banknote, color: "bg-teal-100 text-teal-700" },
  { type: "appointment_letter", label: "Appointment Letter", icon: FileCheck, color: "bg-emerald-100 text-emerald-700" },
  { type: "experience_letter", label: "Experience Letter", icon: Award, color: "bg-purple-100 text-purple-700" },
  { type: "promotion_letter", label: "Promotion Letter", icon: TrendingUp, color: "bg-indigo-100 text-indigo-700" },
  { type: "warning_letter", label: "Warning Letter", icon: AlertTriangle, color: "bg-amber-100 text-amber-700" },
  { type: "termination_letter", label: "Termination Letter", icon: UserX, color: "bg-red-100 text-red-700" },
  { type: "nda_agreement", label: "NDA Agreement", icon: ShieldCheck, color: "bg-slate-100 text-slate-700" },
  { type: "relieving_letter", label: "Relieving Letter", icon: LogOut, color: "bg-rose-100 text-rose-700" },
  { type: "salary_certificate", label: "Salary Certificate", icon: FileSignature, color: "bg-orange-100 text-orange-700" },
  { type: "custom", label: "Custom Letter", icon: BookOpen, color: "bg-gray-100 text-gray-600" },
];

// ─── Generate Letter Modal ──────────────────────────────────────
function GenerateLetterModal({ profiles, onClose, onCreated }: {
  profiles: { id: string; full_name: string; email: string; role: string }[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<LetterType | null>(null);
  const [recipientId, setRecipientId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [content, setContent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fields = selectedType ? getLetterTemplateFields(selectedType) : [];
  const subject = selectedType ? getLetterTypeLabel(selectedType) : "";

  const handleRecipientChange = (id: string) => {
    setRecipientId(id);
    const profile = profiles.find(p => p.id === id);
    if (profile) setRecipientName(profile.full_name);
  };

  const handleSubmit = async () => {
    if (!selectedType) return setError("Please select a letter type");
    if (!recipientName) return setError("Recipient name is required");
    setSaving(true);
    try {
      const { data, error: err } = await createLetter({
        letter_type: selectedType,
        recipient_id: recipientId || undefined,
        recipient_name: recipientName,
        subject,
        content,
        status: "draft",
      });
      if (err) { setError(err.message); return; }

      // Auto-download PDF after creation
      if (data) {
        const { generateLetterPDF } = await import("@/lib/pdf-utils");
        const blob = await generateLetterPDF({
          letterId: data.id,
          letterType: selectedType,
          recipientName,
          subject,
          content,
          date: content.date || new Date().toLocaleDateString("en-GB"),
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${data.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
      onCreated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center py-8 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">Generate Company Letter</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "bg-[#0D9488] text-white" : "bg-[#E2E8F0] text-[#94A3B8]"}`}>1</div>
              <div className={`h-0.5 w-8 ${step >= 2 ? "bg-[#0D9488]" : "bg-[#E2E8F0]"}`} />
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? "bg-[#0D9488] text-white" : "bg-[#E2E8F0] text-[#94A3B8]"}`}>2</div>
              <span className="text-xs text-[#94A3B8]">{step === 1 ? "Choose Template" : "Fill Details"}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl"><X size={18} /></button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Choose type */}
          {step === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {LETTER_TYPES.map(({ type, label, icon: Icon, color }) => (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setStep(2); }}
                  className="group flex flex-col items-center gap-1.5 p-4 border-2 border-[#E2E8F0] rounded-xl hover:border-[#0D9488] hover:shadow-sm transition-all text-center"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-medium text-[#0F172A] leading-tight">{label}</span>
                  <ChevronRight size={14} className="text-[#CBD5E1] group-hover:text-[#0D9488]" />
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Fill form */}
          {step === 2 && selectedType && (
            <div className="space-y-4">
              <button onClick={() => setStep(1)} className="text-xs text-[#0D9488] hover:underline flex items-center gap-1">
                ← Back to template selection
              </button>

              <div className="flex items-center gap-2 p-3 bg-[#F0FDFA] rounded-xl">
                {(() => { const cfg = LETTER_TYPES.find(t => t.type === selectedType)!; const Icon = cfg.icon; return <><div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.color}`}><Icon size={16} /></div><span className="text-sm font-medium text-[#0D9488]">{cfg.label}</span></>; })()}
              </div>

              {/* Recipient */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Recipient (from profiles)</label>
                  <select
                    className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 bg-white"
                    value={recipientId}
                    onChange={e => handleRecipientChange(e.target.value)}
                  >
                    <option value="">Select user…</option>
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Or enter name manually</label>
                  <input
                    className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                    placeholder="Full name…"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                  />
                </div>
              </div>

              {/* Dynamic fields */}
              <div className="grid grid-cols-2 gap-3">
                {fields.map(field => {
                  if (field.key === "recipient_name") return null;
                  return (
                    <div key={field.key} className={field.type === "textarea" ? "col-span-2" : ""}>
                      <label className="block text-xs font-medium text-[#64748B] mb-1.5">
                        {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          rows={4}
                          className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 resize-none"
                          value={content[field.key] || ""}
                          onChange={e => setContent(prev => ({ ...prev, [field.key]: e.target.value }))}
                        />
                      ) : field.type === "select" ? (
                        <select
                          className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 bg-white"
                          value={content[field.key] || ""}
                          onChange={e => setContent(prev => ({ ...prev, [field.key]: e.target.value }))}
                        >
                          <option value="">Select…</option>
                          {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type={field.type || "text"}
                          className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                          value={content[field.key] || ""}
                          onChange={e => setContent(prev => ({ ...prev, [field.key]: e.target.value }))}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC]">Cancel</button>
          {step === 2 && (
            <button
              onClick={handleSubmit} disabled={saving}
              className="px-5 py-2 text-sm bg-[#0D9488] text-white rounded-xl hover:bg-[#0f766e] disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
              {saving ? "Generating…" : "Generate & Download PDF"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── View Letter Modal ──────────────────────────────────────────
function ViewLetterModal({ letter, onClose }: {
  letter: CompanyLetterWithProfiles;
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  const handlePDF = async () => {
    setDownloading(true);
    try {
      const { generateLetterPDF } = await import("@/lib/pdf-utils");
      const blob = await generateLetterPDF({
        letterId: letter.id,
        letterType: letter.letter_type,
        recipientName: letter.recipient_name,
        subject: letter.subject,
        content: letter.content,
        date: letter.content.date || new Date(letter.created_at).toLocaleDateString("en-GB"),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${letter.id}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } finally { setDownloading(false); }
  };

  const handleDOCX = async () => {
    setDownloadingDocx(true);
    try {
      const { generateLetterDOCX } = await import("@/lib/docx-utils");
      const blob = await generateLetterDOCX({
        letterId: letter.id,
        letterType: letter.letter_type,
        recipientName: letter.recipient_name,
        subject: letter.subject,
        content: letter.content,
        date: letter.content.date || new Date(letter.created_at).toLocaleDateString("en-GB"),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${letter.id}.docx`; a.click();
      URL.revokeObjectURL(url);
    } finally { setDownloadingDocx(false); }
  };

  const typeCfg = LETTER_TYPES.find(t => t.type === letter.letter_type) || LETTER_TYPES[LETTER_TYPES.length - 1];
  const Icon = typeCfg.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-[#E2E8F0] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeCfg.color}`}>
              <Icon size={18} />
            </div>
            <div>
              <h2 className="font-bold text-[#0F172A]">{letter.id}</h2>
              <p className="text-xs text-[#64748B]">{typeCfg.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F8FAFC] rounded-xl p-3">
              <p className="text-xs text-[#94A3B8] mb-1">RECIPIENT</p>
              <p className="font-semibold text-[#0F172A]">{letter.recipient_name}</p>
              <p className="text-xs text-[#64748B]">{letter.recipient?.email || "—"}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-3">
              <p className="text-xs text-[#94A3B8] mb-1">CREATED BY</p>
              <p className="font-semibold text-[#0F172A]">{letter.creator?.full_name || "—"}</p>
              <p className="text-xs text-[#64748B]">{new Date(letter.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="bg-[#F0FDFA] rounded-xl p-4">
            <p className="text-xs text-[#64748B] mb-2 font-medium">SUBJECT: {letter.subject}</p>
            <div className="space-y-1">
              {Object.entries(letter.content).filter(([k]) => k !== "body").map(([key, value]) => (
                <div key={key} className="flex gap-2 text-sm">
                  <span className="text-[#94A3B8] capitalize min-w-[120px]">{key.replace(/_/g, " ")}:</span>
                  <span className="text-[#0F172A] font-medium">{value}</span>
                </div>
              ))}
              {letter.content.body && (
                <div className="mt-2 pt-2 border-t border-[#CCFBF1]">
                  <p className="text-sm text-[#0F172A] whitespace-pre-line">{letter.content.body}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-6 pt-0 flex gap-3">
          <button onClick={handlePDF} disabled={downloading} className="flex-1 px-4 py-2 text-sm bg-[#0F172A] text-white rounded-xl hover:bg-[#1E293B] flex items-center justify-center gap-2 disabled:opacity-50">
            {downloading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
            {downloading ? "…" : "PDF"}
          </button>
          <button onClick={handleDOCX} disabled={downloadingDocx} className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50">
            {downloadingDocx ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
            {downloadingDocx ? "…" : "DOCX"}
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC]">Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────
export default function LetterGeneratorPanel() {
  const [letters, setLetters] = useState<CompanyLetterWithProfiles[]>([]);
  const [profiles, setProfiles] = useState<{ id: string; full_name: string; email: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showGenerate, setShowGenerate] = useState(false);
  const [viewLetter, setViewLetter] = useState<CompanyLetterWithProfiles | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [lettersRes, profilesRes] = await Promise.all([
      getLetters({ type: typeFilter !== "all" ? typeFilter : undefined }),
      getAllProfiles(),
    ]);
    setLetters((lettersRes.data as CompanyLetterWithProfiles[]) || []);
    setProfiles((profilesRes.data as { id: string; full_name: string; email: string; role: string }[]) || []);
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = letters.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return l.id.toLowerCase().includes(q) || l.recipient_name.toLowerCase().includes(q);
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this letter?")) return;
    setDeleting(id);
    await deleteLetter(id);
    setDeleting(null);
    load();
  };

  const stats = {
    total: letters.length,
    offers: letters.filter(l => ["offer_letter", "internship_letter", "paid_internship_letter"].includes(l.letter_type)).length,
    appointment: letters.filter(l => l.letter_type === "appointment_letter").length,
    experience: letters.filter(l => ["experience_letter", "relieving_letter"].includes(l.letter_type)).length,
    compliance: letters.filter(l => ["warning_letter", "termination_letter", "nda_agreement"].includes(l.letter_type)).length,
    others: letters.filter(l => ["salary_certificate", "promotion_letter", "custom"].includes(l.letter_type)).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Letters", value: stats.total, color: "bg-[#0F172A]", icon: FileText },
          { label: "Offers & Internships", value: stats.offers, color: "bg-blue-500", icon: Briefcase },
          { label: "Appointments", value: stats.appointment, color: "bg-emerald-500", icon: FileCheck },
          { label: "Experience & Relieving", value: stats.experience, color: "bg-purple-500", icon: Award },
          { label: "NDA / Warning / Term.", value: stats.compliance, color: "bg-red-500", icon: ShieldCheck },
          { label: "Salary / Promo / Other", value: stats.others, color: "bg-orange-500", icon: FileSignature },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#0F172A] font-mono">{value}</div>
              <div className="text-xs text-[#64748B]">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar + Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
              placeholder="Search by letter ID or recipient…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 bg-white"
            value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {LETTER_TYPES.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
          </select>
          <button onClick={() => load()} className="p-2.5 border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] text-[#64748B]">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowGenerate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0D9488] text-white text-sm rounded-xl hover:bg-[#0f766e]"
          >
            <Plus size={16} /> Generate Letter
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={32} className="text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[#64748B] text-sm">No letters found. Generate your first letter!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {["Letter ID", "Type", "Recipient", "Created By", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(letter => {
                  const typeCfg = LETTER_TYPES.find(t => t.type === letter.letter_type) || LETTER_TYPES[LETTER_TYPES.length - 1];
                  const Icon = typeCfg.icon;
                  return (
                    <tr key={letter.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-[#0D9488]">{letter.id}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${typeCfg.color}`}>
                          <Icon size={11} /> {typeCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#0F172A]">{letter.recipient_name}</div>
                        <div className="text-xs text-[#94A3B8]">{letter.recipient?.email || "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">{letter.creator?.full_name || "—"}</td>
                      <td className="px-4 py-3 text-[#64748B]">{new Date(letter.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setViewLetter(letter)} className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0D9488] hover:bg-[#F0FDFA]" title="View"><Eye size={15} /></button>
                          <button onClick={() => handleDelete(letter.id)} disabled={deleting === letter.id} className="p-1.5 rounded-lg text-[#64748B] hover:text-red-500 hover:bg-red-50" title="Delete">
                            {deleting === letter.id ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}
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

      {showGenerate && <GenerateLetterModal profiles={profiles} onClose={() => setShowGenerate(false)} onCreated={load} />}
      {viewLetter && <ViewLetterModal letter={viewLetter} onClose={() => setViewLetter(null)} />}
    </div>
  );
}
