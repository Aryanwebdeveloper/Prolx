"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ArrowLeft, Save, Eye, Plus, GripVertical, Trash2,
  RefreshCw, Bold, Italic, Underline, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ChevronDown, ChevronUp, Sparkles, X, EyeOff,
  Heading1, Heading2, Indent, Outdent, Minus,
  Building2, Calendar, User, DollarSign, Hash,
  CheckCircle, Clock, FileText, Download
} from "lucide-react";
import { updateDocument } from "@/app/business-docs-actions";
import type { BusinessDocumentWithRelations, DocSection, DocumentLineItem, DocCurrency } from "@/types/erp";
import SignaturePad from "./signature-pad";

interface ProposalBuilderProps {
  doc: BusinessDocumentWithRelations;
  clients: { id: string; full_name: string; email: string }[];
  onBack: () => void;
  onSave: () => void;
}

const DEFAULT_SECTIONS: DocSection[] = [
  { id: "cover", title: "Cover Page", content: "", order: 0 },
  { id: "executive-summary", title: "Executive Summary", content: "", order: 1 },
  { id: "about-prolx", title: "About Prolx Digital Agency", content: "<p>Prolx Digital Agency is a leading software house specializing in web development, mobile applications, UI/UX design, and digital transformation. Our team of 30+ professionals has delivered 200+ successful projects across 15+ countries.</p>", order: 2 },
  { id: "client-requirements", title: "Client Requirements", content: "<p>Based on our consultation and project brief, the following key requirements have been identified:</p><ul><li>Requirement 1</li><li>Requirement 2</li><li>Requirement 3</li></ul>", order: 3 },
  { id: "proposed-solution", title: "Proposed Solution", content: "<p>We propose a comprehensive digital solution built with modern, scalable technologies designed to meet your business objectives.</p>", order: 4 },
  { id: "scope-of-work", title: "Scope of Work", content: "<p>This project includes the following deliverables and activities:</p>", order: 5 },
  { id: "deliverables", title: "Deliverables", content: "<p>Upon project completion, you will receive:</p><ul><li>Fully functional web application</li><li>Source code & documentation</li><li>Training & handover</li></ul>", order: 6 },
  { id: "project-timeline", title: "Project Timeline", content: "<p>Estimated project duration and milestone breakdown:</p>", order: 7 },
  { id: "technologies", title: "Technologies Used", content: "<p>Our recommended technology stack for this project:</p>", order: 8 },
  { id: "team", title: "Our Team", content: "<p>Your dedicated project team at Prolx Digital Agency:</p>", order: 9 },
  { id: "pricing", title: "Investment & Pricing", content: "", order: 10 },
  { id: "payment-terms", title: "Payment Terms", content: "<ul><li><strong>30%</strong> advance payment upon project initiation</li><li><strong>40%</strong> upon design approval and development milestone</li><li><strong>30%</strong> upon project completion and final delivery</li></ul>", order: 11 },
  { id: "maintenance", title: "Maintenance & Support", content: "<p>Post-launch support and maintenance plan:</p>", order: 12 },
  { id: "terms", title: "Terms & Conditions", content: "<ol><li>This proposal is valid for <strong>30 days</strong> from the date of issue.</li><li>All source code and deliverables become client property upon full payment.</li><li>Up to 3 revision rounds are included per design phase.</li><li>Client-caused delays may affect project timeline proportionally.</li><li>Both parties agree to maintain strict confidentiality.</li><li>This agreement is governed by the laws of Pakistan.</li></ol>", order: 13 },
  { id: "signature", title: "Acceptance & Signature", content: "<p>By signing below, you confirm your acceptance of this proposal and authorize Prolx Digital Agency to proceed with the project.</p>", order: 14 },
];

