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
    <section className="bg-[#0F172A] relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#0D9488]/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#0D9488]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-14 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D9488]/20 border border-[#0D9488]/30 text-[#2DD4BF] text-xs font-semibold mb-5">
          <Shield size={13} />
          Certificate Verification — Unique Trust Feature
        </div>

        <h2
          className="text-2xl md:text-3xl font-bold text-white mb-3"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Verify a{" "}
          <span className="text-[#2DD4BF]">Prolx Certificate</span>
        </h2>
        <p className="text-[#94A3B8] text-sm leading-relaxed mb-7 max-w-lg mx-auto">
          All Prolx-issued certificates have a unique, tamper-proof ID. Enter it
          below to instantly verify authenticity.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-3 max-w-md mx-auto mb-5">
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
          className="inline-flex items-center gap-1.5 text-[#2DD4BF] text-sm font-medium hover:text-white transition-colors"
        >
          Open full verification portal <ChevronRight size={14} />
        </Link>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {[
            { icon: Award, text: "Unique Certificate IDs" },
            { icon: CheckCircle2, text: "Instant Verification" },
            { icon: Shield, text: "Tamper-Proof Records" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-[#94A3B8]"
            >
              <Icon size={13} className="text-[#2DD4BF]" />
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
