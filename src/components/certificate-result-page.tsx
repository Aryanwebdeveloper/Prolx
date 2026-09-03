"use client";

import Link from "next/link";
import {
  CheckCircle2, XCircle, AlertTriangle, Clock, Shield, Award, Calendar, User,
  Building2, ArrowLeft, Search, Ban, Download, Printer, Share2, Copy, Check, Eye, ExternalLink, QrCode
} from "lucide-react";
import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import { formatCertDate, getCertStatus, formatCertDateFull } from "@/lib/certificates";
import { generateCertificatePDF } from "@/lib/certificate-generator";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveAs } from "file-saver";

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
    is_uploaded?: boolean;
    file_url?: string | null;
    qr_code_url?: string | null;
    start_date?: string | null;
    completion_date?: string | null;
    course_duration?: string | null;
  } | null;
  status: CertStatus;
}

const statusConfig = {
  active: {
    icon: CheckCircle2,
    label: "VERIFIED CERTIFICATE",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-900/50",
    text: "text-emerald-700 dark:text-emerald-400",
    iconColor: "text-emerald-500",
    badgeBg: "bg-emerald-100 dark:bg-emerald-950",
    gradientFrom: "from-emerald-600",
    gradientTo: "to-teal-600",
    desc: "This certificate is authentic, active, and officially verified by Prolx Digital Agency & Academy.",
  },
  inactive: {
    icon: AlertTriangle,
    label: "INACTIVE CERTIFICATE",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-900/50",
    text: "text-amber-700 dark:text-amber-400",
    iconColor: "text-amber-500",
    badgeBg: "bg-amber-100 dark:bg-amber-950",
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-600",
    desc: "This certificate exists in Prolx records but is currently inactive.",
  },
  expired: {
    icon: Clock,
    label: "EXPIRED CERTIFICATE",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    border: "border-orange-200 dark:border-orange-900/50",
    text: "text-orange-700 dark:text-orange-400",
    iconColor: "text-orange-500",
    badgeBg: "bg-orange-100 dark:bg-orange-950",
    gradientFrom: "from-orange-500",
    gradientTo: "to-red-500",
    desc: "This certificate has exceeded its valid period.",
  },
  revoked: {
    icon: Ban,
    label: "CERTIFICATE REVOKED",
    bg: "bg-rose-50 dark:bg-rose-950/20",
    border: "border-rose-200 dark:border-rose-900/50",
    text: "text-rose-700 dark:text-rose-400",
    iconColor: "text-rose-500",
    badgeBg: "bg-rose-100 dark:bg-rose-950",
    gradientFrom: "from-rose-500",
    gradientTo: "to-red-600",
    desc: "This certificate has been revoked by Prolx Digital Agency administration and is no longer valid.",
  },
  not_found: {
    icon: XCircle,
    label: "CERTIFICATE NOT FOUND",
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-900/50",
    text: "text-red-700 dark:text-red-400",
    iconColor: "text-red-500",
    badgeBg: "bg-red-100 dark:bg-red-950",
    gradientFrom: "from-red-500",
    gradientTo: "to-rose-600",
    desc: "No active certificate record matching this ID was found. Please double-check the ID or scan again.",
  },
};

