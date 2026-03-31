"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Search, ChevronRight, Award, CheckCircle2 } from "lucide-react";

export default function CertVerifyBanner() {
  const [certId, setCertId] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const t = certId.trim().toUpperCase();
    if (t) router.push(`/certificates/${t}`);
  };

  return (
    <section className="relative bg-[#0F172A] overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#0D9488]/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#0D9488]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D9488]/20 border border-[#0D9488]/30 text-[#2DD4BF] text-xs font-semibold mb-5">
              <Shield size={13} />
              Certificate Verification System
            </div>
            <h2
              className="text-3xl lg:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Verify Your <br />
              <span className="text-[#2DD4BF]">Prolx Certificate</span>
            </h2>
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">
              All Prolx-issued certificates carry a unique Certificate ID. Enter yours below or visit the full verification portal.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="text"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  placeholder="Enter Certificate ID…"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-[#64748B] focus:outline-none focus:border-[#0D9488] transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={!certId.trim()}
                className="px-5 py-3 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-semibold rounded-xl transition-all text-sm shrink-0 flex items-center gap-1.5"
              >
                Verify <ChevronRight size={14} />
              </button>
            </form>

            <Link
              href="/certificates"
              className="inline-flex items-center gap-2 text-[#2DD4BF] text-sm font-medium hover:text-[#0D9488] transition-colors"
            >
              View full verification portal <ChevronRight size={14} />
            </Link>
          </div>

          {/* Right: Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Award, title: "Unique IDs", desc: "Each certificate has a unique, tamper-proof ID." },
              { icon: CheckCircle2, title: "Instant Results", desc: "Verification results displayed in seconds." },
              { icon: Shield, title: "Tamper-proof", desc: "All records stored securely in our database." },
              { icon: Search, title: "Easy Lookup", desc: "Just enter the ID — no account needed." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                <Icon size={18} className="text-[#2DD4BF] mb-2" />
                <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
                <p className="text-[#94A3B8] text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
