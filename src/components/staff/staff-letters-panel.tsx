"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText, Download, RefreshCw, Briefcase, GraduationCap,
  Award, FileCheck, AlertTriangle, ShieldCheck, LogOut,
  Banknote, TrendingUp, FileSignature, BookOpen, ChevronRight,
  Mail, X, Eye, FileDown, Clock
} from "lucide-react";
import { getLetters } from "@/app/letter-actions";
import type { CompanyLetterWithProfiles } from "@/types/erp";
import { getLetterTypeLabel, type LetterType } from "@/types/erp";

// ─── Letter Type Config ─────────────────────────────────────────────────────
const LETTER_TYPE_CONFIG: Record<LetterType, { icon: React.ElementType; color: string; bg: string; category: string }> = {
  offer_letter:             { icon: Briefcase,      color: "text-blue-700",   bg: "bg-blue-50",   category: "Offers & Hiring" },
  internship_letter:        { icon: GraduationCap,  color: "text-cyan-700",   bg: "bg-cyan-50",   category: "Internship" },
  paid_internship_letter:   { icon: Banknote,       color: "text-teal-700",   bg: "bg-teal-50",   category: "Internship" },
  completion_letter:        { icon: FileCheck,      color: "text-lime-700",   bg: "bg-lime-50",   category: "Completion" },
  appointment_letter:       { icon: FileCheck,      color: "text-emerald-700",bg: "bg-emerald-50",category: "Appointment" },
  job_confirmation_letter:  { icon: Award,          color: "text-green-700",  bg: "bg-green-50",  category: "Appointment" },
  experience_letter:        { icon: Award,          color: "text-purple-700", bg: "bg-purple-50", category: "Experience" },
  promotion_letter:         { icon: TrendingUp,     color: "text-indigo-700", bg: "bg-indigo-50", category: "Career" },
  transfer_letter:          { icon: ChevronRight,   color: "text-sky-700",    bg: "bg-sky-50",    category: "Career" },
  relieving_letter:         { icon: LogOut,         color: "text-rose-700",   bg: "bg-rose-50",   category: "Separation" },
  warning_letter:           { icon: AlertTriangle,  color: "text-amber-700",  bg: "bg-amber-50",  category: "HR Notice" },
  termination_letter:       { icon: X,              color: "text-red-700",    bg: "bg-red-50",    category: "Separation" },
  leave_approval_letter:    { icon: Mail,           color: "text-orange-700", bg: "bg-orange-50", category: "Leave" },
  no_objection_certificate: { icon: ShieldCheck,    color: "text-slate-700",  bg: "bg-slate-50",  category: "Certificates" },
  reference_letter:         { icon: BookOpen,       color: "text-violet-700", bg: "bg-violet-50", category: "Reference" },
  nda_agreement:            { icon: ShieldCheck,    color: "text-gray-700",   bg: "bg-gray-50",   category: "Agreements" },
  salary_certificate:       { icon: FileSignature,  color: "text-yellow-700", bg: "bg-yellow-50", category: "Certificates" },
  custom:                   { icon: FileText,       color: "text-gray-600",   bg: "bg-gray-50",   category: "Other" },
};

