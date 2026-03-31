"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, QrCode, Shield, CheckCircle2, Award, ChevronRight } from "lucide-react";
import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";

export default function CertificatesPage() {
  const [certId, setCertId] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = certId.trim().toUpperCase();
    if (trimmed) {
      router.push(`/certificates/${trimmed}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Inter', 'Bricolage Grotesque', sans-serif" }}>
      <ProlxNavbar />

      {/* Hero Section */}
      <section className="relative bg-[#0F172A] overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0D9488]/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0D9488]/20 border border-[#0D9488]/30 text-[#2DD4BF] text-sm font-semibold mb-6">
            <Shield size={15} />
            Certificate Verification Portal
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Verify Your <span className="text-[#2DD4BF]">Certificate</span>
          </h1>
          <p className="text-[#94A3B8] text-lg mb-10 max-w-xl mx-auto">
            Enter your Certificate ID below to instantly verify the authenticity of any Prolx-issued certificate.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="e.g. PROLX-AB12CD34"
                className="w-full pl-11 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-[#64748B] focus:outline-none focus:border-[#0D9488] focus:bg-white/15 transition-all text-sm font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!certId.trim()}
              className="px-6 py-4 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center gap-2 shrink-0"
            >
              Verify
              <ChevronRight size={16} />
            </button>
          </form>
        </div>
      </section>

      {/* Info Section */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Award,
              title: "Authentic Certificates",
              desc: "All Prolx certificates are issued with unique, verifiable IDs ensuring authenticity and integrity.",
              color: "teal",
            },
            {
              icon: QrCode,
              title: "Instant Verification",
              desc: "Enter any Certificate ID and get instant details: holder name, issue date, status, and more.",
              color: "blue",
            },
            {
              icon: CheckCircle2,
              title: "Trusted by Professionals",
              desc: "Our certification system is used by staff, clients, and partners across multiple industries.",
              color: "purple",
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                color === "teal" ? "bg-[#CCFBF1]" : color === "blue" ? "bg-blue-50" : "bg-purple-50"
              }`}>
                <Icon size={22} className={
                  color === "teal" ? "text-[#0D9488]" : color === "blue" ? "text-blue-500" : "text-purple-500"
                } />
              </div>
              <h3 className="font-bold text-[#0F172A] mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                {title}
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* QR Code Info */}
        <div className="mt-12 bg-[#0F172A] rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="bg-white rounded-xl p-4 shrink-0">
            <QrCode size={80} className="text-[#0D9488]" />
            <p className="text-xs text-center text-[#64748B] mt-2 font-mono">Scan → prolx.digital/certificates</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Have a QR Code?
            </h3>
            <p className="text-[#94A3B8] leading-relaxed mb-4">
              Scan the Prolx verification QR code on any physical document or card to be directed to this page. Then enter your unique Certificate ID to see full details.
            </p>
            <p className="text-[#2DD4BF] text-sm font-mono">
              Every certificate has a unique ID — your gateway to verified credentials.
            </p>
          </div>
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
