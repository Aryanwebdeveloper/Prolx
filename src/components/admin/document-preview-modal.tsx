"use client";

import { useState } from "react";
import { X, Download, Send, Printer, Building2 } from "lucide-react";
import type { BusinessDocumentWithRelations } from "@/types/erp";
import { DOC_TYPE_LABELS } from "@/types/erp";

interface DocumentPreviewModalProps {
  doc: BusinessDocumentWithRelations;
  onClose: () => void;
  onSend?: (doc: BusinessDocumentWithRelations) => void;
}

export default function DocumentPreviewModal({ doc, onClose, onSend }: DocumentPreviewModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const currency = doc.currency || "PKR";
  const fmt = (n: number) => n.toLocaleString("en-US");

  const docTypeLabel = DOC_TYPE_LABELS[doc.type] || doc.type;
  const isQuotation = doc.type === "quotation";

  // Theme colors based on doc type
  const accent = isQuotation ? "#F59E0B" : "#0D9488";
  const accentGrad = isQuotation
    ? "linear-gradient(90deg, #F59E0B, #D97706)"
    : "linear-gradient(90deg, #0D9488, #0f766e)";
  const coverBg = isQuotation
    ? "linear-gradient(135deg, #0A0F1E 0%, #1A1040 40%, #0D1B3E 70%, #060C1A 100%)"
    : "linear-gradient(135deg, #0A0F1E 0%, #0D1B3E 40%, #091225 70%, #060C1A 100%)";
  const coverAccentBar = isQuotation
    ? "linear-gradient(90deg, #F59E0B, #0D9488, #6366F1)"
    : "linear-gradient(90deg, #0D9488, #6366F1, #EC4899)";
  const accentLight = isQuotation ? "#FCD34D" : "#5EEAD4";
  const badgeBg = isQuotation
    ? "rgba(245,158,11,0.2)"
    : "rgba(13,148,136,0.2)";
  const badgeBorder = isQuotation
    ? "rgba(245,158,11,0.4)"
    : "rgba(13,148,136,0.4)";

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const { generateProposalPDF } = await import("@/lib/pdf-utils");
      const blob = await generateProposalPDF(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadDocx = async () => {
    setDownloadingDocx(true);
    try {
      const { generateProposalDocx } = await import("@/lib/docx-utils");
      const blob = await generateProposalDocx(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.id}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("DOCX generation failed:", err);
    } finally {
      setDownloadingDocx(false);
    }
  };

  const contentSections = (doc.sections || []).filter(s => s.id !== "cover" && s.id !== "pricing" && s.id !== "signature");
  const signatureSec = (doc.sections || []).find(s => s.id === "signature");

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between flex-shrink-0 bg-[#F8FAFC]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded" style={{ color: accent, background: isQuotation ? "#FFFBEB" : "#F0FDFA" }}>
                {doc.id}
              </span>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                {docTypeLabel}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#0F172A] mt-1" style={{ fontFamily: "Georgia, serif" }}>
              {doc.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-[#64748B]"
              title="Print"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={handleDownloadDocx}
              disabled={downloadingDocx}
              className="flex items-center gap-1.5 px-3 py-2 border border-[#E2E8F0] text-xs font-semibold rounded-xl hover:bg-[#F1F5F9] disabled:opacity-50 text-[#64748B]"
            >
              <Download size={14} />
              {downloadingDocx ? "Generating…" : ".DOCX"}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-xl hover:bg-[#1E293B] disabled:opacity-50"
            >
              <Download size={14} />
              {downloading ? "Generating…" : ".PDF"}
            </button>
            {onSend && (doc.status === "draft" || doc.status === "review" || doc.status === "approved") && (
              <button
                onClick={() => onSend(doc)}
                className="flex items-center gap-1.5 px-3 py-2 text-white text-xs font-semibold rounded-xl hover:opacity-90"
                style={{ background: accentGrad }}
              >
                <Send size={14} /> Send to Client
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-100/50 print:bg-white print:p-0">
          {/* Cover Page */}
          <div className="relative" style={{ background: coverBg, minHeight: 400 }}>
            <div className="h-1.5 w-full" style={{ background: coverAccentBar }} />
            <div className="px-12 py-10 flex flex-col gap-7">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: accentGrad }}>
                  <Building2 size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg tracking-wide" style={{ fontFamily: "Georgia, serif" }}>PROLX</div>
                  <div className="text-[#94A3B8] text-xs tracking-widest uppercase">Digital Agency</div>
                </div>
              </div>

              {/* Badge */}
              <div className="flex">
                <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
                  style={{ background: badgeBg, border: `1px solid ${badgeBorder}`, color: accentLight }}>
                  {docTypeLabel}
                </span>
              </div>

              {/* Title */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white leading-tight" style={{ fontFamily: "Georgia, serif" }}>{doc.title}</h1>
                <div className="mt-3 h-1 w-24 rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                {doc.description && (
                  <p className="text-[#94A3B8] text-sm mt-3 max-w-lg">{doc.description}</p>
                )}
              </div>

              {/* Meta */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10">
                <div>
                  <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: accentLight }}>Prepared For</div>
                  <div className="text-white font-semibold text-sm">{doc.client?.full_name || "—"}</div>
                  <div className="text-[#94A3B8] text-xs">{doc.client?.email || ""}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: accentLight }}>Reference</div>
                  <div className="text-white font-mono text-sm">{doc.id}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: accentLight }}>Date</div>
                  <div className="text-white text-sm">
                    {doc.valid_until
                      ? `Valid until ${new Date(doc.valid_until).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
                      : new Date(doc.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="px-12 py-3 flex items-center justify-between border-t border-white/10" style={{ background: "rgba(0,0,0,0.3)" }}>
              <span className="text-[#94A3B8] text-xs">www.prolx.cloud</span>
              <span className="text-[#94A3B8] text-xs">prolxcontact@gmail.com</span>
              <span className="text-[#94A3B8] text-xs">Ph: 03300356046</span>
            </div>
          </div>

          {/* Document Body */}
          <div className="max-w-3xl mx-auto px-10 py-8 space-y-10 print:max-w-none">
            {/* Sections — render HTML */}
            {contentSections.length > 0 ? (
              contentSections.map((sec, i) => (
                <div key={sec.id}>
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="font-mono text-sm font-bold shrink-0" style={{ color: accent }}>{String(i + 1).padStart(2, "0")}</span>
                    <h2 className="text-xl font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-2 flex-1" style={{ fontFamily: "Georgia, serif" }}>
                      {sec.title}
                    </h2>
                  </div>
                  {sec.content ? (
                    <div
                      className="text-[#374151] leading-relaxed prose prose-sm max-w-none"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "0.9rem", lineHeight: "1.85" }}
                      dangerouslySetInnerHTML={{ __html: sec.content }}
                    />
                  ) : (
                    <p className="text-sm text-[#94A3B8] italic">No content provided for this section.</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-400 text-sm italic">
                No sections defined for this document yet.
              </div>
            )}

            {/* Line Items / Pricing Table */}
            {doc.line_items && doc.line_items.length > 0 && (
              <div>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-mono text-sm font-bold shrink-0" style={{ color: accent }}>{String(contentSections.length + 1).padStart(2, "0")}</span>
                  <h2 className="text-xl font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-2 flex-1" style={{ fontFamily: "Georgia, serif" }}>
                    Cost Breakdown
                  </h2>
                </div>
                <table className="w-full text-sm border-collapse rounded-xl overflow-hidden border border-[#E2E8F0]">
                  <thead>
                    <tr style={{ background: accentGrad }}>
                      <th className="text-left px-4 py-3 text-white text-xs uppercase font-semibold tracking-wide">Category</th>
                      <th className="text-left px-4 py-3 text-white text-xs uppercase font-semibold tracking-wide">Description</th>
                      <th className="text-center px-3 py-3 text-white text-xs uppercase font-semibold">Qty</th>
                      <th className="text-right px-4 py-3 text-white text-xs uppercase font-semibold">Unit Price</th>
                      <th className="text-right px-4 py-3 text-white text-xs uppercase font-semibold">Total ({currency})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doc.line_items.map((item, idx) => (
                      <tr key={item.id || idx} className={`border-b border-[#F1F5F9] ${idx % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}`}>
                        <td className="px-4 py-3 font-semibold capitalize text-[#64748B] text-xs">{item.category}</td>
                        <td className="px-4 py-3 text-[#0F172A]">{item.description}</td>
                        <td className="px-3 py-3 text-center text-[#64748B]">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-[#64748B] font-mono">{fmt(Number(item.unit_price))}</td>
                        <td className="px-4 py-3 text-right text-[#0F172A] font-bold font-mono">{fmt(Number(item.total))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#F8FAFC]">
                      <td colSpan={4} className="px-4 py-2.5 text-right text-sm font-medium text-[#475569]">Subtotal</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-[#0F172A]">{currency} {fmt(Number(doc.subtotal))}</td>
                    </tr>
                    {Number(doc.tax_rate) > 0 && (
                      <tr className="bg-[#F8FAFC]">
                        <td colSpan={4} className="px-4 py-2.5 text-right text-sm font-medium text-[#475569]">Tax ({doc.tax_rate}%)</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-[#0F172A]">{currency} {fmt((Number(doc.subtotal) * Number(doc.tax_rate)) / 100)}</td>
                      </tr>
                    )}
                    {Number(doc.discount) > 0 && (
                      <tr className="bg-[#F8FAFC]">
                        <td colSpan={4} className="px-4 py-2.5 text-right text-sm font-medium text-red-500">Discount</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-red-500">- {currency} {fmt(Number(doc.discount))}</td>
                      </tr>
                    )}
                    <tr style={{ background: accentGrad }}>
                      <td colSpan={4} className="px-4 py-3 text-right text-white font-bold">Grand Total</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-white text-base">{currency} {fmt(Number(doc.total))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Signature Block */}
            {signatureSec && (
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-2 mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  Acceptance & Signature
                </h2>
                {signatureSec.content && (
                  <div className="text-[#374151] mb-6 prose prose-sm max-w-none"
                    style={{ fontFamily: "Inter, sans-serif", lineHeight: "1.85" }}
                    dangerouslySetInnerHTML={{ __html: signatureSec.content }} />
                )}
                <div className="grid grid-cols-2 gap-8 mt-6">
                  <div className="pt-4" style={{ borderTop: `2px solid ${accent}` }}>
                    <div className="h-12 mb-2" />
                    <div className="text-xs text-[#94A3B8] uppercase tracking-wide">Client Authorization</div>
                    <div className="text-sm font-bold text-[#0F172A] mt-1">{doc.client?.full_name || "Client Representative"}</div>
                    <div className="text-xs text-[#94A3B8] mt-0.5">Date: _______________</div>
                  </div>
                  <div className="pt-4 text-right" style={{ borderTop: `2px solid ${accent}` }}>
                    <div className="text-base font-bold text-[#0F172A] mb-2" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                      Prolx Digital Agency
                    </div>
                    <div className="text-xs text-[#94A3B8] uppercase tracking-wide">Authorized Signatory</div>
                    <div className="text-xs text-[#94A3B8] mt-0.5">Date: _______________</div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-[#E2E8F0] pt-6 flex items-center justify-between text-xs text-[#94A3B8]">
              <span>PROLX Digital Agency · www.prolx.cloud</span>
              <span>Ph: 03300356046 | prolxcontact@gmail.com</span>
              <span>Ref: {doc.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