// ─── View Letter Modal ──────────────────────────────────────────────────────
function ViewLetterModal({ letter, onClose }: {
  letter: CompanyLetterWithProfiles;
  onClose: () => void;
}) {
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingDOCX, setDownloadingDOCX] = useState(false);

  const cfg = LETTER_TYPE_CONFIG[letter.letter_type] || LETTER_TYPE_CONFIG.custom;
  const Icon = cfg.icon;

  const handlePDF = async () => {
    setDownloadingPDF(true);
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
      const a = document.createElement("a");
      a.href = url;
      a.download = `${letter.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDOCX = async () => {
    setDownloadingDOCX(true);
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
      const a = document.createElement("a");
      a.href = url;
      a.download = `${letter.id}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingDOCX(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className={`p-5 ${cfg.bg} border-b border-black/5 flex items-start justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl bg-white/70 flex items-center justify-center shadow-sm`}>
              <Icon size={20} className={cfg.color} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{cfg.category}</p>
              <h2 className="font-bold text-slate-800 text-sm">{getLetterTypeLabel(letter.letter_type)}</h2>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{letter.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-black/10 rounded-lg transition-colors">
            <X size={17} className="text-slate-500" />
          </button>
        </div>

        {/* Details */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Issued To</p>
              <p className="font-semibold text-slate-800 text-sm">{letter.recipient_name}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Issue Date</p>
              <p className="font-semibold text-slate-800 text-sm">
                {letter.content.date || new Date(letter.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Content preview */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-40 overflow-y-auto">
            <p className="text-[10px] font-semibold text-slate-400 uppercase mb-2">Letter Details</p>
            <div className="space-y-1.5">
              {Object.entries(letter.content)
                .filter(([k]) => k !== "body" && k !== "date")
                .map(([key, value]) => (
                  <div key={key} className="flex gap-2 text-xs">
                    <span className="text-slate-400 capitalize min-w-[110px] shrink-0">
                      {key.replace(/_/g, " ")}:
                    </span>
                    <span className="text-slate-700 font-medium">{value}</span>
                  </div>
                ))}
              {letter.content.body && (
                <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-600 whitespace-pre-line">
                  {letter.content.body}
                </div>
              )}
            </div>
          </div>

          {letter.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs text-amber-700">{letter.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 pt-0 grid grid-cols-2 gap-3">
          <button
            onClick={handlePDF}
            disabled={downloadingPDF}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0F172A] text-white text-sm font-semibold rounded-xl hover:bg-[#1E293B] disabled:opacity-50 transition-colors"
          >
            {downloadingPDF ? <RefreshCw size={15} className="animate-spin" /> : <FileDown size={15} />}
            {downloadingPDF ? "Generating…" : "Download PDF"}
          </button>
          <button
            onClick={handleDOCX}
            disabled={downloadingDOCX}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {downloadingDOCX ? <RefreshCw size={15} className="animate-spin" /> : <FileText size={15} />}
            {downloadingDOCX ? "Generating…" : "Download DOCX"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Letter Card ────────────────────────────────────────────────────────────
function LetterCard({ letter, onView }: { letter: CompanyLetterWithProfiles; onView: () => void }) {
  const [downloading, setDownloading] = useState(false);
  const cfg = LETTER_TYPE_CONFIG[letter.letter_type] || LETTER_TYPE_CONFIG.custom;
  const Icon = cfg.icon;

  const handleQuickDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      const a = document.createElement("a");
      a.href = url;
      a.download = `${letter.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      onClick={onView}
      className="group bg-white border border-slate-100 rounded-2xl p-4 hover:border-[#0D9488]/40 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col gap-3"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
          <Icon size={18} className={cfg.color} />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
          {cfg.category}
        </span>
      </div>

      {/* Letter info */}
      <div className="flex-1">
        <h3 className="font-semibold text-slate-800 text-sm leading-tight mb-1">
          {getLetterTypeLabel(letter.letter_type)}
        </h3>
        <p className="text-xs font-mono text-[#0D9488]">{letter.id}</p>
        {letter.content.position && (
          <p className="text-xs text-slate-500 mt-1 truncate">{letter.content.position}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock size={11} />
          {new Date(letter.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onView(); }}
            title="View Details"
            className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-[#0D9488] transition-colors"
          >
            <Eye size={13} />
          </button>
          <button
            onClick={handleQuickDownload}
            disabled={downloading}
            title="Quick Download PDF"
            className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-[#0D9488] transition-colors disabled:opacity-50"
          >
            {downloading ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────────────────
export default function StaffLettersPanel({ userId }: { userId: string }) {
  const [letters, setLetters] = useState<CompanyLetterWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewLetter, setViewLetter] = useState<CompanyLetterWithProfiles | null>(null);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getLetters({ recipientId: userId });
    setLetters((data as CompanyLetterWithProfiles[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // Group categories
  const categories = [
    { id: "all", label: "All Letters" },
    { id: "Offers & Hiring", label: "Offers & Hiring" },
    { id: "Internship", label: "Internship" },
    { id: "Completion", label: "Completion" },
    { id: "Appointment", label: "Appointment" },
    { id: "Experience", label: "Experience" },
    { id: "Career", label: "Career" },
    { id: "Certificates", label: "Certificates" },
    { id: "HR Notice", label: "HR Notices" },
    { id: "Separation", label: "Separation" },
    { id: "Leave", label: "Leave" },
    { id: "Reference", label: "Reference" },
    { id: "Agreements", label: "Agreements" },
    { id: "Other", label: "Other" },
  ];

  const filtered = filter === "all"
    ? letters
    : letters.filter(l => (LETTER_TYPE_CONFIG[l.letter_type]?.category || "Other") === filter);

  // Stats
  const stats = {
    total: letters.length,
    offers: letters.filter(l => ["offer_letter", "internship_letter", "paid_internship_letter", "completion_letter"].includes(l.letter_type)).length,
    appointments: letters.filter(l => ["appointment_letter", "job_confirmation_letter"].includes(l.letter_type)).length,
    certificates: letters.filter(l => ["no_objection_certificate", "salary_certificate", "reference_letter"].includes(l.letter_type)).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-[#0F172A] text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            My Official Letters
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Letters issued to you by Prolx Digital Agency</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-[#0D9488] border border-slate-200 rounded-xl hover:bg-[#F0FDFA] transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Letters", value: stats.total, color: "bg-[#0F172A]", icon: FileText },
          { label: "Offers & Internships", value: stats.offers, color: "bg-blue-500", icon: Briefcase },
          { label: "Appointments", value: stats.appointments, color: "bg-emerald-500", icon: FileCheck },
          { label: "Certificates & NOCs", value: stats.certificates, color: "bg-violet-500", icon: Award },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} shrink-0`}>
              <Icon size={16} className="text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#0F172A] font-mono">{value}</div>
              <div className="text-[11px] text-slate-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      {letters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories
            .filter(c => c.id === "all" || letters.some(l => (LETTER_TYPE_CONFIG[l.letter_type]?.category || "Other") === c.id))
            .map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  filter === cat.id
                    ? "bg-[#0D9488] text-white border-[#0D9488]"
                    : "bg-white text-slate-500 border-slate-200 hover:border-[#0D9488]/50 hover:text-[#0D9488]"
                }`}
              >
                {cat.label}
                {cat.id !== "all" && (
                  <span className="ml-1 opacity-60">
                    ({letters.filter(l => (LETTER_TYPE_CONFIG[l.letter_type]?.category || "Other") === cat.id).length})
                  </span>
                )}
              </button>
            ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 h-40 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded w-full mb-2" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-slate-300" />
          </div>
          <h3 className="font-semibold text-slate-600 mb-1">
            {filter === "all" ? "No Letters Yet" : `No ${filter} letters`}
          </h3>
          <p className="text-sm text-slate-400">
            {filter === "all"
              ? "Letters issued to you by HR or Admin will appear here."
              : "No letters in this category have been issued to you."}
          </p>
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              className="mt-4 text-xs text-[#0D9488] hover:underline"
            >
              View all letters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(letter => (
            <LetterCard
              key={letter.id}
              letter={letter}
              onView={() => setViewLetter(letter)}
            />
          ))}
        </div>
      )}

      {/* Download Info Banner */}
      {letters.length > 0 && (
        <div className="bg-gradient-to-r from-[#F0FDFA] to-[#ECFDF5] border border-[#CCFBF1] rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-[#0D9488]/10 rounded-xl flex items-center justify-center shrink-0">
            <Download size={18} className="text-[#0D9488]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">Download your letters anytime</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any letter card to view details and download as PDF or DOCX. All letters are officially verified by Prolx Digital Agency.
            </p>
          </div>
        </div>
      )}

      {/* Modal */}
      {viewLetter && (
        <ViewLetterModal letter={viewLetter} onClose={() => setViewLetter(null)} />
      )}
    </div>
  );
}
