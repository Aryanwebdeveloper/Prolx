"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShieldCheck, CheckCircle2, XCircle, Award, ChevronRight, Download, Share2 } from "lucide-react";
import { verifyCertificate } from "@/app/academy-actions";

export default function VerifyCertificatePage() {
  const [certId, setCertId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;
    setLoading(true);
    setSearched(true);
    const res = await verifyCertificate(certId);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Header */}
      <section className="bg-[#060D18] pt-28 pb-14 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0D9488] via-[#7C3AED] to-[#F97316]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <nav className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/academy" className="hover:text-[#2DD4BF]">Academy</Link>
            <ChevronRight size={12} />
            <span className="text-[#2DD4BF]">Verify Certificate</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-[#0D9488]/15 border border-[#0D9488]/30 text-[#2DD4BF] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <ShieldCheck size={16} /> Official Verification Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Verify Prolx <span className="bg-gradient-to-r from-[#2DD4BF] to-[#A78BFA] bg-clip-text text-transparent">Academy Certificate</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
            Enter the unique Certificate ID printed on the certificate or scan the QR code to verify authenticity.
          </p>

          {/* Search Form */}
          <form onSubmit={handleVerify} className="max-w-md mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. PLX-CERT-2024-0001"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:border-[#0D9488] font-mono text-sm uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity shrink-0"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {searched && (
          <div>
            {result?.found ? (
              <div className="bg-white border border-emerald-200 rounded-3xl p-8 shadow-xl text-center space-y-6">
                <div className="w-16 h-16 bg-[#F0FDF4] text-[#16A34A] rounded-full flex items-center justify-center mx-auto border border-[#BBF7D0]">
                  <CheckCircle2 size={36} />
                </div>

                <div>
                  <span className="bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Official Verified Certificate
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#0F172A] mt-3" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    {result.certificate.student_name}
                  </h2>
                  <p className="text-[#0D9488] font-semibold text-sm mt-1">{result.certificate.course_title}</p>
                </div>

                <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-6 text-left space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-[#64748B]">Certificate ID:</span>
                    <span className="font-mono font-bold text-[#0F172A]">{result.certificate.certificate_id}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-[#64748B]">Issue Date:</span>
                    <span className="font-semibold text-[#0F172A]">{result.certificate.issued_at}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-[#64748B]">Certificate Type:</span>
                    <span className="font-semibold capitalize text-[#0F172A]">{result.certificate.certificate_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Issued By:</span>
                    <span className="font-semibold text-[#0F172A]">Prolx Academy</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="flex-1 py-3 bg-[#0D9488] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
                    <Download size={16} /> Download PDF
                  </button>
                  <button className="flex-1 py-3 border border-slate-200 text-[#475569] font-semibold rounded-xl text-sm flex items-center justify-center gap-2">
                    <Share2 size={16} /> Share Verification
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-red-200 rounded-3xl p-8 shadow-xl text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
                  <XCircle size={36} />
                </div>
                <h2 className="text-2xl font-bold text-[#0F172A]">Certificate Not Found</h2>
                <p className="text-sm text-[#64748B] max-w-md mx-auto">
                  No certificate matching <strong>"{certId}"</strong> was found in our database. Please verify the ID and try again, or contact support if you believe this is an error.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