const AI_PROMPTS = [
  { label: "Generate Executive Summary", target: "executive-summary" },
  { label: "Suggest Scope of Work", target: "scope-of-work" },
  { label: "Write Payment Terms", target: "payment-terms" },
  { label: "Create T&C", target: "terms" },
];

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
      {/* Live Preview of Cover */}
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #0A0F1E 0%, #0D1B3E 40%, #091225 70%, #060C1A 100%)",
          minHeight: 520,
        }}
      >
        {/* Top accent bar */}
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #0D9488, #6366F1, #EC4899)" }} />

        <div className="px-12 py-14 flex flex-col gap-8" style={{ minHeight: 500 }}>
          {/* Logo area */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0D9488, #0f766e)" }}>
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg tracking-wide" style={{ fontFamily: "Georgia, serif" }}>PROLX</div>
              <div className="text-[#94A3B8] text-xs tracking-widest uppercase">Digital Agency</div>
            </div>
          </div>

          {/* Document type badge */}
          <div className="flex">
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest" style={{ background: "rgba(13,148,136,0.2)", border: "1px solid rgba(13,148,136,0.4)", color: "#5EEAD4" }}>
              Business Proposal
            </span>
          </div>

          {/* Title */}
          <div className="flex-1">
            <input
              className="text-4xl font-bold text-white bg-transparent border-none outline-none w-full leading-tight"
              style={{ fontFamily: "Georgia, serif", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              placeholder="Proposal Title…"
            />
            <div className="mt-3 h-1 w-24 rounded-full" style={{ background: "linear-gradient(90deg, #0D9488, transparent)" }} />
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <User size={11} className="text-[#5EEAD4]" />
                <span className="text-xs uppercase tracking-widest text-[#5EEAD4] font-semibold">Prepared For</span>
              </div>
              <div className="text-white font-semibold text-sm">{clientName || "—"}</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Hash size={11} className="text-[#5EEAD4]" />
                <span className="text-xs uppercase tracking-widest text-[#5EEAD4] font-semibold">Reference</span>
              </div>
              <div className="text-white font-mono text-sm">{doc.id}</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar size={11} className="text-[#5EEAD4]" />
                <span className="text-xs uppercase tracking-widest text-[#5EEAD4] font-semibold">Valid Until</span>
              </div>
              <div className="text-white font-semibold text-sm">
                {validUntil ? new Date(validUntil).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-12 py-4 flex items-center justify-between border-t border-white/10" style={{ background: "rgba(0,0,0,0.3)" }}>
          <span className="text-[#94A3B8] text-xs">www.prolx.com</span>
          <span className="text-[#94A3B8] text-xs">info@prolx.com</span>
          <span className="text-[#94A3B8] text-xs">Confidential</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2 text-xs text-blue-700">
        <FileText size={14} className="shrink-0 mt-0.5" />
        <span>Cover page auto-fills from your document settings (Title, Client, Valid Until, Document ID). Edit the title inline above or update settings in the right panel.</span>
      </div>
    </div>
  );
}

// ─── Full Rich Text Editor ─────────────────────────────────────
function RichTextEditor({ value, onChange, placeholder, minHeight = 200 }: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isUserEdit = useRef(false);

  useEffect(() => {
    if (!isUserEdit.current && ref.current) {
      const current = ref.current.innerHTML;
      if (current !== value) {
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

  const isActive = (cmd: string) => {
    try { return document.queryCommandState(cmd); } catch { return false; }
  };

  const ToolBtn = ({ cmd, icon: Icon, title: t, val }: { cmd: string; icon: React.ElementType; title: string; val?: string }) => (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); exec(cmd, val); }}
      title={t}
      className={`p-1.5 rounded-md transition-colors ${isActive(cmd) ? "bg-[#0D9488] text-white" : "text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A]"}`}
    >
      <Icon size={13} />
    </button>
  );

  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0D9488]/30 focus-within:border-[#0D9488]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        {/* Block format */}
        <div className="flex items-center gap-0.5">
          <button type="button" onMouseDown={e => { e.preventDefault(); execBlock("p"); }} title="Paragraph" className="px-2 py-1 text-xs rounded hover:bg-[#E2E8F0] text-[#64748B] font-medium">¶</button>
          <button type="button" onMouseDown={e => { e.preventDefault(); execBlock("h1"); }} title="Heading 1" className="p-1.5 rounded hover:bg-[#E2E8F0] text-[#64748B]"><Heading1 size={13} /></button>
          <button type="button" onMouseDown={e => { e.preventDefault(); execBlock("h2"); }} title="Heading 2" className="p-1.5 rounded hover:bg-[#E2E8F0] text-[#64748B]"><Heading2 size={13} /></button>
        </div>

        <div className="w-px h-4 bg-[#E2E8F0] mx-1" />

        {/* Inline styles */}
        <div className="flex items-center gap-0.5">
          <ToolBtn cmd="bold" icon={Bold} title="Bold (Ctrl+B)" />
          <ToolBtn cmd="italic" icon={Italic} title="Italic (Ctrl+I)" />
          <ToolBtn cmd="underline" icon={Underline} title="Underline (Ctrl+U)" />
        </div>

        <div className="w-px h-4 bg-[#E2E8F0] mx-1" />

        {/* Alignment */}
        <div className="flex items-center gap-0.5">
          <ToolBtn cmd="justifyLeft" icon={AlignLeft} title="Align Left" />
          <ToolBtn cmd="justifyCenter" icon={AlignCenter} title="Center" />
          <ToolBtn cmd="justifyRight" icon={AlignRight} title="Align Right" />
          <ToolBtn cmd="justifyFull" icon={AlignJustify} title="Justify" />
        </div>

        <div className="w-px h-4 bg-[#E2E8F0] mx-1" />

        {/* Lists */}
        <div className="flex items-center gap-0.5">
          <ToolBtn cmd="insertUnorderedList" icon={List} title="Bullet List" />
          <ToolBtn cmd="insertOrderedList" icon={ListOrdered} title="Numbered List" />
        </div>

        <div className="w-px h-4 bg-[#E2E8F0] mx-1" />

        {/* Indent */}
        <div className="flex items-center gap-0.5">
          <ToolBtn cmd="outdent" icon={Outdent} title="Decrease Indent" />
          <ToolBtn cmd="indent" icon={Indent} title="Increase Indent" />
        </div>

        <div className="w-px h-4 bg-[#E2E8F0] mx-1" />

        {/* Divider */}
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); exec("insertHorizontalRule"); }}
          title="Insert Divider"
          className="p-1.5 rounded hover:bg-[#E2E8F0] text-[#64748B]"
        >
          <Minus size={13} />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="px-4 py-3 text-sm text-[#0F172A] focus:outline-none prose prose-sm max-w-none"
        style={{ minHeight, lineHeight: 1.75, fontFamily: "Inter, sans-serif" }}
        onInput={handleInput}
        data-placeholder={placeholder || "Write content here…"}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94A3B8;
          pointer-events: none;
        }
        [contenteditable] h1 { font-size: 1.5em; font-weight: 700; margin: 0.5em 0; line-height: 1.3; }
        [contenteditable] h2 { font-size: 1.2em; font-weight: 600; margin: 0.4em 0; line-height: 1.35; }
        [contenteditable] p { margin: 0.4em 0; }
        [contenteditable] ul { list-style: disc; padding-left: 1.4em; margin: 0.4em 0; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.4em; margin: 0.4em 0; }
        [contenteditable] li { margin: 0.25em 0; }
        [contenteditable] hr { border: none; border-top: 2px solid #E2E8F0; margin: 0.75em 0; }
        [contenteditable] strong { font-weight: 700; }
        [contenteditable] em { font-style: italic; }
        [contenteditable] u { text-decoration: underline; }
      `}</style>
    </div>
  );
}

// ─── Pricing Table ─────────────────────────────────────────────
function PricingSection({ lineItems, currency, taxRate, discount, onItemsChange, onTaxChange, onDiscountChange }: {
  lineItems: Partial<DocumentLineItem>[];
  currency: string;
  taxRate: number;
  discount: number;
  onItemsChange: (items: Partial<DocumentLineItem>[]) => void;
  onTaxChange: (v: number) => void;
  onDiscountChange: (v: number) => void;
}) {
  const subtotal = lineItems.reduce((s, i) => s + (Number(i.quantity || 1) * Number(i.unit_price || 0)), 0);
  const taxAmt = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmt - discount;

  const CATEGORIES = [
    { value: "development", label: "Development" },
    { value: "uiux", label: "UI/UX Design" },
    { value: "hosting", label: "Hosting" },
    { value: "domain", label: "Domain" },
    { value: "maintenance", label: "Maintenance" },
    { value: "support", label: "Support" },
    { value: "addon", label: "Add-on" },
    { value: "custom", label: "Custom" },
  ];

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const addRow = () => onItemsChange([...lineItems, { category: "development", description: "", quantity: 1, unit: "unit", unit_price: 0, is_optional: false, display_order: lineItems.length }]);
  const updateRow = (idx: number, field: string, val: unknown) => onItemsChange(lineItems.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  const removeRow = (idx: number) => onItemsChange(lineItems.filter((_, i) => i !== idx));

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "linear-gradient(90deg, #0D9488, #0f766e)" }}>
              <th className="text-left px-4 py-3 font-semibold text-white text-xs uppercase tracking-wide">Category</th>
              <th className="text-left px-4 py-3 font-semibold text-white text-xs uppercase tracking-wide">Description</th>
              <th className="text-center px-3 py-3 font-semibold text-white text-xs uppercase tracking-wide">Qty</th>
              <th className="text-right px-4 py-3 font-semibold text-white text-xs uppercase tracking-wide">Unit Price ({currency})</th>
              <th className="text-right px-4 py-3 font-semibold text-white text-xs uppercase tracking-wide">Total</th>
              <th className="px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {lineItems.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-[#94A3B8] text-sm italic">No items yet. Click "+ Add Line Item" below.</td></tr>
            )}
            {lineItems.map((item, idx) => (
              <tr key={idx} className={`border-b border-[#F1F5F9] ${idx % 2 === 0 ? "bg-white" : "bg-[#FAFBFF]"} hover:bg-[#F0FDFA] transition-colors`}>
                <td className="px-3 py-2.5">
                  <select className="w-full text-xs border border-[#E2E8F0] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#0D9488]" value={item.category || "development"} onChange={e => updateRow(idx, "category", e.target.value)}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  <input className="w-full text-xs border border-[#E2E8F0] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0D9488]" placeholder="Item description…" value={item.description || ""} onChange={e => updateRow(idx, "description", e.target.value)} />
                </td>
                <td className="px-2 py-2.5">
                  <input type="number" min="1" className="w-16 text-xs border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-[#0D9488]" value={item.quantity || 1} onChange={e => updateRow(idx, "quantity", Number(e.target.value))} />
                </td>
                <td className="px-2 py-2.5">
                  <input type="number" min="0" className="w-28 text-xs border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-right font-mono focus:outline-none focus:ring-1 focus:ring-[#0D9488]" value={item.unit_price || 0} onChange={e => updateRow(idx, "unit_price", Number(e.target.value))} />
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs font-bold text-[#0F172A]">
                  {fmt(Number(item.quantity || 1) * Number(item.unit_price || 0))}
                </td>
                <td className="px-2 py-2.5">
                  <button onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"><X size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={addRow} className="flex items-center gap-1.5 text-xs text-[#0D9488] hover:text-[#0f766e] font-semibold hover:underline">
        <Plus size={13} /> Add Line Item
      </button>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-80 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#64748B] mb-1 block font-medium">Tax Rate (%)</label>
              <input type="number" min="0" max="100" className="w-full text-sm border border-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30" value={taxRate} onChange={e => onTaxChange(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-[#64748B] mb-1 block font-medium">Discount ({currency})</label>
              <input type="number" min="0" className="w-full text-sm border border-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30" value={discount} onChange={e => onDiscountChange(Number(e.target.value))} />
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-[#CCFBF1]">
            <div className="bg-[#F0FDFA] px-4 py-3 space-y-2">
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
            <div className="flex justify-between items-center px-4 py-3 bg-[#0D9488]">
              <span className="text-white font-bold text-sm">Total</span>
              <span className="text-white font-mono font-bold text-lg">{currency} {fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Document Preview ──────────────────────────────────────────
function DocumentPreview({ doc, sections, title, clientName, currency, lineItems, taxRate, discount, validUntil, onClose }: {
  doc: BusinessDocumentWithRelations;
  sections: DocSection[];
  title: string;
  clientName: string;
  currency: string;
  lineItems: Partial<DocumentLineItem>[];
  taxRate: number;
  discount: number;
  validUntil: string;
  onClose: () => void;
}) {
  const subtotal = lineItems.reduce((s, i) => s + (Number(i.quantity || 1) * Number(i.unit_price || 0)), 0);
  const taxAmt = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmt - discount;
  const fmt = (n: number) => n.toLocaleString("en-US");
  const contentSections = sections.filter(s => s.id !== "cover" && s.id !== "pricing");
  const pricingSec = sections.find(s => s.id === "pricing");

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-end">
      <div className="w-full max-w-3xl h-screen bg-white overflow-y-auto shadow-2xl flex flex-col">
        {/* Preview Bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#E2E8F0] px-6 py-3 flex items-center justify-between">
          <span className="font-semibold text-[#0F172A] text-sm flex items-center gap-2">
            <Eye size={15} className="text-[#0D9488]" /> Document Preview
          </span>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F1F5F9] text-[#64748B]"><X size={16} /></button>
        </div>

        {/* Cover Page */}
        <div
          className="relative"
          style={{
            background: "linear-gradient(135deg, #0A0F1E 0%, #0D1B3E 40%, #091225 70%, #060C1A 100%)",
            minHeight: 420,
          }}
        >
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #0D9488, #6366F1, #EC4899)" }} />
          <div className="px-12 py-12 flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0D9488, #0f766e)" }}>
                <Building2 size={20} className="text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-lg tracking-wide" style={{ fontFamily: "Georgia, serif" }}>PROLX</div>
                <div className="text-[#94A3B8] text-xs tracking-widest uppercase">Digital Agency</div>
              </div>
            </div>
            <div className="flex">
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest" style={{ background: "rgba(13,148,136,0.2)", border: "1px solid rgba(13,148,136,0.4)", color: "#5EEAD4" }}>Business Proposal</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white leading-tight" style={{ fontFamily: "Georgia, serif" }}>{title}</h1>
              <div className="mt-3 h-1 w-24 rounded-full" style={{ background: "linear-gradient(90deg, #0D9488, transparent)" }} />
            </div>
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#5EEAD4] font-semibold mb-1">Prepared For</div>
                <div className="text-white font-semibold text-sm">{clientName || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-[#5EEAD4] font-semibold mb-1">Reference</div>
                <div className="text-white font-mono text-sm">{doc.id}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-[#5EEAD4] font-semibold mb-1">Valid Until</div>
                <div className="text-white font-semibold text-sm">{validUntil ? new Date(validUntil).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</div>
              </div>
            </div>
          </div>
          <div className="px-12 py-3 flex items-center justify-between border-t border-white/10" style={{ background: "rgba(0,0,0,0.3)" }}>
            <span className="text-[#94A3B8] text-xs">www.prolx.com</span>
            <span className="text-[#94A3B8] text-xs">info@prolx.com</span>
            <span className="text-[#94A3B8] text-xs">Confidential</span>
          </div>
        </div>

        {/* Content Sections */}
        <div className="px-12 py-8 space-y-10 flex-1">
          {contentSections.filter(s => s.id !== "signature").map((sec, i) => (
            <div key={sec.id}>
              {/* Section number + title */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-[#0D9488] font-mono text-sm font-bold shrink-0">0{i + 1}</span>
                <h2 className="text-xl font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-2 flex-1" style={{ fontFamily: "Georgia, serif" }}>
                  {sec.title}
                </h2>
              </div>
              <div
                className="text-[#374151] leading-relaxed prose prose-sm max-w-none"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "0.9rem", lineHeight: "1.85" }}
                dangerouslySetInnerHTML={{ __html: sec.content || "<p><em>No content added.</em></p>" }}
              />
            </div>
          ))}

          {/* Pricing */}
          {pricingSec && lineItems.length > 0 && (
            <div>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-[#0D9488] font-mono text-sm font-bold shrink-0">{String(contentSections.filter(s => s.id !== "signature").length + 1).padStart(2, "0")}</span>
                <h2 className="text-xl font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-2 flex-1" style={{ fontFamily: "Georgia, serif" }}>Investment & Pricing</h2>
              </div>
              <table className="w-full text-sm border-collapse rounded-xl overflow-hidden border border-[#E2E8F0]">
                <thead>
                  <tr style={{ background: "linear-gradient(90deg, #0D9488, #0f766e)" }}>
                    <th className="text-left px-4 py-3 text-white text-xs uppercase font-semibold tracking-wide">Description</th>
                    <th className="text-center px-3 py-3 text-white text-xs uppercase font-semibold tracking-wide">Qty</th>
                    <th className="text-right px-4 py-3 text-white text-xs uppercase font-semibold tracking-wide">Unit Price</th>
                    <th className="text-right px-4 py-3 text-white text-xs uppercase font-semibold tracking-wide">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.filter(i => i.description).map((item, idx) => (
                    <tr key={idx} className={`border-b border-[#F1F5F9] ${idx % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}`}>
                      <td className="px-4 py-3 text-[#0F172A]">{item.description}</td>
                      <td className="px-3 py-3 text-center text-[#64748B]">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-mono text-[#64748B]">{currency} {fmt(Number(item.unit_price))}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-[#0F172A]">{currency} {fmt(Number(item.quantity || 1) * Number(item.unit_price || 0))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#F0FDFA]">
                    <td colSpan={3} className="px-4 py-2.5 text-right text-sm font-medium text-[#475569]">Subtotal</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-[#0F172A]">{currency} {fmt(subtotal)}</td>
                  </tr>
                  {taxAmt > 0 && (
                    <tr className="bg-[#F0FDFA]">
                      <td colSpan={3} className="px-4 py-2.5 text-right text-sm font-medium text-[#475569]">Tax ({taxRate}%)</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-[#0F172A]">{currency} {fmt(taxAmt)}</td>
                    </tr>
                  )}
                  {discount > 0 && (
                    <tr className="bg-[#F0FDFA]">
                      <td colSpan={3} className="px-4 py-2.5 text-right text-sm font-medium text-red-500">Discount</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-red-500">- {currency} {fmt(discount)}</td>
                    </tr>
                  )}
                  <tr style={{ background: "linear-gradient(90deg, #0D9488, #0f766e)" }}>
                    <td colSpan={3} className="px-4 py-3 text-right text-white font-bold">Total Amount</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white text-base">{currency} {fmt(total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Signature section */}
          {sections.find(s => s.id === "signature") && (
            <div>
              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="text-xl font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-2 flex-1" style={{ fontFamily: "Georgia, serif" }}>Acceptance & Signature</h2>
              </div>
              <div className="text-[#374151] mb-6 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sections.find(s => s.id === "signature")?.content || "" }} />
              <div className="grid grid-cols-2 gap-8 mt-6">
                <div className="border-t-2 border-[#0D9488] pt-4">
                  <div className="h-12 mb-2" />
                  <div className="text-xs text-[#94A3B8] uppercase tracking-wide">Client Signature</div>
                  <div className="text-sm font-medium text-[#0F172A] mt-1">{clientName || "Client Name"}</div>
                  <div className="text-xs text-[#94A3B8] mt-0.5">Date: _______________</div>
                </div>
                <div className="border-t-2 border-[#0D9488] pt-4">
                  <div className="text-base font-bold text-[#0F172A] mb-2" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>Prolx Digital Agency</div>
                  <div className="text-xs text-[#94A3B8] uppercase tracking-wide">Authorized Signatory</div>
                  <div className="text-xs text-[#94A3B8] mt-0.5">Date: _______________</div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
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

// ─── Main Proposal Builder ─────────────────────────────────────
export default function ProposalBuilder({ doc, clients, onBack, onSave }: ProposalBuilderProps) {
  const [sections, setSections] = useState<DocSection[]>(
    doc.sections?.length > 0 ? [...doc.sections].sort((a, b) => a.order - b.order) : DEFAULT_SECTIONS
  );
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || "cover");
  const [lineItems, setLineItems] = useState<Partial<DocumentLineItem>[]>(doc.line_items || []);
  const [taxRate, setTaxRate] = useState(doc.tax_rate || 0);
  const [discount, setDiscount] = useState(doc.discount || 0);
  const [currency, setCurrency] = useState<DocCurrency>((doc.currency as DocCurrency) || "PKR");
  const [clientId, setClientId] = useState(doc.client_id || "");
  const [validUntil, setValidUntil] = useState(doc.valid_until || "");
  const [title, setTitle] = useState(doc.title);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showSignature, setShowSignature] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const clientName = clients.find(c => c.id === clientId)?.full_name || "";

  const triggerAutoSave = () => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => handleSave(false), 2500);
  };

  const updateSection = (id: string, content: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, content } : s));
    triggerAutoSave();
  };

  const updateLineItems = (items: Partial<DocumentLineItem>[]) => {
    setLineItems(items);
    triggerAutoSave();
  };

  const updateTaxRate = (rate: number) => {
    setTaxRate(rate);
    triggerAutoSave();
  };

  const updateDiscount = (amt: number) => {
    setDiscount(amt);
    triggerAutoSave();
  };

  const addSection = () => {
    const newSec: DocSection = { id: `section-${Date.now()}`, title: "New Section", content: "", order: sections.length };
    setSections(prev => [...prev, newSec]);
    setActiveSection(newSec.id);
  };

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
    if (activeSection === id) setActiveSection(sections[0]?.id || "");
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    const idx = sections.findIndex(s => s.id === id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === sections.length - 1) return;
    const newSecs = [...sections];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newSecs[idx], newSecs[swapIdx]] = [newSecs[swapIdx], newSecs[idx]];
    setSections(newSecs.map((s, i) => ({ ...s, order: i })));
  };

  const handleSave = async (showFeedback = true) => {
    if (saving) return;
    setSaving(true);
    setSaveStatus("saving");
    const items = lineItems.filter(i => i.description) as DocumentLineItem[];
    await updateDocument(doc.id, {
      title,
      sections,
      client_id: clientId || undefined,
      valid_until: validUntil || undefined,
      currency,
      tax_rate: taxRate,
      discount,
      line_items: items,
      change_notes: "Manual save",
    });
    setSaving(false);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 3000);
    if (showFeedback) onSave();
  };

  const handleAIAssist = async (sectionId: string) => {
    setAiLoading(sectionId);
    await new Promise(r => setTimeout(r, 1200));
    const suggestions: Record<string, string> = {
      "executive-summary": `<p>We are pleased to present this proposal for <strong>${title}</strong>. Prolx Digital Agency brings extensive expertise in delivering cutting-edge digital solutions tailored to your unique business requirements. Our proven track record of 200+ successful projects positions us as the ideal technology partner for this initiative.</p><p>This document outlines our comprehensive approach, technical methodology, detailed scope of work, project timeline, and investment structure.</p>`,
      "scope-of-work": `<h2>Phase 1 – Discovery & Planning (Week 1–2)</h2><ul><li>Requirements analysis and stakeholder interviews</li><li>Technical architecture design</li><li>UI/UX wireframing and prototyping</li></ul><h2>Phase 2 – Design & Development (Week 3–10)</h2><ul><li>UI/UX design implementation</li><li>Frontend and backend development</li><li>Database design and optimization</li><li>API integration and testing</li></ul><h2>Phase 3 – Testing & Deployment (Week 11–12)</h2><ul><li>Quality assurance and bug fixes</li><li>Performance optimization</li><li>Production deployment and client training</li></ul>`,
      "payment-terms": `<ul><li><strong>30%</strong> — Due upon project initiation and contract signing</li><li><strong>40%</strong> — Due upon design approval and development milestone completion</li><li><strong>30%</strong> — Due upon project completion and final delivery</li></ul><p>All payments to be made within <strong>5 business days</strong> of invoice receipt.</p>`,
      "terms": `<ol><li><strong>Validity:</strong> This proposal is valid for 30 days from the date of issue.</li><li><strong>Intellectual Property:</strong> All source code and deliverables become client property upon full payment.</li><li><strong>Revisions:</strong> Up to 3 revision rounds included per design phase.</li><li><strong>Delays:</strong> Client-caused delays may affect project timeline proportionally.</li><li><strong>Confidentiality:</strong> Both parties agree to maintain strict confidentiality.</li><li><strong>Governing Law:</strong> This agreement is governed by the laws of Pakistan.</li></ol>`,
    };
    const content = suggestions[sectionId] || `<p>This section covers <strong>${sections.find(s => s.id === sectionId)?.title?.toLowerCase() || "the selected topic"}</strong> in detail, outlining key aspects relevant to your project.</p>`;
    updateSection(sectionId, content);
    setAiLoading(null);
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
          <input
            className="font-bold text-[#0F172A] bg-transparent border-none outline-none text-sm min-w-[200px] max-w-[400px]"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Proposal title…"
          />
          <span className="text-xs text-[#94A3B8] font-mono bg-[#F1F5F9] px-2 py-0.5 rounded-md">{doc.id}</span>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle size={12} /> Saved
            </span>
          )}
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
              <Clock size={12} className="animate-spin" /> Saving…
            </span>
          )}
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
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] text-[#64748B]"
          >
            <Eye size={14} /> Preview
          </button>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-white text-sm rounded-lg disabled:opacity-50 font-semibold"
            style={{ background: "linear-gradient(135deg, #0D9488, #0f766e)" }}
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar — Sections */}
        <div className="w-60 bg-white border-r border-[#E2E8F0] flex flex-col overflow-hidden flex-shrink-0">
          <div className="px-3 py-2.5 border-b border-[#F1F5F9] flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest">Sections</span>
            <button onClick={addSection} className="text-[#0D9488] hover:text-[#0f766e] p-1 rounded hover:bg-[#F0FDFA]" title="Add section">
              <Plus size={14} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-1.5">
            {sections.map((sec) => (
              <div
                key={sec.id}
                className={`group flex items-center gap-1.5 mx-2 mb-0.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all text-xs ${
                  activeSection === sec.id
                    ? "bg-[#F0FDFA] text-[#0D9488] font-semibold shadow-sm border border-[#CCFBF1]"
                    : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                }`}
                onClick={() => setActiveSection(sec.id)}
              >
                <GripVertical size={11} className="text-[#CBD5E1] shrink-0" />
                <span className="flex-1 truncate">{sec.title}</span>
                <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                  <button onClick={e => { e.stopPropagation(); moveSection(sec.id, "up"); }} className="p-0.5 hover:text-[#0D9488] rounded">
                    <ChevronUp size={9} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); moveSection(sec.id, "down"); }} className="p-0.5 hover:text-[#0D9488] rounded">
                    <ChevronDown size={9} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); removeSection(sec.id); }} className="p-0.5 hover:text-red-500 rounded">
                    <Trash2 size={9} />
                  </button>
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Main Editor */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSec && (
            <div className="max-w-3xl mx-auto space-y-5">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <input
                    className="text-2xl font-bold text-[#0F172A] bg-transparent border-none outline-none w-full"
                    style={{ fontFamily: "'Bricolage Grotesque', Georgia, serif" }}
                    value={activeSec.title}
                    onChange={e => setSections(prev => prev.map(s => s.id === activeSec.id ? { ...s, title: e.target.value } : s))}
                    disabled={activeSec.id === "cover"}
                  />
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Section {sections.findIndex(s => s.id === activeSec.id) + 1} of {sections.length}
                  </p>
                </div>
                {activeSec.id !== "cover" && activeSec.id !== "pricing" && activeSec.id !== "signature" && (
                  <button
                    onClick={() => handleAIAssist(activeSec.id)}
                    disabled={aiLoading !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs rounded-lg hover:opacity-90 disabled:opacity-50 font-semibold"
                    style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)" }}
                  >
                    {aiLoading === activeSec.id ? <RefreshCw size={11} className="animate-spin" /> : <Sparkles size={11} />}
                    AI Assist
                  </button>
                )}
              </div>

              {/* Section Content */}
              {activeSec.id === "cover" ? (
                <CoverPageEditor
                  doc={doc}
                  title={title}
                  clientName={clientName}
                  validUntil={validUntil}
                  onTitleChange={setTitle}
                />
              ) : activeSec.id === "pricing" ? (
                <PricingSection
                  lineItems={lineItems}
                  currency={currency}
                  taxRate={taxRate}
                  discount={discount}
                  onItemsChange={updateLineItems}
                  onTaxChange={updateTaxRate}
                  onDiscountChange={updateDiscount}
                />
              ) : activeSec.id === "signature" ? (
                <div className="space-y-5">
                  <RichTextEditor
                    value={activeSec.content}
                    onChange={v => updateSection(activeSec.id, v)}
                    placeholder="Add acceptance terms or instructions…"
                    minHeight={120}
                  />
                  <div className="grid grid-cols-2 gap-5">
                    <div className="bg-[#F8FAFC] rounded-xl p-4 text-center border-2 border-dashed border-[#E2E8F0]">
                      <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-widest mb-3">Client Signature</p>
                      {showSignature ? (
                        <SignaturePad
                          onSave={(data) => {
                            updateSection(activeSec.id, `${activeSec.content}<p>[Client signed digitally]</p>`);
                            setShowSignature(false);
                          }}
                          onCancel={() => setShowSignature(false)}
                          compact
                        />
                      ) : (
                        <button onClick={() => setShowSignature(true)} className="text-xs text-[#0D9488] hover:underline font-semibold">
                          Click to draw signature
                        </button>
                      )}
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-4 text-center border-2 border-dashed border-[#E2E8F0]">
                      <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-widest mb-3">Prolx Authorized</p>
                      <div className="text-sm font-bold text-[#0F172A] mt-4" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                        Prolx Digital Agency
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <RichTextEditor
                  value={activeSec.content}
                  onChange={v => updateSection(activeSec.id, v)}
                  placeholder={`Write ${activeSec.title} content here…`}
                  minHeight={220}
                />
              )}
            </div>
          )}
        </div>

        {/* Right Panel — Settings */}
        <div className="w-64 bg-white border-l border-[#E2E8F0] flex flex-col overflow-y-auto flex-shrink-0 p-4 space-y-5">
          <div>
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3">Document Settings</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#64748B] mb-1 block font-medium">Client</label>
                <select className="w-full text-xs border border-[#E2E8F0] rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30" value={clientId} onChange={e => setClientId(e.target.value)}>
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
                <select className="w-full text-xs border border-[#E2E8F0] rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30" value={currency} onChange={e => setCurrency(e.target.value as DocCurrency)}>
                  <option value="PKR">PKR — Pakistani Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="AED">AED — UAE Dirham</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#64748B] mb-1 block font-medium">Valid Until</label>
                <input type="date" className="w-full text-xs border border-[#E2E8F0] rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Summary card */}
          <div className="rounded-xl overflow-hidden border border-[#CCFBF1]">
            <div className="px-3 py-2 flex items-center gap-2" style={{ background: "linear-gradient(90deg, #0D9488, #0f766e)" }}>
              <FileText size={12} className="text-white" />
              <p className="text-xs font-bold text-white uppercase tracking-widest">Summary</p>
            </div>
            <div className="bg-[#F0FDFA] px-3 py-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Sections</span>
                <span className="font-bold text-[#0F172A]">{sections.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Line Items</span>
                <span className="font-bold text-[#0F172A]">{lineItems.filter(i => i.description).length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Total Value</span>
                <span className="font-bold text-[#0D9488] font-mono">
                  {currency} {lineItems.reduce((s, i) => s + (Number(i.quantity || 1) * Number(i.unit_price || 0)), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* AI Quick Fill */}
          <div>
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">AI Quick Fill</p>
            <div className="space-y-1.5">
              {AI_PROMPTS.map(p => (
                <button
                  key={p.target}
                  onClick={() => { setActiveSection(p.target); handleAIAssist(p.target); }}
                  disabled={aiLoading !== null}
                  className="w-full text-left text-xs px-2.5 py-2 rounded-lg border border-[#E2E8F0] hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-colors text-[#64748B] flex items-center gap-1.5 disabled:opacity-50"
                >
                  {aiLoading === p.target ? <RefreshCw size={10} className="text-purple-400 shrink-0 animate-spin" /> : <Sparkles size={10} className="text-purple-400 shrink-0" />}
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <DocumentPreview
          doc={doc}
          sections={sections}
          title={title}
          clientName={clientName}
          currency={currency}
          lineItems={lineItems}
          taxRate={taxRate}
          discount={discount}
          validUntil={validUntil}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