export default function CertificateResultPage({ certId, cert, status }: Props) {
  const config = statusConfig[status] || statusConfig.not_found;
  const Icon = config.icon;
  const [searchId, setSearchId] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const t = searchId.trim().toUpperCase();
    if (t) router.push(`/verify-certificate/${t}`);
  };

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://prolx.cloud/verify-certificate/${certId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!cert) return;
    setDownloading(true);
    try {
      if (cert.is_uploaded && cert.file_url) {
        window.open(cert.file_url, "_blank");
      } else {
        const blob = await generateCertificatePDF({
          type: (cert.certificate_type as any) || "course_completion",
          recipientName: cert.recipient_name,
          courseTitle: cert.title,
          courseDuration: cert.course_duration || undefined,
          startDate: cert.start_date || undefined,
          completionDate: cert.completion_date || undefined,
          certId: cert.id,
          issueDate: cert.issue_date,
          internshipField: cert.internship_field,
          verificationUrl: cert.qr_code_url || (typeof window !== "undefined" ? window.location.href : `https://prolx.cloud/verify-certificate/${cert.id}`),
        });
        saveAs(blob, `PROLX-CERTIFICATE-${cert.id}.pdf`);
      }
    } catch (err: any) {
      alert("Error generating certificate PDF: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col font-sans">
      <div className="print:hidden">
        <ProlxNavbar />
      </div>

      <div className="flex-1 max-w-4xl mx-auto px-6 py-12 text-slate-800 dark:text-slate-200 w-full">
        {/* Navigation Top Bar */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <Link
            href="/verify-certificate"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] hover:text-[#0D9488] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Verification Search
          </Link>

          {cert && status === "active" && (
            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all shadow-sm"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? "Link Copied!" : "Copy Verification URL"}
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all shadow-sm"
              >
                <Printer size={14} /> Print
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              >
                <Download size={14} />
                {downloading ? "Preparing..." : "Download Official PDF"}
              </button>
            </div>
          )}
        </div>

        {/* Status Alert Banner */}
        <div className={`rounded-2xl border ${config.border} ${config.bg} p-6 mb-8 flex items-start gap-4 shadow-sm print:hidden`}>
          <div className={`w-14 h-14 rounded-2xl ${config.badgeBg} flex items-center justify-center shrink-0`}>
            <Icon size={30} className={config.iconColor} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${config.badgeBg} ${config.text}`}>
                <Shield size={13} />
                {config.label}
              </span>
              <span className="font-mono text-xs text-slate-500 font-semibold">ID: {certId}</span>
            </div>
            <p className={`text-sm ${config.text} font-semibold mt-1`}>{config.desc}</p>
            {cert?.revoked_reason && (
              <div className="mt-2 p-3 bg-rose-100/60 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-medium">
                <strong>Revocation Reason:</strong> {cert.revoked_reason}
              </div>
            )}
          </div>
        </div>

        {/* Certificate Authentic View */}
        {cert && status !== "revoked" && (
          <div className="space-y-8">
            {/* Visual Certificate Card / Document Preview */}
            <div ref={printRef} className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E2E8F0] dark:border-slate-800 overflow-hidden shadow-xl">
              {/* Header Banner */}
              <div className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} p-8 text-white relative`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award size={28} className="opacity-90" />
                    <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                      {cert.category}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold bg-black/20 px-3 py-1 rounded-full">
                    {cert.id}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  {cert.title}
                </h1>
                {cert.internship_field && (
                  <p className="text-white/90 text-sm mt-1 font-medium">
                    Specialization: <strong>{cert.internship_field}</strong>
                  </p>
                )}
                {cert.description && (
                  <p className="text-white/80 text-xs sm:text-sm mt-3 leading-relaxed max-w-2xl">{cert.description}</p>
                )}
              </div>

              {/* Certificate Document Content Details */}
              <div className="p-8 grid sm:grid-cols-2 gap-6 border-b border-slate-100 dark:border-slate-800">
                <DetailItem
                  icon={User}
                  label="Student / Recipient Name"
                  value={cert.recipient_name}
                  bold
                />
                <DetailItem
                  icon={Award}
                  label="Course / Program Title"
                  value={cert.title}
                />
                <DetailItem
                  icon={Calendar}
                  label="Issue Date"
                  value={formatCertDate(cert.issue_date)}
                />
                <DetailItem
                  icon={Calendar}
                  label="Duration / Period"
                  value={cert.course_duration || "Completed"}
                />
                <DetailItem
                  icon={Building2}
                  label="Issuing Institution"
                  value={cert.issued_by || "Prolx Digital Agency"}
                />
                <DetailItem
                  icon={Shield}
                  label="Digital Verification"
                  value="Cryptographically Authenticated"
                  success
                />
              </div>

              {/* Uploaded Certificate Document Viewer if present */}
              {cert.is_uploaded && cert.file_url && (
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-center">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uploaded Certificate Document</span>
                    <a href={cert.file_url} target="_blank" rel="noreferrer" className="text-xs text-[#0D9488] hover:underline font-semibold flex items-center gap-1">
                      Open Original Document <ExternalLink size={13} />
                    </a>
                  </div>
                  {cert.file_url.endsWith(".pdf") ? (
                    <iframe src={cert.file_url} className="w-full h-96 rounded-xl border border-slate-200 dark:border-slate-800" title="Uploaded Certificate PDF" />
                  ) : (
                    <img src={cert.file_url} alt="Uploaded Certificate" className="max-h-96 mx-auto rounded-xl shadow border border-slate-200 dark:border-slate-800 object-contain" />
                  )}
                </div>
              )}

              {/* Visual Certificate Reference Preview */}
              {!cert.is_uploaded && (
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center">
                  <div className="text-center mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Certificate Template Preview</span>
                  </div>
                  <div className="relative max-w-xl w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-white">
                    <img src="/CourseresUIUXCertificate.png" alt="Prolx Certificate Template" className="w-full object-contain" />
                    {/* Dynamic Overlay Text */}
                    <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none text-center">
                      <div className="mt-[28%] font-bold text-[#0F172A] text-sm sm:text-base tracking-wide uppercase" style={{ fontSize: cert.recipient_name.length > 20 ? '12px' : '16px' }}>
                        {cert.recipient_name}
                      </div>
                      <div className="mb-[15%] text-[9px] sm:text-[11px] text-slate-700 max-w-[80%] mx-auto leading-tight">
                        Successfully completed <strong>{cert.title}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Footer */}
              <div className="px-8 py-4 bg-[#F8FAFC] dark:bg-slate-900/80 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between text-xs text-[#64748B]">
                <span>Verified by Prolx Digital Agency & Academy • prolx.cloud</span>
                <span className="font-bold text-[#0D9488]">PROLX CERTIFIED CREDENTIAL</span>
              </div>
            </div>
          </div>
        )}

        {/* Verification Search Box */}
        <div className="mt-10 bg-white dark:bg-slate-900 rounded-3xl border border-[#E2E8F0] dark:border-slate-800 p-6 shadow-sm print:hidden">
          <h3 className="font-bold text-[#0F172A] dark:text-slate-100 mb-3 flex items-center gap-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            <Search size={18} className="text-[#0D9488]" />
            Verify Another Certificate ID
          </h3>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Certificate ID e.g. PRLX-CERT-26-000001"
              className="flex-1 px-4 py-3 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 text-sm font-mono focus:outline-none focus:border-[#0D9488] bg-transparent text-[#0F172A] dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={!searchId.trim()}
              className="px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-bold rounded-2xl transition-all text-sm shadow-sm"
            >
              Verify Now
            </button>
          </form>
        </div>
      </div>

      <div className="print:hidden">
        <ProlxFooter />
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  bold = false,
  success = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  bold?: boolean;
  success?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${success ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500" : "bg-[#F0FDFA] dark:bg-slate-800 text-[#0D9488]"}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium mb-0.5">{label}</p>
        <p className={`text-sm ${bold ? "font-extrabold text-[#0F172A] dark:text-slate-100" : "font-semibold text-slate-800 dark:text-slate-200"} ${success ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
