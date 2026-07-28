"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, Save, Plus, Trash2, RefreshCw, X, FileText,
  DollarSign, ChevronDown, Eye, Send, Bold, Italic, Underline,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Indent, Outdent, Minus, CheckCircle, Clock,
  Building2, Calendar, User, Hash, Sparkles, GripVertical,
  ChevronUp, Download
} from "lucide-react";
import { updateDocument } from "@/app/business-docs-actions";
import type { BusinessDocumentWithRelations, DocumentLineItem, DocSection, DocCurrency } from "@/types/erp";
import SignaturePad from "./signature-pad";

interface QuotationBuilderProps {
  doc: BusinessDocumentWithRelations;
  clients: { id: string; full_name: string; email: string }[];
  onBack: () => void;
  onSave: () => void;
}

const PRICING_MODELS = [
  { value: "fixed", label: "Fixed Price", desc: "One-time fixed project cost" },
  { value: "hourly", label: "Hourly Rate", desc: "Billed per hour of work" },
  { value: "retainer", label: "Monthly Retainer", desc: "Recurring monthly fee" },
  { value: "milestone", label: "Milestone Based", desc: "Payment on project milestones" },
  { value: "custom", label: "Custom", desc: "Custom pricing structure" },
];

const ITEM_CATEGORIES = [
  { value: "development", label: "💻 Development", color: "bg-blue-100 text-blue-700" },
  { value: "uiux", label: "🎨 UI/UX Design", color: "bg-pink-100 text-pink-700" },
  { value: "hosting", label: "☁️ Hosting", color: "bg-purple-100 text-purple-700" },
  { value: "domain", label: "🌐 Domain", color: "bg-indigo-100 text-indigo-700" },
  { value: "maintenance", label: "🔧 Maintenance", color: "bg-amber-100 text-amber-700" },
  { value: "support", label: "🎯 Support", color: "bg-green-100 text-green-700" },
  { value: "addon", label: "⚡ Add-on", color: "bg-orange-100 text-orange-700" },
  { value: "custom", label: "✏️ Custom", color: "bg-slate-100 text-slate-700" },
];

const DEFAULT_SECTIONS: DocSection[] = [
  { id: "cover", title: "Cover Page", content: "", order: 0 },
  { id: "intro", title: "Introduction", content: "<p>Thank you for considering <strong>Prolx Digital Agency</strong> for your project. Please find our detailed quotation below.</p>", order: 1 },
  { id: "scope", title: "Scope of Services", content: "<p>The following quotation covers the agreed scope of services:</p><ul><li>Service item 1</li><li>Service item 2</li><li>Service item 3</li></ul>", order: 2 },
  { id: "payment", title: "Payment Terms", content: "<ul><li><strong>50%</strong> advance payment upon quotation acceptance</li><li><strong>50%</strong> upon project completion and delivery</li></ul><p>All payments are due within <strong>7 business days</strong> of invoice receipt.</p>", order: 3 },
  { id: "validity", title: "Quotation Validity", content: "<p>This quotation is valid for <strong>15 days</strong> from the date of issue. Prices are subject to change after the validity period.</p>", order: 4 },
  { id: "terms", title: "Terms & Conditions", content: "<ol><li>All prices are exclusive of applicable taxes unless stated otherwise.</li><li>Any additional requirements outside this scope will be quoted separately.</li><li>Source code ownership transfers upon full payment.</li><li>Prolx Digital Agency is not liable for delays caused by client feedback bottlenecks.</li></ol>", order: 5 },
  { id: "signature", title: "Acceptance & Signature", content: "<p>By signing below, you confirm your acceptance of this quotation and authorize Prolx Digital Agency to proceed.</p>", order: 6 },
];

