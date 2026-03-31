"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Download, FileText, CheckCircle, Award, Briefcase, FileCheck,
  FileSignature, BookOpen, GraduationCap, Banknote, UserX, TrendingUp,
  AlertTriangle, ShieldCheck, LogOut
} from "lucide-react";
import { getLetters } from "@/app/letter-actions";
import type { CompanyLetterWithProfiles } from "@/types/erp";
import type { LetterType } from "@/types/erp";

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

export default function ClientLetterPanel({ userId }: { userId: string }) {
  const [letters, setLetters] = useState<CompanyLetterWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null);
  const [downloadingDOCX, setDownloadingDOCX] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    // getLetters uses RLS so it only returns the user's letters 
    const { data } = await getLetters();
    setLetters((data as CompanyLetterWithProfiles[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = letters.filter(l => {
    if (!search) return true;
    return l.id.toLowerCase().includes(search.toLowerCase()) || l.subject.toLowerCase().includes(search.toLowerCase());
  });

  const handleDownloadPDF = async (letter: CompanyLetterWithProfiles) => {
    setDownloadingPDF(letter.id);
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
    } finally { setDownloadingPDF(null); }
  };

  const handleDownloadDOCX = async (letter: CompanyLetterWithProfiles) => {
    setDownloadingDOCX(letter.id);
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
    } finally { setDownloadingDOCX(null); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <div className="text-xs text-[#64748B] mb-1">My Letters & Documents</div>
        <div className="text-3xl font-bold text-[#0F172A] font-mono mb-4">{letters.length}</div>
        
        <div className="flex mb-4 relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
            placeholder="Search by ID or subject…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={32} className="text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[#64748B] text-sm">No letters found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(letter => {
              const typeCfg = LETTER_TYPES.find(t => t.type === letter.letter_type) || LETTER_TYPES[LETTER_TYPES.length - 1];
              const Icon = typeCfg.icon;
              return (
                <div key={letter.id} className="border border-[#E2E8F0] rounded-2xl p-5 hover:border-[#0D9488] hover:shadow-sm transition-all bg-white relative">
                  <div className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex flex-col items-center justify-center ${typeCfg.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="font-mono text-xs font-semibold text-[#0D9488] mb-1">{letter.id}</div>
                  <div className="font-bold text-[#0F172A] mb-1">{letter.subject}</div>
                  <div className="text-xs text-[#64748B] mb-6">Issued on {new Date(letter.created_at).toLocaleDateString()}</div>
                  
                  <div className="flex items-center gap-2 mt-auto">
                    <button
                      onClick={() => handleDownloadPDF(letter)}
                      disabled={!!downloadingPDF}
                      className="flex-1 py-2 text-xs font-semibold bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] rounded-xl hover:bg-[#F1F5F9] flex items-center justify-center gap-2"
                    >
                      {downloadingPDF === letter.id ? <div className="w-3 h-3 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin" /> : <Download size={13} />}
                      PDF
                    </button>
                    <button
                      onClick={() => handleDownloadDOCX(letter)}
                      disabled={!!downloadingDOCX}
                      className="flex-1 py-2 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 rounded-xl hover:bg-blue-100 flex items-center justify-center gap-2"
                    >
                      {downloadingDOCX === letter.id ? <div className="w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" /> : <FileText size={13} />}
                      DOCX
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
