"use client";

import { useState, useEffect } from "react";
import {
  Download, CheckCircle, XCircle, Printer, Link as LinkIcon,
  MessageSquare, Send, Sparkles, ShieldCheck, PenTool, X
} from "lucide-react";
import type { BusinessDocumentWithRelations } from "@/types/erp";
import { DOC_TYPE_LABELS } from "@/types/erp";
import {
  clientApproveDocument, recordClientView, addComment, getDocumentComments,
  addSignature
} from "@/app/business-docs-actions";
import SignaturePad from "@/components/admin/signature-pad";

interface DocumentPublicViewProps {
  initialDoc: BusinessDocumentWithRelations;
  token: string;
}

export default function DocumentPublicView({ initialDoc, token }: DocumentPublicViewProps) {
  const [doc, setDoc] = useState(initialDoc);
  const [status, setStatus] = useState(doc.status);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [showSignModal, setShowSignModal] = useState(false);
  const [actionType, setActionType] = useState<"accepted" | "rejected" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [downloading, setDownloading] = useState(false);

  const currency = doc.currency || "PKR";

  useEffect(() => {
    // Record view activity
    recordClientView(token);
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadComments = async () => {
    const { data } = await getDocumentComments(doc.id, false);
    if (data) setComments(data);
  };

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
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadDocx = async () => {
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
      console.error(err);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    const authorName = clientName || "Client Representative";
    const authorEmail = clientEmail || "";
    await addComment({
      document_id: doc.id,
      content: newComment,
      is_internal: false,
      author_name: authorName,
      author_email: authorEmail,
    });
    setNewComment("");
    loadComments();
  };

  const handleApproveOrReject = async (signatureData?: string, type?: string) => {
    if (!clientName.trim() || !clientEmail.trim()) {
      alert("Please provide your name and email to proceed.");
      return;
    }

    if (actionType === "accepted" && signatureData) {
      // Store digital signature
      await addSignature({
        document_id: doc.id,
        signer_name: clientName,
        signer_email: clientEmail,
        signer_role: "client",
        signature_data: signatureData,
        signature_type: type || "drawn",
      });
    }

    const { error } = await clientApproveDocument(
      token,
      actionType!,
      clientName,
      clientEmail,
      actionType === "rejected" ? rejectionReason : undefined
    );

    if (!error) {
      setStatus(actionType!);
      setShowSignModal(false);
      alert(`Document has been successfully ${actionType === "accepted" ? "accepted & signed" : "rejected"}.`);
    } else {
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Top Banner */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0D9488] flex items-center justify-center">
            <span className="text-white font-bold text-sm font-mono">Px</span>
          </div>
          <div>
            <span className="text-white font-bold text-base">Prolx Portal</span>
            <span className="text-xs text-slate-400 block">Digital Verification Secured</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-700 rounded-xl hover:bg-slate-800 text-xs text-slate-300 font-semibold"
          >
            <Download size={13} /> {downloading ? "Generating PDF..." : "Download PDF"}
          </button>
          <button
            onClick={handleDownloadDocx}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-700 rounded-xl hover:bg-slate-800 text-xs text-slate-300 font-semibold"
          >
            <Download size={13} /> Download Word
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        {/* Left 3 cols: Document render */}
        <div className="lg:col-span-3 overflow-y-auto p-6 lg:p-12 bg-slate-900 flex justify-center">
          <div className="w-full max-w-3xl bg-white text-slate-800 shadow-2xl rounded-2xl p-8 lg:p-14 space-y-8 min-h-[1050px]">
            {/* Title Block */}
            <div className="text-center border-b pb-8 space-y-4">
              <div className="text-[#0D9488] font-bold text-2xl tracking-wider">PROLX DIGITAL AGENCY</div>
              <h1 className="text-3xl font-extrabold text-slate-900 leading-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                {doc.title}
              </h1>
              <p className="text-slate-500 text-sm">{doc.description}</p>
              <div className="grid grid-cols-2 gap-4 text-left max-w-sm mx-auto pt-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">PREPARED BY</span>
                  <span className="font-bold">Prolx Digital Agency</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">PREPARED FOR</span>
                  <span className="font-bold">{doc.client?.full_name || "Representative"}</span>
                </div>
              </div>
            </div>

            {/* Document Content */}
            {doc.sections?.filter(s => s.id !== "cover" && s.id !== "pricing").map((sec, i) => (
              <div key={sec.id} className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-[#0D9488] font-mono text-sm font-bold shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 flex-1" style={{ fontFamily: "Georgia, serif" }}>
                    {sec.title}
                  </h3>
                </div>
                {sec.content ? (
                  <div
                    className="text-sm text-slate-600 leading-relaxed prose prose-sm max-w-none"
                    style={{ fontFamily: "Inter, sans-serif", lineHeight: "1.85" }}
                    dangerouslySetInnerHTML={{ __html: sec.content }}
                  />
                ) : (
                  <p className="text-sm text-slate-400 italic">No content provided.</p>
                )}
              </div>
            ))}

            {/* Pricing Section Table */}
            {doc.line_items && doc.line_items.length > 0 && (
              <div className="space-y-4 pt-6">
                <h3 className="text-lg font-bold text-slate-900 border-b pb-1.5" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  Cost Breakdown
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#0D9488] text-white">
                      <tr>
                        <th className="p-3">Item</th>
                        <th className="p-3">Qty</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right">Total ({currency})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {doc.line_items.map((item) => (
                        <tr key={item.id}>
                          <td className="p-3">
                            <span className="font-semibold block capitalize">{item.category}</span>
                            <span className="text-slate-500">{item.description}</span>
                          </td>
                          <td className="p-3 text-slate-600">{item.quantity}</td>
                          <td className="p-3 text-right text-slate-600 font-mono">{Number(item.unit_price).toLocaleString()}</td>
                          <td className="p-3 text-right font-bold font-mono text-slate-800">{Number(item.total).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end pt-4">
                  <div className="w-60 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span className="font-mono">{currency} {Number(doc.subtotal).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Tax ({doc.tax_rate}%):</span>
                      <span className="font-mono">{currency} {((Number(doc.subtotal) * Number(doc.tax_rate)) / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Discount:</span>
                      <span className="font-mono">- {currency} {Number(doc.discount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800 text-sm border-t pt-2">
                      <span>Grand Total:</span>
                      <span className="font-mono text-[#0D9488]">{currency} {Number(doc.total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 col: Actions Panel & Conversation */}
        <div className="border-l border-slate-800 bg-slate-950 flex flex-col p-6 space-y-6 overflow-y-auto">
          {/* Status block */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#0D9488]" /> Document Operations
            </h3>

            {status === "sent" || status === "viewed" ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 leading-normal">
                  As the authorized representative, please review this document and proceed with your signature.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setActionType("accepted"); setShowSignModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#0D9488] text-white font-semibold text-xs rounded-xl hover:bg-[#0f766e] transition-colors"
                  >
                    <CheckCircle size={13} /> Accept & Sign
                  </button>
                  <button
                    onClick={() => { setActionType("rejected"); setShowSignModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 font-semibold text-xs rounded-xl transition-colors"
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 space-y-1.5">
                <span className="text-sm font-semibold text-white block capitalize">
                  Document is {status}
                </span>
                <span className="text-[11px] text-slate-500">
                  This document workflow is completed.
                </span>
              </div>
            )}
          </div>

          {/* Conversation Thread */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col flex-1 min-h-[300px]">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-4">
              <MessageSquare size={14} className="text-[#0D9488]" /> Discussion / Revisions
            </h3>

            {/* Input credentials */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input
                className="bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 outline-none focus:border-[#0D9488]"
                placeholder="Your Name"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
              />
              <input
                className="bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 outline-none focus:border-[#0D9488]"
                placeholder="Your Email"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
              />
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-semibold text-slate-300">{comment.author_name || "User"}</span>
                    <span className="text-slate-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-400 leading-normal">{comment.content}</p>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="mt-4 flex gap-1.5">
              <textarea
                className="flex-1 bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 outline-none focus:border-[#0D9488] resize-none h-12"
                placeholder="Leave a comment or question..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button
                onClick={handleSubmitComment}
                className="p-3 bg-[#0D9488] text-white rounded-xl hover:bg-[#0f766e] flex items-center justify-center"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Signature / Reject Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full text-slate-800 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-1.5 text-slate-900">
                <PenTool size={16} className="text-[#0D9488]" />
                {actionType === "accepted" ? "Confirm Signature & Seal" : "Specify Rejection Reason"}
              </h3>
              <button onClick={() => setShowSignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {actionType === "accepted" ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-normal">
                  Provide your name and draw or type your digital signature below. This signature will be embedded permanently in the document PDF.
                </p>
                <div className="space-y-3">
                  <input
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white"
                    placeholder="Representative Name *"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                  />
                  <input
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white"
                    placeholder="Representative Email *"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                  />
                </div>
                <SignaturePad
                  signerName={clientName}
                  onSave={(data, type) => handleApproveOrReject(data, type)}
                  onCancel={() => setShowSignModal(false)}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Please let us know why you are rejecting this proposal or requesting modifications.
                </p>
                <textarea
                  rows={4}
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-white resize-none outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                  placeholder="Details of revision requests..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowSignModal(false)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs hover:bg-slate-50 text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApproveOrReject()}
                    className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                  >
                    Submit Rejection
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