// ─── Rich Text Editor ──────────────────────────────────────────
function RichTextEditor({ value, onChange, placeholder, minHeight = 180 }: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isUserEdit = useRef(false);

  useEffect(() => {
    if (!isUserEdit.current && ref.current) {
      if (ref.current.innerHTML !== value) {
        ref.current.innerHTML = value || "";
      }
    }
    isUserEdit.current = false;
  }, [value]);

  const exec = (cmd: string, val?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    isUserEdit.current = true;
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const execBlock = (tag: string) => {
    ref.current?.focus();
    document.execCommand("formatBlock", false, tag);
    isUserEdit.current = true;
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const handleInput = () => {
    isUserEdit.current = true;
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const ToolBtn = ({ cmd, icon: Icon, title: t }: { cmd: string; icon: React.ElementType; title: string }) => (
    <button type="button" onMouseDown={e => { e.preventDefault(); exec(cmd); }} title={t}
      className="p-1.5 rounded-md text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors">
      <Icon size={13} />
    </button>
  );

  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0D9488]/30 focus-within:border-[#0D9488]">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <button type="button" onMouseDown={e => { e.preventDefault(); execBlock("h1"); }} title="Heading 1" className="p-1.5 rounded hover:bg-[#E2E8F0] text-[#64748B]"><Heading1 size={13} /></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); execBlock("h2"); }} title="Heading 2" className="p-1.5 rounded hover:bg-[#E2E8F0] text-[#64748B]"><Heading2 size={13} /></button>
        <div className="w-px h-4 bg-[#E2E8F0] mx-1" />
        <ToolBtn cmd="bold" icon={Bold} title="Bold" />
        <ToolBtn cmd="italic" icon={Italic} title="Italic" />
        <ToolBtn cmd="underline" icon={Underline} title="Underline" />
        <div className="w-px h-4 bg-[#E2E8F0] mx-1" />
        <ToolBtn cmd="justifyLeft" icon={AlignLeft} title="Left" />
        <ToolBtn cmd="justifyCenter" icon={AlignCenter} title="Center" />
        <ToolBtn cmd="justifyRight" icon={AlignRight} title="Right" />
        <ToolBtn cmd="justifyFull" icon={AlignJustify} title="Justify" />
        <div className="w-px h-4 bg-[#E2E8F0] mx-1" />
        <ToolBtn cmd="insertUnorderedList" icon={List} title="Bullets" />
        <ToolBtn cmd="insertOrderedList" icon={ListOrdered} title="Numbers" />
        <div className="w-px h-4 bg-[#E2E8F0] mx-1" />
        <ToolBtn cmd="outdent" icon={Outdent} title="Outdent" />
        <ToolBtn cmd="indent" icon={Indent} title="Indent" />
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("insertHorizontalRule"); }} title="Divider" className="p-1.5 rounded hover:bg-[#E2E8F0] text-[#64748B]"><Minus size={13} /></button>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning
        className="px-4 py-3 text-sm text-[#0F172A] focus:outline-none prose prose-sm max-w-none"
        style={{ minHeight, lineHeight: 1.75, fontFamily: "Inter, sans-serif" }}
        onInput={handleInput}
        data-placeholder={placeholder || "Write content here…"}
      />
      <style>{`
        [contenteditable]:empty:before { content: attr(data-placeholder); color: #94A3B8; pointer-events: none; }
        [contenteditable] h1 { font-size: 1.5em; font-weight: 700; margin: 0.5em 0; }
        [contenteditable] h2 { font-size: 1.2em; font-weight: 600; margin: 0.4em 0; }
        [contenteditable] p { margin: 0.4em 0; }
        [contenteditable] ul { list-style: disc; padding-left: 1.4em; margin: 0.4em 0; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.4em; margin: 0.4em 0; }
        [contenteditable] li { margin: 0.25em 0; }
        [contenteditable] hr { border: none; border-top: 2px solid #E2E8F0; margin: 0.75em 0; }
      `}</style>
    </div>
  );
}

