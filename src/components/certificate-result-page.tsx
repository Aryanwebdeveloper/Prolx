"use client";

import Link from "next/link";
import { CheckCircle2, XCircle, AlertTriangle, Clock, Shield, Award, Calendar, User, Building2, ArrowLeft, Search } from "lucide-react";
import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import { formatCertDate } from "@/lib/certificates";
import { useState } from "react";
import { useRouter } from "next/navigation";

type CertStatus = "active" | "inactive" | "expired" | "not_found";

interface Props {
  certId: string;
  cert: {
    id: string;
    title: string;
    description?: string;
    recipient_name: string;
    recipient_email?: string;
    issue_date: string;
    expiry_date?: string;
    status: string;
    issued_by: string;
    category: string;
    profiles?: { full_name: string } | null;
  } | null;
  status: CertStatus;
}

const statusConfig = {
  active: {
    icon: CheckCircle2,
    label: "Valid Certificate",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    iconColor: "text-emerald-500",
    badgeBg: "bg-emerald-100",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-teal-600",
    desc: "This certificate is authentic and currently valid.",
  },
  inactive: {
    icon: AlertTriangle,
    label: "Inactive Certificate",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    iconColor: "text-amber-500",
    badgeBg: "bg-amber-100",
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-600",
    desc: "This certificate exists but has been deactivated.",
  },
  expired: {
    icon: Clock,
    label: "Expired Certificate",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    iconColor: "text-orange-500",
    badgeBg: "bg-orange-100",
    gradientFrom: "from-orange-500",
    gradientTo: "to-red-500",
    desc: "This certificate was valid but has now expired.",
  },
  not_found: {
    icon: XCircle,
    label: "Certificate Not Found",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    iconColor: "text-red-500",
    badgeBg: "bg-red-100",
    gradientFrom: "from-red-500",
    gradientTo: "to-rose-600",
    desc: "No certificate found with this ID. Please check the ID and try again.",
  },
};

export default function CertificateResultPage({ certId, cert, status }: Props) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const [searchId, setSearchId] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const t = searchId.trim().toUpperCase();
    if (t) router.push(`/certificates/${t}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <ProlxNavbar />

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Back Link */}
        <Link
          href="/certificates"
          className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0D9488] mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Certificate Verification
        </Link>

        {/* Status Header Card */}
        <div className={`rounded-2xl border ${config.border} ${config.bg} p-6 mb-6 flex items-start gap-4`}>
          <div className={`w-14 h-14 rounded-full ${config.badgeBg} flex items-center justify-center shrink-0`}>
            <Icon size={28} className={config.iconColor} />
          </div>
          <div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.badgeBg} ${config.text} mb-2`}>
              <Shield size={12} />
              {config.label}
            </div>
            <p className={`text-sm ${config.text} font-medium`}>{config.desc}</p>
            <p className="text-xs text-[#64748B] mt-1 font-mono">Certificate ID: {certId}</p>
          </div>
        </div>

        {/* Certificate Details (if found) */}
        {cert && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden mb-6">
            {/* Header Banner */}
            <div className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} p-6 text-white`}>
              <div className="flex items-center gap-3 mb-3">
                <Award size={24} className="opacity-80" />
                <span className="text-sm font-semibold opacity-80 uppercase tracking-widest">{cert.category}</span>
              </div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                {cert.title}
              </h1>
              {cert.description && (
                <p className="text-white/80 text-sm mt-2 leading-relaxed">{cert.description}</p>
              )}
            </div>

            {/* Details Grid */}
            <div className="p-6 grid sm:grid-cols-2 gap-6">
              <DetailItem
                icon={User}
                label="Recipient"
                value={cert.recipient_name}
              />
              {cert.recipient_email && (
                <DetailItem
                  icon={User}
                  label="Email"
                  value={cert.recipient_email}
                />
              )}
              <DetailItem
                icon={Calendar}
                label="Issue Date"
                value={formatCertDate(cert.issue_date)}
              />
              <DetailItem
                icon={Calendar}
                label="Expiry Date"
                value={cert.expiry_date ? formatCertDate(cert.expiry_date) : "No Expiry"}
              />
              <DetailItem
                icon={Building2}
                label="Issued By"
                value={cert.issued_by || "Prolx Digital Agency"}
              />
              <DetailItem
                icon={Shield}
                label="Certificate ID"
                value={cert.id}
                mono
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="text-xs text-[#64748B]">
                Verified by Prolx Digital Agency • prolx.digital
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${config.badgeBg} ${config.text}`}>
                {status.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Try Another Search */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <h3 className="font-bold text-[#0F172A] mb-3 flex items-center gap-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            <Search size={18} className="text-[#0D9488]" />
            Verify Another Certificate
          </h3>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Certificate ID e.g. PROLX-AB12CD34"
              className="flex-1 px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm font-mono focus:outline-none focus:border-[#0D9488]"
            />
            <button
              type="submit"
              disabled={!searchId.trim()}
              className="px-5 py-3 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-semibold rounded-xl transition-all text-sm"
            >
              Verify
            </button>
          </form>
        </div>
      </div>

      <ProlxFooter />
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={16} className="text-[#0D9488]" />
      </div>
      <div>
        <p className="text-xs text-[#64748B] mb-0.5">{label}</p>
        <p className={`text-sm font-semibold text-[#0F172A] ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
