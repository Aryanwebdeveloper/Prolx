"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText, Plus, Search, Eye, Trash2, Copy, Send, Download,
  RefreshCw, Filter, X, TrendingUp, DollarSign, CheckCircle,
  Clock, AlertCircle, XCircle, Archive, FileEdit, BarChart3,
  Layers, ChevronDown, Star, MoreVertical, Link as LinkIcon,
  Lock, History, MessageSquare, Pen, UserPlus, Building2, ChevronRight,
  User
} from "lucide-react";
import {
  getDocuments, getDocumentStats, deleteDocument, duplicateDocument,
  updateDocument, getTemplates, getDocumentById, getClients, createClientRecord
} from "@/app/business-docs-actions";
import type {
  BusinessDocumentWithRelations, BusinessDocStats, BusinessDocType,
  BusinessDocStatus, DocumentTemplate
} from "@/types/erp";
import { DOC_TYPE_LABELS, DOC_STATUS_CONFIG } from "@/types/erp";
import ProposalBuilder from "./proposal-builder";
import QuotationBuilder from "./quotation-builder";
import DocumentAnalyticsPanel from "./document-analytics-panel";

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon: Icon, onClick }: {
  label: string; value: string | number; sub?: string;
  color: string; icon: React.ElementType; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#E2E8F0] p-5 flex items-center gap-4 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-[#0F172A] font-mono">{value}</div>
        <div className="text-xs text-[#64748B]">{label}</div>
        {sub && <div className="text-xs text-[#0D9488] font-medium">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: BusinessDocStatus }) {
  const cfg = DOC_STATUS_CONFIG[status] || DOC_STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ─── New Document Modal ───────────────────────────────────────
const DOC_TYPES: { type: BusinessDocType; label: string; desc: string; icon: string }[] = [
  { type: "proposal", label: "Business Proposal", desc: "Full proposal with cover, scope, pricing & signature", icon: "📄" },
  { type: "quotation", label: "Quotation", desc: "Itemized cost estimate with tax & payment terms", icon: "💰" },
  { type: "srs", label: "SRS Document", desc: "IEEE-standard software requirements specification", icon: "📐" },
  { type: "brd", label: "Business Requirements (BRD)", desc: "Business requirements and objectives document", icon: "📋" },
  { type: "contract", label: "Contract", desc: "Legal contract with digital signature support", icon: "✍️" },
  { type: "nda", label: "NDA Agreement", desc: "Non-disclosure agreement template", icon: "🔒" },
  { type: "scope_doc", label: "Scope of Work", desc: "Detailed project scope and deliverables", icon: "🎯" },
  { type: "meeting_minutes", label: "Meeting Minutes", desc: "Meeting agenda, notes and action items", icon: "📝" },
  { type: "purchase_order", label: "Purchase Order", desc: "Official purchase order with approval workflow", icon: "🛒" },
  { type: "service_agreement", label: "Service Agreement", desc: "Ongoing service level agreement", icon: "🤝" },
  { type: "project_plan", label: "Project Plan", desc: "Project roadmap with milestones and timeline", icon: "🗓️" },
  { type: "custom", label: "Custom Document", desc: "Start from scratch with a blank document", icon: "✏️" },
];

// ─── Client Picker (Proposela-style) ──────────────────────────
function ClientPicker({
  clients, selectedId, onSelect, onClientCreated,
}: {
  clients: { id: string; full_name: string; email: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClientCreated: (client: { id: string; full_name: string; email: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const selected = clients.find(c => c.id === selectedId);
  const filtered = clients.filter(c =>
    !search ||
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name: string) =>
    name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      const { createClientRecord } = await import("@/app/business-docs-actions");
      const res = await createClientRecord({
        full_name: newName.trim(),
        email: newEmail.trim() || undefined,
        company: newCompany.trim() || undefined,
      });
      if (res.error) {
        setCreateError(res.error.message || "Failed to create client");
      } else if (res.data) {
        const newClient = { id: res.data.id, full_name: res.data.full_name, email: res.data.email };
        onClientCreated(newClient);
        onSelect(newClient.id);
        setShowAdd(false);
        setOpen(false);
        setNewName(""); setNewEmail(""); setNewCompany("");
      }
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : "Error creating client");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => { setOpen(v => !v); setShowAdd(false); setSearch(""); }}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { setOpen(v => !v); setShowAdd(false); setSearch(""); } }}
        className="w-full flex items-center gap-3 px-3 py-2.5 border border-[#E2E8F0] rounded-xl bg-white hover:border-[#0D9488] transition-colors group cursor-pointer"
      >
        {selected ? (
          <>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: "linear-gradient(135deg,#0D9488,#0f766e)" }}>
              {initials(selected.full_name)}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-semibold text-[#0F172A] truncate">{selected.full_name}</div>
              <div className="text-[11px] text-[#94A3B8] truncate">{selected.email}</div>
            </div>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onSelect(""); }}
              className="p-0.5 rounded hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0F172A]"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#F1F5F9] shrink-0">
              <User size={13} className="text-[#94A3B8]" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm text-[#94A3B8]">No client assigned</div>
            </div>
            <ChevronRight size={14} className="text-[#CBD5E1] group-hover:text-[#0D9488] transition-colors" />
          </>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1.5 z-20 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
            {!showAdd ? (
              <>
                {/* Search */}
                <div className="p-2 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2 bg-[#F8FAFC] rounded-lg px-2.5 py-1.5">
                    <Search size={12} className="text-[#94A3B8] shrink-0" />
                    <input
                      autoFocus
                      className="flex-1 text-xs bg-transparent outline-none placeholder-[#94A3B8]"
                      placeholder="Search clients…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                      <button onClick={() => setSearch("")} className="text-[#94A3B8] hover:text-[#0F172A]">
                        <X size={11} />
                      </button>
                    )}
                  </div>
                </div>

                {/* No client option */}
                <button
                  type="button"
                  onClick={() => { onSelect(""); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-[#F8FAFC] transition-colors ${
                    !selectedId ? "bg-[#F0FDFA] text-[#0D9488]" : "text-[#64748B]"
                  }`}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#F1F5F9]">
                    <User size={12} className="text-[#94A3B8]" />
                  </div>
                  <span className="font-medium">No client assigned</span>
                  {!selectedId && <CheckCircle size={13} className="ml-auto text-[#0D9488]" />}
                </button>

                {/* Client list */}
                <div className="max-h-48 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-[#94A3B8]">
                      {search ? `No clients matching "${search}"` : "No clients yet"}
                    </div>
                  ) : (
                    filtered.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { onSelect(c.id); setOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#F8FAFC] transition-colors ${
                          selectedId === c.id ? "bg-[#F0FDFA]" : ""
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ background: "linear-gradient(135deg,#0D9488,#0f766e)" }}>
                          {initials(c.full_name)}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="text-sm font-medium text-[#0F172A] truncate">{c.full_name}</div>
                          <div className="text-[11px] text-[#94A3B8] truncate">{c.email}</div>
                        </div>
                        {selectedId === c.id && <CheckCircle size={13} className="text-[#0D9488] shrink-0" />}
                      </button>
                    ))
                  )}
                </div>

                {/* Add new client */}
                <div className="border-t border-[#F1F5F9] p-2">
                  <button
                    type="button"
                    onClick={() => setShowAdd(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#0D9488] hover:bg-[#F0FDFA] rounded-xl transition-colors"
                  >
                    <UserPlus size={13} />
                    Add New Client
                  </button>
                </div>
              </>
            ) : (
              /* Add Client Form */
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <UserPlus size={14} className="text-[#0D9488]" /> New Client
                  </span>
                  <button onClick={() => setShowAdd(false)} className="text-[#94A3B8] hover:text-[#0F172A]">
                    <X size={14} />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wide block mb-1">Client Name *</label>
                  <input
                    autoFocus
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                    placeholder="e.g. Ahmad Enterprises"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCreate()}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wide block mb-1">Email</label>
                    <input
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                      placeholder="client@email.com"
                      type="email"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wide block mb-1">Company</label>
                    <input
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                      placeholder="Company name"
                      value={newCompany}
                      onChange={e => setNewCompany(e.target.value)}
                    />
                  </div>
                </div>

                {createError && (
                  <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{createError}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="flex-1 py-2 text-sm border border-[#E2E8F0] rounded-xl text-[#64748B] hover:bg-[#F8FAFC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={!newName.trim() || creating}
                    className="flex-1 py-2 text-sm bg-[#0D9488] text-white rounded-xl hover:bg-[#0f766e] disabled:opacity-50 flex items-center justify-center gap-1.5 font-semibold"
                  >
                    {creating ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
                    {creating ? "Creating…" : "Create Client"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function NewDocModal({ clients: initialClients, templates, onClose, onCreate }: {
  clients: { id: string; full_name: string; email: string }[];
  templates: DocumentTemplate[];
  onClose: () => void;
  onCreate: (type: BusinessDocType, title: string, clientId: string, templateId?: string) => void;
}) {
  const [step, setStep] = useState<"type" | "details">("type");
  const [selectedType, setSelectedType] = useState<BusinessDocType | null>(null);
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [clients, setClients] = useState(initialClients);

  const typeTemplates = templates.filter(t => t.type === selectedType);

  const handleCreate = () => {
    if (!selectedType || !title.trim()) return;
    onCreate(selectedType, title.trim(), clientId, selectedTemplate || undefined);
    onClose();
  };

  const selectedClient = clients.find(c => c.id === clientId);
  const initials = (name: string) =>
    name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              {step === "type" ? "Choose Document Type" : `New ${DOC_TYPE_LABELS[selectedType!]}`}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              {step === "type" ? "Select the type of document you want to create" : "Fill in the details to get started"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === "type" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {DOC_TYPES.map(dt => (
                <button
                  key={dt.type}
                  onClick={() => { setSelectedType(dt.type); setStep("details"); setTitle(dt.label); }}
                  className="flex items-start gap-3 p-4 rounded-2xl border-2 border-[#E2E8F0] hover:border-[#0D9488] hover:bg-[#F0FDFA] transition-all text-left group"
                >
                  <span className="text-2xl mt-0.5">{dt.icon}</span>
                  <div>
                    <div className="font-semibold text-[#0F172A] text-sm group-hover:text-[#0D9488] transition-colors">{dt.label}</div>
                    <div className="text-xs text-[#94A3B8] mt-0.5 leading-snug">{dt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="max-w-lg mx-auto space-y-5">
              <button
                onClick={() => setStep("type")}
                className="text-xs text-[#0D9488] hover:underline flex items-center gap-1"
              >
                ← Change type
              </button>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1.5">Document Title *</label>
                <input
                  className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. E-Commerce Platform Proposal for Acme Corp"
                  autoFocus
                />
              </div>

              {/* Client Picker */}
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1.5">
                  Client <span className="font-normal normal-case text-[#94A3B8]">(optional)</span>
                </label>
                <ClientPicker
                  clients={clients}
                  selectedId={clientId}
                  onSelect={setClientId}
                  onClientCreated={c => setClients(prev => [...prev, c])}
                />
                {selectedClient && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-[#0D9488] bg-[#F0FDFA] rounded-lg px-3 py-1.5">
                    <CheckCircle size={11} />
                    <span>Document will be prepared for <strong>{selectedClient.full_name}</strong></span>
                  </div>
                )}
              </div>

              {/* Template */}
              {typeTemplates.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1.5">Start from Template</label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTemplate("")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        !selectedTemplate
                          ? "border-[#0D9488] bg-[#F0FDFA]"
                          : "border-[#E2E8F0] hover:border-[#0D9488]/40"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F1F5F9]">
                        <FileText size={14} className="text-[#64748B]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#0F172A]">Blank document</div>
                        <div className="text-[11px] text-[#94A3B8]">Start fresh from scratch</div>
                      </div>
                      {!selectedTemplate && <CheckCircle size={14} className="ml-auto text-[#0D9488]" />}
                    </button>
                    {typeTemplates.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                          selectedTemplate === t.id
                            ? "border-[#0D9488] bg-[#F0FDFA]"
                            : "border-[#E2E8F0] hover:border-[#0D9488]/40"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0D9488,#0f766e)" }}>
                          <FileText size={14} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-[#0F172A]">{t.name}</div>
                          {t.description && <div className="text-[11px] text-[#94A3B8]">{t.description}</div>}
                          {t.is_default && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">Default</span>}
                        </div>
                        {selectedTemplate === t.id && <CheckCircle size={14} className="text-[#0D9488]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {step === "details" && (
          <div className="p-5 border-t border-[#E2E8F0] flex items-center justify-between">
            <div className="text-xs text-[#94A3B8]">
              {selectedClient ? (
                <span className="flex items-center gap-1.5 text-[#0D9488]">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: "linear-gradient(135deg,#0D9488,#0f766e)" }}>
                    {initials(selectedClient.full_name)}
                  </div>
                  {selectedClient.full_name}
                </span>
              ) : (
                <span className="text-[#CBD5E1]">No client selected</span>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm text-[#64748B] border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC]">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim()}
                className="px-5 py-2 text-sm text-white rounded-xl hover:bg-[#0f766e] disabled:opacity-50 flex items-center gap-2 font-semibold"
                style={{ background: "linear-gradient(135deg,#0D9488,#0f766e)" }}
              >
                <Plus size={15} /> Create Document
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Document Row ─────────────────────────────────────────────
function DocRow({ doc, onView, onEdit, onDuplicate, onDelete, onSend, onShare, deleting }: {
  doc: BusinessDocumentWithRelations;
  onView: (d: BusinessDocumentWithRelations) => void;
  onEdit: (d: BusinessDocumentWithRelations) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onSend: (d: BusinessDocumentWithRelations) => void;
  onShare: (d: BusinessDocumentWithRelations) => void;
  deleting: string | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const typeLabel = DOC_TYPE_LABELS[doc.type] || doc.type;
  const currency = doc.currency || "PKR";

  return (
    <tr className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors group">
      <td className="px-4 py-3">
        <div className="font-mono text-xs font-bold text-[#0D9488]">{doc.id}</div>
        <div className="text-[10px] text-[#94A3B8] mt-0.5">{typeLabel}</div>
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-[#0F172A] text-sm max-w-[200px] truncate">{doc.title}</div>
        {doc.client && (
          <div className="text-xs text-[#94A3B8] truncate">{doc.client.full_name}</div>
        )}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={doc.status} />
      </td>
      <td className="px-4 py-3 font-mono text-sm font-semibold text-[#0F172A]">
        {doc.total > 0 ? `${currency} ${Number(doc.total).toLocaleString()}` : "—"}
      </td>
      <td className="px-4 py-3 text-xs text-[#64748B]">
        {doc.valid_until || "—"}
      </td>
      <td className="px-4 py-3 text-xs text-[#64748B]">
        {new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(doc)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0D9488] hover:bg-[#F0FDFA] transition-colors"
            title="View"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => onEdit(doc)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <FileEdit size={14} />
          </button>
          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-1 w-44">
                  <button
                    onClick={() => { onSend(doc); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#0F172A] hover:bg-[#F0FDFA] hover:text-[#0D9488]"
                  >
                    <Send size={12} /> Send to Client
                  </button>
                  <button
                    onClick={() => { onShare(doc); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#0F172A] hover:bg-[#F0FDFA] hover:text-[#0D9488]"
                  >
                    <LinkIcon size={12} /> Copy Share Link
                  </button>
                  <button
                    onClick={() => { onDuplicate(doc.id); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#0F172A] hover:bg-[#F0FDFA]"
                  >
                    <Copy size={12} /> Duplicate
                  </button>
                  <div className="border-t border-[#F1F5F9] my-1" />
                  <button
                    onClick={() => { onDelete(doc.id); setMenuOpen(false); }}
                    disabled={deleting === doc.id}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 disabled:opacity-40"
                  >
                    {deleting === doc.id ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Document Detail Drawer ───────────────────────────────────
function DocDetailDrawer({ doc, onClose, onStatusChange }: {
  doc: BusinessDocumentWithRelations;
  onClose: () => void;
  onStatusChange: () => void;
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copied, setCopied] = useState(false);
  const currency = doc.currency || "PKR";

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/doc/${doc.secure_token}`;

  const handleStatusChange = async (status: BusinessDocStatus) => {
    setUpdatingStatus(true);
    await updateDocument(doc.id, { status });
    setUpdatingStatus(false);
    onStatusChange();
  };

  const handleCopyLink = async () => {
    if (!doc.share_enabled) {
      await updateDocument(doc.id, { share_enabled: true });
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
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
      console.error("PDF error:", err);
    }
  };

  const STATUSES: BusinessDocStatus[] = ["draft", "review", "approved", "sent", "accepted", "rejected", "archived"];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-[#0D9488] font-bold">{doc.id}</span>
              <StatusBadge status={doc.status} />
            </div>
            <h2 className="font-bold text-[#0F172A] text-base leading-tight max-w-[280px]">{doc.title}</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">{DOC_TYPE_LABELS[doc.type]}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Client Info */}
          {doc.client && (
            <div className="bg-[#F8FAFC] rounded-xl p-4">
              <p className="text-[10px] text-[#94A3B8] font-semibold uppercase mb-2">Client</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center text-white font-bold text-sm">
                  {doc.client.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A] text-sm">{doc.client.full_name}</p>
                  <p className="text-xs text-[#64748B]">{doc.client.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Financial Summary */}
          {doc.total > 0 && (
            <div className="bg-[#F0FDFA] rounded-xl p-4 space-y-2 text-sm">
              <p className="text-[10px] text-[#0D9488] font-semibold uppercase mb-2">Financial Summary</p>
              <div className="flex justify-between text-[#64748B]">
                <span>Subtotal</span><span className="font-mono">{currency} {Number(doc.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Tax ({doc.tax_rate}%)</span><span className="font-mono">{currency} {(Number(doc.subtotal) * Number(doc.tax_rate) / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Discount</span><span className="font-mono">- {currency} {Number(doc.discount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-[#0D9488] text-base border-t border-[#CCFBF1] pt-2">
                <span>Total</span><span className="font-mono">{currency} {Number(doc.total).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-[#94A3B8] font-semibold uppercase text-[10px] mb-1">Created</p>
              <p className="font-medium text-[#0F172A]">{new Date(doc.created_at).toLocaleDateString("en-GB")}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-[#94A3B8] font-semibold uppercase text-[10px] mb-1">Valid Until</p>
              <p className="font-medium text-[#0F172A]">{doc.valid_until || "—"}</p>
            </div>
            {doc.client_viewed_at && (
              <div className="col-span-2 bg-indigo-50 rounded-lg p-3">
                <p className="text-indigo-600 text-[10px] font-semibold uppercase mb-0.5">Client Viewed</p>
                <p className="font-medium text-indigo-800">{new Date(doc.client_viewed_at).toLocaleString("en-GB")}</p>
              </div>
            )}
          </div>

          {/* Status Update */}
          <div>
            <p className="text-xs font-medium text-[#64748B] mb-2">Update Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map(s => {
                const cfg = DOC_STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    disabled={updatingStatus || doc.status === s}
                    onClick={() => handleStatusChange(s)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all disabled:opacity-40 ${
                      doc.status === s
                        ? `${cfg.bg} ${cfg.color} border-transparent font-semibold`
                        : "border-[#E2E8F0] text-[#64748B] hover:border-[#0D9488] hover:text-[#0D9488]"
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#E2E8F0] space-y-2">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F172A] text-white text-sm rounded-xl hover:bg-[#1E293B] transition-colors"
          >
            <LinkIcon size={14} />
            {copied ? "Link Copied!" : "Copy Client Share Link"}
          </button>
          <button
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E2E8F0] text-[#0F172A] text-sm rounded-xl hover:bg-[#F8FAFC] transition-colors"
          >
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────
export default function BusinessDocsPanel() {
  const [activeTab, setActiveTab] = useState<"all" | "proposals" | "quotations" | "srs" | "contracts" | "templates" | "analytics">("all");
  const [docs, setDocs] = useState<BusinessDocumentWithRelations[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [clients, setClients] = useState<{ id: string; full_name: string; email: string; role: string }[]>([]);
  const [stats, setStats] = useState<BusinessDocStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BusinessDocStatus | "all">("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [viewDoc, setViewDoc] = useState<BusinessDocumentWithRelations | null>(null);
  const [editDoc, setEditDoc] = useState<BusinessDocumentWithRelations | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const tabTypeMap: Record<string, BusinessDocType | undefined> = {
    proposals: "proposal",
    quotations: "quotation",
    srs: "srs",
    contracts: "contract",
  };

  const load = useCallback(async () => {
    setLoading(true);
    const currentType = tabTypeMap[activeTab];
    const [docsRes, statsRes, tplRes, clientsRes] = await Promise.all([
      getDocuments({
        type: currentType,
        status: statusFilter !== "all" ? statusFilter : undefined,
        templatesOnly: activeTab === "templates" ? true : false,
      }),
      getDocumentStats(),
      getTemplates(),
      getClients(),
    ]);
    setDocs((docsRes.data as BusinessDocumentWithRelations[]) || []);
    setStats(statsRes);
    setTemplates((tplRes.data as DocumentTemplate[]) || []);
    setClients((clientsRes.data || []) as { id: string; full_name: string; email: string; role: string }[]);
    setLoading(false);
  }, [activeTab, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = docs.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.id.toLowerCase().includes(q) ||
      d.title.toLowerCase().includes(q) ||
      d.client?.full_name?.toLowerCase().includes(q) ||
      d.client?.email?.toLowerCase().includes(q)
    );
  });

  const handleCreate = async (type: BusinessDocType, title: string, clientId: string, templateId?: string) => {
    const { createDocument, getTemplates: getTpl, getDocumentById } = await import("@/app/business-docs-actions");
    let sections;
    if (templateId) {
      const { data: tplData } = await getTpl(type);
      const tpl = tplData?.find(t => t.id === templateId);
      if (tpl?.template_data && typeof tpl.template_data === "object") {
        sections = (tpl.template_data as { sections?: unknown }).sections as typeof sections;
      }
    }
    const res = await createDocument({ type, title, client_id: clientId || undefined, sections });
    if (!res.error && res.docId) {
      const { data: createdDoc } = await getDocumentById(res.docId);
      if (createdDoc) {
        setEditDoc(createdDoc as BusinessDocumentWithRelations);
      }
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    setDeleting(id);
    await deleteDocument(id);
    setDeleting(null);
    load();
  };

  const handleDuplicate = async (id: string) => {
    await duplicateDocument(id);
    load();
  };

  const handleSend = async (doc: BusinessDocumentWithRelations) => {
    if (!doc.client_id) { alert("Please assign a client before sending."); return; }
    if (!confirm(`Send "${doc.title}" to ${doc.client?.full_name}?`)) return;
    await updateDocument(doc.id, { status: "sent", share_enabled: true });
    load();
  };

  const handleShare = async (doc: BusinessDocumentWithRelations) => {
    if (!doc.share_enabled) await updateDocument(doc.id, { share_enabled: true });
    const url = `${window.location.origin}/doc/${doc.secure_token}`;
    await navigator.clipboard.writeText(url);
    alert("Share link copied to clipboard!");
  };

  // Always fetch full document (with line_items) before opening builder
  const handleEdit = async (doc: BusinessDocumentWithRelations) => {
    setEditLoading(true);
    try {
      const { data } = await getDocumentById(doc.id);
      if (data) setEditDoc(data as BusinessDocumentWithRelations);
      else setEditDoc(doc);
    } catch {
      setEditDoc(doc);
    } finally {
      setEditLoading(false);
    }
  };

  // Show full-screen spinner while fetching full doc to open builder
  if (editLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#64748B]">Loading document…</span>
        </div>
      </div>
    );
  }

  // If editing any document type (proposal, srs, brd, contract, nda, etc.), show builder
  if (editDoc) {
    if (editDoc.type === "quotation") {
      return (
        <QuotationBuilder
          doc={editDoc}
          clients={clients}
          onBack={() => { setEditDoc(null); load(); }}
          onSave={() => { setEditDoc(null); load(); }}
        />
      );
    }
    return (
      <ProposalBuilder
        doc={editDoc}
        clients={clients}
        onBack={() => { setEditDoc(null); load(); }}
        onSave={() => { setEditDoc(null); load(); }}
      />
    );
  }

  const TABS = [
    { id: "all", label: "All Documents", icon: Layers },
    { id: "proposals", label: "Proposals", icon: FileText },
    { id: "quotations", label: "Quotations", icon: DollarSign },
    { id: "srs", label: "SRS / BRD", icon: FileEdit },
    { id: "contracts", label: "Contracts", icon: Pen },
    { id: "templates", label: "Templates", icon: Star },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Business Documents
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Create, manage, and track proposals, quotations, contracts, and all client-facing documents
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0D9488] text-white text-sm rounded-xl hover:bg-[#0f766e] transition-colors shadow-sm"
        >
          <Plus size={16} /> New Document
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          <StatCard label="Total" value={stats.total} color="bg-[#0F172A]" icon={Layers} />
          <StatCard label="Draft" value={stats.draft} color="bg-slate-400" icon={FileText} />
          <StatCard label="Sent" value={stats.sent} color="bg-purple-500" icon={Send} />
          <StatCard label="Accepted" value={stats.accepted} color="bg-emerald-500" icon={CheckCircle} />
          <StatCard label="Rejected" value={stats.rejected} color="bg-red-500" icon={XCircle} />
          <StatCard label="Expired" value={stats.expired} color="bg-orange-500" icon={AlertCircle} />
          <StatCard label="Pipeline" value={`PKR ${stats.pendingValue > 0 ? (Number(stats.pendingValue) / 1000).toFixed(0) + "K" : "0"}`} color="bg-blue-500" icon={TrendingUp} />
          <StatCard label="Won Value" value={stats.acceptedValue > 0 ? `${(Number(stats.acceptedValue) / 1000).toFixed(0)}K` : "0"} color="bg-[#0D9488]" icon={DollarSign} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0] overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-white text-[#0D9488] shadow-sm border border-[#E2E8F0]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Analytics Tab */}
      {activeTab === "analytics" && <DocumentAnalyticsPanel stats={stats} docs={docs} />}

      {/* Document List */}
      {activeTab !== "analytics" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0]">
          {/* Toolbar */}
          <div className="p-5 border-b border-[#F1F5F9] flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                className="w-full pl-9 pr-4 py-2 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                placeholder="Search by ID, title, or client…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[#94A3B8]" />
              <select
                className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 bg-white"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as BusinessDocStatus | "all")}
              >
                <option value="all">All Status</option>
                {(Object.keys(DOC_STATUS_CONFIG) as BusinessDocStatus[]).map(s => (
                  <option key={s} value={s}>{DOC_STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </div>
            <button onClick={load} className="p-2 border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] text-[#64748B]">
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="w-8 h-8 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <FileText size={36} className="text-[#CBD5E1] mx-auto mb-3" />
              <p className="text-[#64748B] font-medium">No documents found</p>
              <p className="text-sm text-[#94A3B8] mt-1">
                {search ? "Try a different search term" : "Click 'New Document' to create your first document"}
              </p>
              <button
                onClick={() => setShowNewModal(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white text-sm rounded-xl hover:bg-[#0f766e] mx-auto"
              >
                <Plus size={15} /> New Document
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    {["Doc ID", "Title / Client", "Status", "Value", "Valid Until", "Created", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(doc => (
                    <DocRow
                      key={doc.id}
                      doc={doc}
                      onView={d => setViewDoc(d)}
                      onEdit={handleEdit}
                      onDuplicate={handleDuplicate}
                      onDelete={handleDelete}
                      onSend={handleSend}
                      onShare={handleShare}
                      deleting={deleting}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showNewModal && (
        <NewDocModal
          clients={clients}
          templates={templates}
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreate}
        />
      )}
      {viewDoc && (
        <DocDetailDrawer
          doc={viewDoc}
          onClose={() => setViewDoc(null)}
          onStatusChange={() => { load(); setViewDoc(null); }}
        />
      )}
    </div>
  );
}