// ─── Cover Page Editor ─────────────────────────────────────────
function CoverPageEditor({ doc, title, clientName, validUntil, onTitleChange }: {
  doc: BusinessDocumentWithRelations;
  title: string;
  clientName: string;
  validUntil: string;
  onTitleChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(135deg, #0A0F1E 0%, #1A1040 40%, #0D1B3E 70%, #060C1A 100%)", minHeight: 480 }}>
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #F59E0B, #0D9488, #6366F1)" }} />
        <div className="px-12 py-12 flex flex-col gap-7" style={{ minHeight: 460 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg tracking-wide" style={{ fontFamily: "Georgia, serif" }}>PROLX</div>
              <div className="text-[#94A3B8] text-xs tracking-widest uppercase">Digital Agency</div>
            </div>
          </div>
          <div className="flex">
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest" style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)", color: "#FCD34D" }}>
              Quotation
            </span>
          </div>
          <div className="flex-1">
            <input className="text-4xl font-bold text-white bg-transparent border-none outline-none w-full leading-tight"
              style={{ fontFamily: "Georgia, serif", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
              value={title} onChange={e => onTitleChange(e.target.value)} placeholder="Quotation Title…" />
            <div className="mt-3 h-1 w-24 rounded-full" style={{ background: "linear-gradient(90deg, #F59E0B, transparent)" }} />
          </div>
          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <User size={11} className="text-[#FCD34D]" />
                <span className="text-xs uppercase tracking-widest text-[#FCD34D] font-semibold">Prepared For</span>
              </div>
              <div className="text-white font-semibold text-sm">{clientName || "—"}</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Hash size={11} className="text-[#FCD34D]" />
                <span className="text-xs uppercase tracking-widest text-[#FCD34D] font-semibold">Reference</span>
              </div>
              <div className="text-white font-mono text-sm">{doc.id}</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar size={11} className="text-[#FCD34D]" />
                <span className="text-xs uppercase tracking-widest text-[#FCD34D] font-semibold">Valid Until</span>
              </div>
              <div className="text-white font-semibold text-sm">
                {validUntil ? new Date(validUntil).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
              </div>
            </div>
          </div>
        </div>
        <div className="px-12 py-3 flex items-center justify-between border-t border-white/10" style={{ background: "rgba(0,0,0,0.3)" }}>
          <span className="text-[#94A3B8] text-xs">www.prolx.com</span>
          <span className="text-[#94A3B8] text-xs">info@prolx.com</span>
          <span className="text-[#94A3B8] text-xs">Confidential</span>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-700">
        <FileText size={14} className="shrink-0 mt-0.5" />
        <span>Cover page auto-fills from settings (Title, Client, Valid Until, Document ID). Edit the title inline above.</span>
      </div>
    </div>
  );
}

// ─── Quotation Preview ─────────────────────────────────────────
function QuotationPreview({ doc, sections, title, clientName, currency, lineItems, taxRate, discount, validUntil, pricingModel, onClose }: {
  doc: BusinessDocumentWithRelations;
  sections: DocSection[];
  title: string;
  clientName: string;
  currency: string;
  lineItems: Partial<DocumentLineItem>[];
  taxRate: number;
  discount: number;
  validUntil: string;
  pricingModel: string;
  onClose: () => void;
}) {
  const subtotal = lineItems.reduce((s, i) => s + (Number(i.quantity || 1) * Number(i.unit_price || 0)), 0);
  const taxAmt = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmt - discount;
  const fmt = (n: number) => n.toLocaleString("en-US");
  const contentSections = sections.filter(s => s.id !== "cover" && s.id !== "signature");

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-end">
      <div className="w-full max-w-3xl h-screen bg-white overflow-y-auto shadow-2xl flex flex-col">
        <div className="sticky top-0 z-10 bg-white border-b border-[#E2E8F0] px-6 py-3 flex items-center justify-between">
          <span className="font-semibold text-[#0F172A] text-sm flex items-center gap-2">
            <Eye size={15} className="text-[#F59E0B]" /> Quotation Preview
          </span>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F1F5F9] text-[#64748B]"><X size={16} /></button>
        </div>

        {/* Cover */}
        <div style={{ background: "linear-gradient(135deg, #0A0F1E 0%, #1A1040 40%, #0D1B3E 70%, #060C1A 100%)", minHeight: 380 }}>
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #F59E0B, #0D9488, #6366F1)" }} />
          <div className="px-12 py-10 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>
                <Building2 size={20} className="text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-lg tracking-wide" style={{ fontFamily: "Georgia, serif" }}>PROLX</div>
                <div className="text-[#94A3B8] text-xs tracking-widest uppercase">Digital Agency</div>
              </div>
            </div>
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest self-start" style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)", color: "#FCD34D" }}>Quotation</span>
            <h1 className="text-3xl font-bold text-white leading-tight" style={{ fontFamily: "Georgia, serif" }}>{title}</h1>
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#FCD34D] font-semibold mb-1">Prepared For</div>
                <div className="text-white font-semibold text-sm">{clientName || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-[#FCD34D] font-semibold mb-1">Reference</div>
                <div className="text-white font-mono text-sm">{doc.id}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-[#FCD34D] font-semibold mb-1">Valid Until</div>
                <div className="text-white text-sm">{validUntil ? new Date(validUntil).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</div>
              </div>
            </div>
          </div>
          <div className="px-12 py-3 flex items-center justify-between border-t border-white/10" style={{ background: "rgba(0,0,0,0.3)" }}>
            <span className="text-[#94A3B8] text-xs">www.prolx.com</span>
            <span className="text-[#94A3B8] text-xs">{pricingModel.charAt(0).toUpperCase() + pricingModel.slice(1)} Pricing</span>
            <span className="text-[#94A3B8] text-xs">Confidential</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-12 py-8 space-y-10 flex-1">
          {contentSections.map((sec, i) => (
            <div key={sec.id}>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-[#F59E0B] font-mono text-sm font-bold shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="text-xl font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-2 flex-1" style={{ fontFamily: "Georgia, serif" }}>{sec.title}</h2>
              </div>
              <div className="text-[#374151] leading-relaxed prose prose-sm max-w-none"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "0.9rem", lineHeight: "1.85" }}
                dangerouslySetInnerHTML={{ __html: sec.content || "<p><em>No content added.</em></p>" }} />
            </div>
          ))}

          {/* Pricing Table */}
          {lineItems.filter(i => i.description).length > 0 && (
            <div>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-[#F59E0B] font-mono text-sm font-bold shrink-0">{String(contentSections.length + 1).padStart(2, "0")}</span>
                <h2 className="text-xl font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-2 flex-1" style={{ fontFamily: "Georgia, serif" }}>Pricing Breakdown</h2>
              </div>
              <table className="w-full text-sm border-collapse rounded-xl overflow-hidden border border-[#E2E8F0]">
                <thead>
                  <tr style={{ background: "linear-gradient(90deg, #F59E0B, #D97706)" }}>
                    <th className="text-left px-4 py-3 text-white text-xs uppercase font-semibold tracking-wide">Item</th>
                    <th className="text-center px-3 py-3 text-white text-xs uppercase font-semibold">Qty</th>
                    <th className="text-center px-3 py-3 text-white text-xs uppercase font-semibold">Unit</th>
                    <th className="text-right px-4 py-3 text-white text-xs uppercase font-semibold">Rate</th>
                    <th className="text-right px-4 py-3 text-white text-xs uppercase font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.filter(i => i.description).map((item, idx) => (
                    <tr key={idx} className={`border-b border-[#F1F5F9] ${idx % 2 === 0 ? "bg-white" : "bg-[#FFFBEB]"}`}>
                      <td className="px-4 py-3 text-[#0F172A]">{item.description}{item.is_optional && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Optional</span>}</td>
                      <td className="px-3 py-3 text-center text-[#64748B]">{item.quantity}</td>
                      <td className="px-3 py-3 text-center text-[#64748B] capitalize">{item.unit}</td>
                      <td className="px-4 py-3 text-right font-mono text-[#64748B]">{currency} {fmt(Number(item.unit_price))}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-[#0F172A]">{currency} {fmt(Number(item.quantity || 1) * Number(item.unit_price || 0))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#FFFBEB]">
                    <td colSpan={4} className="px-4 py-2.5 text-right text-sm font-medium text-[#475569]">Subtotal</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold">{currency} {fmt(subtotal)}</td>
                  </tr>
                  {taxAmt > 0 && (
                    <tr className="bg-[#FFFBEB]">
                      <td colSpan={4} className="px-4 py-2.5 text-right text-sm font-medium text-[#475569]">Tax ({taxRate}%)</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold">{currency} {fmt(taxAmt)}</td>
                    </tr>
                  )}
                  {discount > 0 && (
                    <tr className="bg-[#FFFBEB]">
                      <td colSpan={4} className="px-4 py-2.5 text-right text-sm font-medium text-red-500">Discount</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-red-500">- {currency} {fmt(discount)}</td>
                    </tr>
                  )}
                  <tr style={{ background: "linear-gradient(90deg, #F59E0B, #D97706)" }}>
                    <td colSpan={4} className="px-4 py-3 text-right text-white font-bold">Total Amount</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white text-base">{currency} {fmt(total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Signature */}
          {sections.find(s => s.id === "signature") && (
            <div>
              <h2 className="text-xl font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-2 mb-4" style={{ fontFamily: "Georgia, serif" }}>Acceptance & Signature</h2>
              <div className="text-[#374151] mb-6 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sections.find(s => s.id === "signature")?.content || "" }} />
              <div className="grid grid-cols-2 gap-8 mt-6">
                <div className="border-t-2 border-[#F59E0B] pt-4">
                  <div className="h-12 mb-2" />
                  <div className="text-xs text-[#94A3B8] uppercase tracking-wide">Client Signature</div>
                  <div className="text-sm font-medium text-[#0F172A] mt-1">{clientName || "Client Name"}</div>
                  <div className="text-xs text-[#94A3B8] mt-0.5">Date: _______________</div>
                </div>
                <div className="border-t-2 border-[#F59E0B] pt-4">
                  <div className="text-base font-bold text-[#0F172A] mb-2" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>Prolx Digital Agency</div>
                  <div className="text-xs text-[#94A3B8] uppercase tracking-wide">Authorized Signatory</div>
                  <div className="text-xs text-[#94A3B8] mt-0.5">Date: _______________</div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-[#E2E8F0] pt-6 flex items-center justify-between text-xs text-[#94A3B8]">
            <span>PROLX Digital Agency · www.prolx.com</span>
            <span>Ref: {doc.id}</span>
            <span>Confidential</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Quotation Builder ────────────────────────────────────
export default function QuotationBuilder({ doc, clients, onBack, onSave }: QuotationBuilderProps) {
  const [title, setTitle] = useState(doc.title);
  const [clientId, setClientId] = useState(doc.client_id || "");
  const [currency, setCurrency] = useState<DocCurrency>((doc.currency as DocCurrency) || "PKR");
  const [pricingModel, setPricingModel] = useState(doc.pricing_model || "fixed");
  const [validUntil, setValidUntil] = useState(doc.valid_until || "");
  const [taxRate, setTaxRate] = useState(doc.tax_rate || 0);
  const [discount, setDiscount] = useState(doc.discount || 0);
  const [lineItems, setLineItems] = useState<Partial<DocumentLineItem>[]>(
    (doc.line_items && doc.line_items.length > 0) ? doc.line_items : [
      { category: "development", description: "", quantity: 1, unit: "unit", unit_price: 0, is_optional: false, display_order: 0 }
    ]
  );
  const [sections, setSections] = useState<DocSection[]>(
    (doc.sections && doc.sections.length > 0) ? [...doc.sections].sort((a, b) => a.order - b.order) : DEFAULT_SECTIONS
  );
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || "cover");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showSignature, setShowSignature] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const clientName = clients.find(c => c.id === clientId)?.full_name || "";

  const subtotal = lineItems.reduce((s, i) => s + (Number(i.quantity || 1) * Number(i.unit_price || 0)), 0);
  const taxAmt = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmt - discount;
  const fmt = (n: number) => n.toLocaleString("en-US");

  const addItem = () => setLineItems(prev => [
    ...prev,
    { category: "development", description: "", quantity: 1, unit: "unit", unit_price: 0, is_optional: false, display_order: prev.length }
  ]);
  const updateItem = (idx: number, field: string, val: unknown) =>
    setLineItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  const removeItem = (idx: number) => setLineItems(prev => prev.filter((_, i) => i !== idx));

  const getCatConfig = (cat: string) =>
    ITEM_CATEGORIES.find(c => c.value === cat) || ITEM_CATEGORIES[ITEM_CATEGORIES.length - 1];

  const updateSectionContent = (id: string, content: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, content } : s));
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => handleSave(false), 3000);
  };

  const addSection = () => {
    const newSec: DocSection = { id: `sec-${Date.now()}`, title: "New Section", content: "", order: sections.length };
    setSections(prev => [...prev, newSec]);
    setActiveSection(newSec.id);
  };

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
    if (activeSection === id) setActiveSection(sections[0]?.id || "");
  };

  const moveSection = (id: string, dir: "up" | "down") => {
    const idx = sections.findIndex(s => s.id === id);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === sections.length - 1) return;
    const next = [...sections];
    const si = dir === "up" ? idx - 1 : idx + 1;
    [next[idx], next[si]] = [next[si], next[idx]];
    setSections(next.map((s, i) => ({ ...s, order: i })));
  };

  const handleSave = async (andClose = false) => {
    if (saving) return;
    setSaving(true);
    setSaveStatus("saving");
    const items = lineItems.filter(i => i.description) as DocumentLineItem[];
    await updateDocument(doc.id, {
      title,
      client_id: clientId || undefined,
      valid_until: validUntil || undefined,
      currency,
      pricing_model: pricingModel,
      tax_rate: taxRate,
      discount,
      line_items: items,
      sections,
      change_notes: "Quotation updated",
    });
    setSaving(false);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 3000);
    if (andClose) onSave();
  };

  const activeSec = sections.find(s => s.id === activeSection);

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] -m-6">
      {/* Top Bar */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-3 flex items-center justify-between flex-shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] px-2 py-1 rounded-lg hover:bg-[#F1F5F9]">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="w-px h-5 bg-[#E2E8F0]" />
          <input className="font-bold text-[#0F172A] bg-transparent border-none outline-none text-sm min-w-[200px] max-w-[400px]"
            value={title} onChange={e => setTitle(e.target.value)} placeholder="Quotation title…" />
          <span className="text-xs text-[#94A3B8] font-mono bg-[#F1F5F9] px-2 py-0.5 rounded-md">{doc.id}</span>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === "saved" && <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle size={12} /> Saved</span>}
          {saveStatus === "saving" && <span className="flex items-center gap-1 text-xs text-[#94A3B8]"><Clock size={12} className="animate-spin" /> Saving…</span>}
          <button
            onClick={async () => {
              try {
                const { generateProposalDocx } = await import("@/lib/docx-utils");
                const blob = await generateProposalDocx(doc);
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${doc.id}.docx`;
                a.click();
                URL.revokeObjectURL(url);
              } catch (e) {
                console.error("DOCX Export Error", e);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] text-[#64748B]"
          >
            <Download size={14} /> Word (.docx)
          </button>
          <button onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] text-[#64748B]">
            <Eye size={14} /> Preview
          </button>
          <button onClick={() => handleSave(true)} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-white text-sm rounded-lg disabled:opacity-50 font-semibold"
            style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Save & Close"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar — Sections + Pricing */}
        <div className="w-60 bg-white border-r border-[#E2E8F0] flex flex-col overflow-hidden flex-shrink-0">
          <div className="px-3 py-2.5 border-b border-[#F1F5F9] flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest">Sections</span>
            <button onClick={addSection} className="text-[#F59E0B] hover:text-[#D97706] p-1 rounded hover:bg-[#FFFBEB]" title="Add section">
              <Plus size={14} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-1.5">
            {/* Special "Pricing Items" entry */}
            <div
              className={`group flex items-center gap-1.5 mx-2 mb-0.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all text-xs ${
                activeSection === "__pricing__"
                  ? "bg-[#FFFBEB] text-[#D97706] font-semibold shadow-sm border border-[#FDE68A]"
                  : "text-[#64748B] hover:bg-[#FFFBEB] hover:text-[#D97706]"
              }`}
              onClick={() => setActiveSection("__pricing__")}
            >
              <DollarSign size={11} className="shrink-0" />
              <span className="flex-1 truncate">Pricing Items</span>
              <span className="text-[10px] font-mono bg-[#FEF3C7] text-[#D97706] px-1.5 rounded-full">{lineItems.filter(i => i.description).length}</span>
            </div>
            <div className="h-px bg-[#F1F5F9] mx-3 my-1" />
            {sections.map(sec => (
              <div key={sec.id}
                className={`group flex items-center gap-1.5 mx-2 mb-0.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all text-xs ${
                  activeSection === sec.id
                    ? "bg-[#FFFBEB] text-[#D97706] font-semibold shadow-sm border border-[#FDE68A]"
                    : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                }`}
                onClick={() => setActiveSection(sec.id)}>
                <GripVertical size={11} className="text-[#CBD5E1] shrink-0" />
                <span className="flex-1 truncate">{sec.title}</span>
                <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                  <button onClick={e => { e.stopPropagation(); moveSection(sec.id, "up"); }} className="p-0.5 hover:text-[#F59E0B] rounded"><ChevronUp size={9} /></button>
                  <button onClick={e => { e.stopPropagation(); moveSection(sec.id, "down"); }} className="p-0.5 hover:text-[#F59E0B] rounded"><ChevronDown size={9} /></button>
                  <button onClick={e => { e.stopPropagation(); removeSection(sec.id); }} className="p-0.5 hover:text-red-500 rounded"><Trash2 size={9} /></button>
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Main Editor */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-5">
            {/* Pricing Items */}
            {activeSection === "__pricing__" && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: "Georgia, serif" }}>Pricing Items</h2>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Add line items for your quotation</p>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "linear-gradient(90deg, #F59E0B, #D97706)" }}>
                        <th className="text-left px-4 py-3 font-semibold text-white text-xs uppercase tracking-wide">Category</th>
                        <th className="text-left px-4 py-3 font-semibold text-white text-xs uppercase tracking-wide">Description</th>
                        <th className="text-center px-3 py-3 font-semibold text-white text-xs uppercase tracking-wide">Qty</th>
                        <th className="text-center px-3 py-3 font-semibold text-white text-xs uppercase tracking-wide">Unit</th>
                        <th className="text-right px-4 py-3 font-semibold text-white text-xs uppercase tracking-wide">Price ({currency})</th>
                        <th className="text-right px-4 py-3 font-semibold text-white text-xs uppercase tracking-wide">Total</th>
                        <th className="text-center px-2 py-3 font-semibold text-white text-xs uppercase">Opt</th>
                        <th className="px-2 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.length === 0 && (
                        <tr><td colSpan={8} className="text-center py-8 text-[#94A3B8] text-sm italic">No items yet. Add your first line item below.</td></tr>
                      )}
                      {lineItems.map((item, idx) => (
                        <tr key={idx} className={`border-b border-[#F1F5F9] ${idx % 2 === 0 ? "bg-white" : "bg-[#FFFBEB]/30"} hover:bg-[#FFFBEB] transition-colors group`}>
                          <td className="px-3 py-2.5">
                            <select className="w-full text-xs border border-[#E2E8F0] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#F59E0B]"
                              value={item.category || "development"} onChange={e => updateItem(idx, "category", e.target.value)}>
                              {ITEM_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2.5">
                            <input className="w-full text-xs border border-[#E2E8F0] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#F59E0B] min-w-[180px]"
                              placeholder="Item description…" value={item.description || ""} onChange={e => updateItem(idx, "description", e.target.value)} />
                          </td>
                          <td className="px-2 py-2.5">
                            <input type="number" min="1" className="w-16 text-xs border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-[#F59E0B]"
                              value={item.quantity || 1} onChange={e => updateItem(idx, "quantity", Number(e.target.value))} />
                          </td>
                          <td className="px-2 py-2.5">
                            <select className="w-20 text-xs border border-[#E2E8F0] rounded-lg px-2 py-1.5 bg-white focus:outline-none"
                              value={item.unit || "unit"} onChange={e => updateItem(idx, "unit", e.target.value)}>
                              <option value="unit">Unit</option>
                              <option value="hour">Hour</option>
                              <option value="day">Day</option>
                              <option value="month">Month</option>
                              <option value="project">Project</option>
                            </select>
                          </td>
                          <td className="px-2 py-2.5">
                            <input type="number" min="0" className="w-28 text-xs border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-right font-mono focus:outline-none focus:ring-1 focus:ring-[#F59E0B]"
                              value={item.unit_price || 0} onChange={e => updateItem(idx, "unit_price", Number(e.target.value))} />
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-xs font-bold text-[#0F172A]">
                            {fmt(Number(item.quantity || 1) * Number(item.unit_price || 0))}
                          </td>
                          <td className="px-2 py-2.5 text-center">
                            <input type="checkbox" checked={item.is_optional || false} onChange={e => updateItem(idx, "is_optional", e.target.checked)} className="w-4 h-4 accent-[#F59E0B]" />
                          </td>
                          <td className="px-2 py-2.5">
                            <button onClick={() => removeItem(idx)} className="text-[#CBD5E1] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 rounded hover:bg-red-50">
                              <X size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={addItem} className="flex items-center gap-1.5 text-xs text-[#F59E0B] hover:text-[#D97706] font-semibold hover:underline">
                  <Plus size={13} /> Add Line Item
                </button>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-80 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[#64748B] mb-1 block font-medium">Tax Rate (%)</label>
                        <input type="number" min="0" max="100" className="w-full text-sm border border-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30"
                          value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="text-xs text-[#64748B] mb-1 block font-medium">Discount ({currency})</label>
                        <input type="number" min="0" className="w-full text-sm border border-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30"
                          value={discount} onChange={e => setDiscount(Number(e.target.value))} />
                      </div>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-[#FDE68A]">
                      <div className="bg-[#FFFBEB] px-4 py-3 space-y-2">
                        <div className="flex justify-between text-sm text-[#475569]">
                          <span>Subtotal</span><span className="font-mono font-medium">{currency} {fmt(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-[#475569]">
                          <span>Tax ({taxRate}%)</span><span className="font-mono font-medium">{currency} {fmt(taxAmt)}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-sm text-red-500">
                            <span>Discount</span><span className="font-mono font-medium">- {currency} {fmt(discount)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center px-4 py-3" style={{ background: "linear-gradient(90deg, #F59E0B, #D97706)" }}>
                        <span className="text-white font-bold text-sm">Total</span>
                        <span className="text-white font-mono font-bold text-lg">{currency} {fmt(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Section Content Editor */}
            {activeSec && activeSection !== "__pricing__" && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <input className="text-2xl font-bold text-[#0F172A] bg-transparent border-none outline-none w-full"
                      style={{ fontFamily: "Georgia, serif" }}
                      value={activeSec.title}
                      onChange={e => setSections(prev => prev.map(s => s.id === activeSec.id ? { ...s, title: e.target.value } : s))}
                      disabled={activeSec.id === "cover"} />
                    <p className="text-xs text-[#94A3B8] mt-0.5">Section {sections.findIndex(s => s.id === activeSec.id) + 1} of {sections.length}</p>
                  </div>
                </div>

                {activeSec.id === "cover" ? (
                  <CoverPageEditor doc={doc} title={title} clientName={clientName} validUntil={validUntil} onTitleChange={setTitle} />
                ) : activeSec.id === "signature" ? (
                  <div className="space-y-5">
                    <RichTextEditor value={activeSec.content} onChange={v => updateSectionContent(activeSec.id, v)}
                      placeholder="Add acceptance terms or instructions…" minHeight={120} />
                    <div className="grid grid-cols-2 gap-5">
                      <div className="bg-[#F8FAFC] rounded-xl p-4 text-center border-2 border-dashed border-[#E2E8F0]">
                        <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-widest mb-3">Client Signature</p>
                        {showSignature ? (
                          <SignaturePad onSave={() => setShowSignature(false)} onCancel={() => setShowSignature(false)} compact />
                        ) : (
                          <button onClick={() => setShowSignature(true)} className="text-xs text-[#F59E0B] hover:underline font-semibold">Click to draw signature</button>
                        )}
                      </div>
                      <div className="bg-[#F8FAFC] rounded-xl p-4 text-center border-2 border-dashed border-[#E2E8F0]">
                        <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-widest mb-3">Prolx Authorized</p>
                        <div className="text-sm font-bold text-[#0F172A] mt-4" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>Prolx Digital Agency</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <RichTextEditor value={activeSec.content} onChange={v => updateSectionContent(activeSec.id, v)}
                    placeholder={`Write ${activeSec.title} content here…`} minHeight={220} />
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Panel — Settings */}
        <div className="w-64 bg-white border-l border-[#E2E8F0] flex flex-col overflow-y-auto flex-shrink-0 p-4 space-y-5">
          <div>
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3">Quotation Settings</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#64748B] mb-1 block font-medium">Client</label>
                <select className="w-full text-xs border border-[#E2E8F0] rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30"
                  value={clientId} onChange={e => setClientId(e.target.value)}>
                  <option value="">No client assigned</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.full_name}{c.email ? ` (${c.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#64748B] mb-1 block font-medium">Currency</label>
                <select className="w-full text-xs border border-[#E2E8F0] rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30"
                  value={currency} onChange={e => setCurrency(e.target.value as DocCurrency)}>
                  <option value="PKR">PKR — Pakistani Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="AED">AED — UAE Dirham</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#64748B] mb-1 block font-medium">Valid Until</label>
                <input type="date" className="w-full text-xs border border-[#E2E8F0] rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30"
                  value={validUntil} onChange={e => setValidUntil(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-[#64748B] mb-1 block font-medium">Pricing Model</label>
                <select className="w-full text-xs border border-[#E2E8F0] rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30"
                  value={pricingModel} onChange={e => setPricingModel(e.target.value)}>
                  {PRICING_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl overflow-hidden border border-[#FDE68A]">
            <div className="px-3 py-2 flex items-center gap-2" style={{ background: "linear-gradient(90deg, #F59E0B, #D97706)" }}>
              <DollarSign size={12} className="text-white" />
              <p className="text-xs font-bold text-white uppercase tracking-widest">Summary</p>
            </div>
            <div className="bg-[#FFFBEB] px-3 py-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Line Items</span>
                <span className="font-bold text-[#0F172A]">{lineItems.filter(i => i.description).length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Optional</span>
                <span className="font-bold text-[#0F172A]">{lineItems.filter(i => i.is_optional).length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Subtotal</span>
                <span className="font-bold text-[#0F172A] font-mono">{currency} {fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-[#FDE68A] pt-2">
                <span className="text-[#64748B] font-bold">Total</span>
                <span className="font-bold text-[#D97706] font-mono">{currency} {fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {(() => {
            const groups: Record<string, number> = {};
            lineItems.forEach(item => {
              const cat = item.category || "custom";
              const amt = Number(item.quantity || 1) * Number(item.unit_price || 0);
              if (amt > 0) groups[cat] = (groups[cat] || 0) + amt;
            });
            return Object.keys(groups).length > 0 ? (
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">Cost Breakdown</p>
                <div className="space-y-1.5">
                  {Object.entries(groups).map(([cat, amt]) => {
                    const cfg = getCatConfig(cat);
                    return (
                      <div key={cat} className="flex items-center justify-between">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-xs font-mono font-semibold text-[#0F172A]">{currency} {fmt(amt)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null;
          })()}
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <QuotationPreview
          doc={doc} sections={sections} title={title} clientName={clientName}
          currency={currency} lineItems={lineItems} taxRate={taxRate} discount={discount}
          validUntil={validUntil} pricingModel={pricingModel}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
