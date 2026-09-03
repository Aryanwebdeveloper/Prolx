"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import { Search, ShieldCheck, QrCode, Award, CheckCircle2, FileCheck, ArrowRight } from "lucide-react";

export default function VerifyCertificateMainPage() {
  const [certId, setCertId] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = certId.trim().toUpperCase();
    if (clean) {
      router.push(`/verify-certificate/${clean}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col font-sans">
      <ProlxNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0FDFA] dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-[#0D9488] dark:text-teal-400 text-xs font-bold mb-4">
            <ShieldCheck size={16} /> Official Certificate Authenticator
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-slate-100 tracking-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Verify Prolx Certificate Credentials
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-400 mt-3 leading-relaxed">
            Enter your unique Prolx Certificate ID below to instantly authenticate academic achievements, course completion records, and official digital training credentials.
          </p>
        </div>

        {/* Search Box Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E2E8F0] dark:border-slate-800 p-8 shadow-xl mb-12">
          <form onSubmit={handleSearch} className="space-y-4">
            <label className="block text-xs font-bold text-[#475569] dark:text-slate-400 uppercase tracking-wider">
              Enter Certificate ID
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  placeholder="e.g. PRLX-CERT-26-000001 or PROLX-A83D21"
                  className="w-full pl-11 pr-4 py-3.5 text-sm sm:text-base rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#0D9488] dark:focus:border-teal-500 font-mono bg-transparent text-[#0F172A] dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={!certId.trim()}
                className="px-8 py-3.5 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-sm sm:text-base shrink-0"
              >
                Verify Certificate <ArrowRight size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              Tip: You can also scan the QR code printed on the bottom of any official Prolx Certificate.
            </p>
          </form>
        </div>

        {/* Feature Highlights */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#0D9488] flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-bold text-sm text-[#0F172A] dark:text-slate-200 mb-1">Instant Validation</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400">Cryptographically & database verified records directly from Prolx Academy server.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <QrCode size={24} />
            </div>
            <h3 className="font-bold text-sm text-[#0F172A] dark:text-slate-200 mb-1">QR Authenticated</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400">Point any smartphone camera at the certificate QR code for one-touch authentication.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <FileCheck size={24} />
            </div>
            <h3 className="font-bold text-sm text-[#0F172A] dark:text-slate-200 mb-1">Tamper Proof</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400">Revocation status and audit history prevent falsified certificates or outdated credentials.</p>
          </div>
        </div>
      </main>

      <ProlxFooter />
    </div>
  );
}
