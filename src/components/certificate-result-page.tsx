"use client";

import Link from "next/link";
import { CheckCircle2, XCircle, AlertTriangle, Clock, Shield, Award, Calendar, User, Building2, ArrowLeft, Search, Ban } from "lucide-react";
import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import { formatCertDate } from "@/lib/certificates";
import { useState } from "react";
import { useRouter } from "next/navigation";

type CertStatus = "active" | "inactive" | "expired" | "not_found" | "revoked";

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
    certificate_type?: string;
    internship_field?: string;
    revoked_at?: string;
    revoked_reason?: string;
    profiles?: { full_name: string } | null;
  } | null;
  status: CertStatus;
}

const statusConfig = {
  active: {
    icon: CheckCircle2,
    label: "Verification Success",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-900/50",
    text: "text-emerald-700 dark:text-emerald-400",
    iconColor: "text-emerald-500",
    badgeBg: "bg-emerald-100 dark:bg-emerald-950",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-teal-600",
    desc: "This certificate is authentic, active, and verified.",
  },
  inactive: {
    icon: AlertTriangle,
    label: "Inactive Certificate",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-900/50",
    text: "text-amber-700 dark:text-amber-400",
    iconColor: "text-amber-500",
    badgeBg: "bg-amber-100 dark:bg-amber-950",
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-600",
    desc: "This certificate exists but is currently deactivated.",
  },
  expired: {
    icon: Clock,
    label: "Expired Certificate",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    border: "border-orange-200 dark:border-orange-900/50",
    text: "text-orange-700 dark:text-orange-400",
    iconColor: "text-orange-500",
    badgeBg: "bg-orange-100 dark:bg-orange-950",
    gradientFrom: "from-orange-500",
    gradientTo: "to-red-500",
    desc: "This certificate has expired.",
  },
  revoked: {
    icon: Ban,
    label: "Certificate Not Found or Invalid",
    bg: "bg-rose-50 dark:bg-rose-950/20",
    border: "border-rose-200 dark:border-rose-900/50",
    text: "text-rose-700 dark:text-rose-400",
    iconColor: "text-rose-500",
    badgeBg: "bg-rose-100 dark:bg-rose-950",
    gradientFrom: "from-rose-500",
    gradientTo: "to-red-600",
    desc: "This certificate has been revoked and is no longer valid.",
  },
  not_found: {
    icon: XCircle,
    label: "Certificate Not Found or Invalid",
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-900/50",
    text: "text-red-700 dark:text-red-400",
    iconColor: "text-red-500",
    badgeBg: "bg-red-100 dark:bg-red-950",
    gradientFrom: "from-red-500",
    gradientTo: "to-rose-600",
    desc: "No active record found matching this Certificate ID. Please double check the ID.",
  },
};

export default function CertificateResultPage({ certId, cert, status }: Props) {
  const config = statusConfig[status] || statusConfig.not_found;
  const Icon = config.icon;
  const [searchId, setSearchId] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const t = searchId.trim().toUpperCase();
    if (t) router.push(`/certificates/${t}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950" style={{ fontFamily: "'Inter', sans-serif" }}>
      <ProlxNavbar />

      <div className="max-w-3xl mx-auto px-6 py-16 text-slate-800 dark:text-slate-200">
        {/* Back Link */}
        <Link
          href="/certificates"
          className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0D9488] mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Verification Portal
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
            {cert?.revoked_reason && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
                Reason: {cert.revoked_reason}
              </p>
            )}
            <p className="text-xs text-[#64748B] mt-2 font-mono">Certificate ID: {certId}</p>
          </div>
        </div>

        {/* Certificate Details */}
        {cert && status !== "revoked" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-850 overflow-hidden mb-6 shadow-sm">
            {/* Header Banner */}
            <div className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} p-6 text-white`}>
              <div className="flex items-center gap-3 mb-3">
                <Award size={24} className="opacity-80" />
                <span className="text-sm font-semibold opacity-80 uppercase tracking-widest">{cert.category}</span>
              </div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                {cert.title}
              </h1>
              {cert.internship_field && (
                <p className="text-white/80 text-sm mt-1 font-medium italic">
                  Specialization: {cert.internship_field}
                </p>
              )}
              {cert.description && (
                <p className="text-white/80 text-sm mt-2 leading-relaxed">{cert.description}</p>
              )}
            </div>

            {/* Details Grid */}
            <div className="p-6 grid sm:grid-cols-2 gap-6">
              <DetailItem
                icon={User}
                label="Staff Member Name"
                value={cert.recipient_name}
              />
              {cert.recipient_email && (
                <DetailItem
                  icon={User}
                  label="Verified Email"
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
                label="Expiry Status"
                value={cert.expiry_date ? formatCertDate(cert.expiry_date) : "Lifetime Validity"}
              />
              <DetailItem
                icon={Building2}
                label="Organization"
                value="Prolx Digital Agency"
              />
              <DetailItem
                icon={Shield}
                label="Verification Success"
                value="Officially Issued & Validated"
                success
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#F8FAFC] dark:bg-slate-850/50 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-[#0F172A] dark:text-slate-100 mb-3 flex items-center gap-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            <Search size={18} className="text-[#0D9488]" />
            Verify Another Certificate
          </h3>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Certificate ID e.g. PROLX-A83D21"
              className="flex-1 px-4 py-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800 text-sm font-mono focus:outline-none focus:border-[#0D9488] bg-transparent"
            />
            <button
              type="submit"
              disabled={!searchId.trim()}
              className="px-5 py-3 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-semibold rounded-xl transition-all text-sm shadow-sm"
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
  success = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  success?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${success ? "bg-emerald-50 dark:bg-emerald-950" : "bg-[#F0FDFA] dark:bg-slate-800"}`}>
        <Icon size={16} className={success ? "text-emerald-500" : "text-[#0D9488]"} />
      </div>
      <div>
        <p className="text-xs text-[#64748B] mb-0.5">{label}</p>
        <p className={`text-sm font-semibold ${success ? "text-emerald-600 dark:text-emerald-400" : "text-[#0F172A] dark:text-slate-200"}`}>{value}</p>
      </div>
    </div>
  );
}
