"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Receipt, Plus, Search, Eye, Trash2, Download, RefreshCw,
  CheckCircle, Clock, AlertCircle, XCircle, Filter, X,
  TrendingUp, DollarSign, FileText, Edit3
} from "lucide-react";
import {
  getInvoices, createInvoice, updateInvoice, deleteInvoice, getInvoiceStats
} from "@/app/invoice-actions";
import { getAllProfiles } from "@/app/certificate-actions";
import type { InvoiceWithItems } from "@/types/erp";

// ─── Status Helpers ────────────────────────────────────────────
const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-600", icon: FileText },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700", icon: Clock },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-700", icon: AlertCircle },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-500", icon: XCircle },
} as const;

type Status = keyof typeof STATUS_CONFIG;

// ─── Stats Card ────────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string | number; sub?: string;
  color: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
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

// ─── Line Item Row ─────────────────────────────────────────────
type LineItem = { description: string; quantity: number; unit_price: number };

function LineItemRow({ item, index, onChange, onRemove }: {
  item: LineItem; index: number;
  onChange: (i: number, field: keyof LineItem, value: string | number) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <input
        className="col-span-5 px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
        placeholder="Description"
        value={item.description}
        onChange={e => onChange(index, "description", e.target.value)}
      />
      <input
        type="number" min="1"
        className="col-span-2 px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
        placeholder="Qty"
        value={item.quantity}
        onChange={e => onChange(index, "quantity", Number(e.target.value))}
      />
      <input
        type="number" min="0"
        className="col-span-3 px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
        placeholder="Unit Price"
        value={item.unit_price}
        onChange={e => onChange(index, "unit_price", Number(e.target.value))}
      />
      <div className="col-span-1 text-sm text-right text-[#64748B] font-mono">
        {(item.quantity * item.unit_price).toLocaleString()}
      </div>
      <button onClick={() => onRemove(index)} className="col-span-1 text-red-400 hover:text-red-600 flex justify-center">
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Create Invoice Modal ───────────────────────────────────────
function CreateInvoiceModal({ clients, onClose, onCreated }: {
  clients: { id: string; full_name: string; email: string }[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [clientId, setClientId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unit_price: 0 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const tax = (subtotal * taxRate) / 100;
  const total = subtotal + tax - discount;

  const updateItem = (i: number, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async () => {
    if (!clientId) return setError("Please select a client");
    if (items.every(i => !i.description)) return setError("Add at least one item");
    setSaving(true);
    const { error: err } = await createInvoice({
      client_id: clientId,
      due_date: dueDate || undefined,
      tax_rate: taxRate,
      discount,
      notes,
      items: items.filter(i => i.description),
    });
    setSaving(false);
    if (err) return setError(err.message);
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center py-8 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">Create Invoice</h2>
            <p className="text-xs text-[#64748B]">Invoice ID will be auto-generated</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Client & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Client *</label>
              <select
                className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 bg-white"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
              >
                <option value="">Select client…</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Due Date</label>
              <input
                type="date"
                className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[#64748B]">Line Items</label>
              <button
                onClick={() => setItems(prev => [...prev, { description: "", quantity: 1, unit_price: 0 }])}
                className="text-xs text-[#0D9488] hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Add Row
              </button>
            </div>
            <div className="grid grid-cols-12 gap-2 mb-2 text-xs text-[#94A3B8] font-medium">
              <span className="col-span-5">Description</span>
              <span className="col-span-2">Qty</span>
              <span className="col-span-3">Unit Price</span>
              <span className="col-span-1 text-right">Total</span>
              <span className="col-span-1" />
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <LineItemRow key={i} item={item} index={i} onChange={updateItem}
                  onRemove={i => setItems(prev => prev.filter((_, idx) => idx !== i))}
                />
              ))}
            </div>
          </div>

          {/* Tax, Discount, Totals */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Tax Rate (%)</label>
              <input type="number" min="0" max="100"
                className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                value={taxRate} onChange={e => setTaxRate(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Discount (PKR)</label>
              <input type="number" min="0"
                className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                value={discount} onChange={e => setDiscount(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Totals Preview */}
          <div className="bg-[#F0FDFA] rounded-xl p-4 space-y-1 text-sm">
            <div className="flex justify-between text-[#64748B]">
              <span>Subtotal</span><span className="font-mono">PKR {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#64748B]">
              <span>Tax ({taxRate}%)</span><span className="font-mono">PKR {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#64748B]">
              <span>Discount</span><span className="font-mono">- PKR {discount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-[#0D9488] text-base pt-2 border-t border-[#CCFBF1]">
              <span>Total</span><span className="font-mono">PKR {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Notes</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 resize-none"
              placeholder="Payment terms, additional info…"
              value={notes} onChange={e => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>

        <div className="p-6 pt-0 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">Cancel</button>
          <button
            onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 text-sm bg-[#0D9488] text-white rounded-xl hover:bg-[#0f766e] disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Receipt size={14} />}
            {saving ? "Creating…" : "Create Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── View Invoice Modal ─────────────────────────────────────────
function ViewInvoiceModal({ invoice, onClose, onStatusChange }: {
  invoice: InvoiceWithItems;
  onClose: () => void;
  onStatusChange: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const cfg = STATUS_CONFIG[invoice.status as Status];

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const { generateInvoicePDF } = await import("@/lib/pdf-utils");
      const blob = await generateInvoicePDF(invoice);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handleStatusChange = async (status: Status) => {
    setUpdating(true);
    await updateInvoice(invoice.id, { status });
    setUpdating(false);
    onStatusChange();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center py-8 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="p-6 border-b border-[#E2E8F0] flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                <cfg.icon size={11} /> {cfg.label}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] font-mono">{invoice.id}</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Issued: {invoice.issue_date} {invoice.due_date && `· Due: ${invoice.due_date}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Client Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F8FAFC] rounded-xl p-4">
              <p className="text-xs text-[#94A3B8] mb-1">BILL TO</p>
              <p className="font-semibold text-[#0F172A]">{invoice.client?.full_name || "—"}</p>
              <p className="text-sm text-[#64748B]">{invoice.client?.email}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-4">
              <p className="text-xs text-[#94A3B8] mb-1">CREATED BY</p>
              <p className="font-semibold text-[#0F172A]">{invoice.creator?.full_name || "—"}</p>
              <p className="text-sm text-[#64748B]">{invoice.creator?.email}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#0D9488] text-white">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Description</th>
                  <th className="text-center px-4 py-3 font-medium">Qty</th>
                  <th className="text-right px-4 py-3 font-medium">Unit Price</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {invoice.invoice_items?.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}>
                    <td className="px-4 py-3 text-[#0F172A]">{item.description}</td>
                    <td className="px-4 py-3 text-center text-[#64748B]">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-mono text-[#64748B]">PKR {Number(item.unit_price).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-[#0F172A]">PKR {Number(item.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-[#64748B]">
                <span>Subtotal</span>
                <span className="font-mono">PKR {Number(invoice.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Tax ({invoice.tax_rate}%)</span>
                <span className="font-mono">PKR {(Number(invoice.subtotal) * Number(invoice.tax_rate) / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Discount</span>
                <span className="font-mono">- PKR {Number(invoice.discount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-[#0D9488] text-base pt-2 border-t border-[#E2E8F0]">
                <span>TOTAL</span>
                <span className="font-mono">PKR {Number(invoice.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="bg-[#F8FAFC] rounded-xl p-4">
              <p className="text-xs text-[#94A3B8] mb-1">NOTES</p>
              <p className="text-sm text-[#64748B]">{invoice.notes}</p>
            </div>
          )}

          {/* Status Update */}
          <div>
            <p className="text-xs font-medium text-[#64748B] mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_CONFIG) as Status[]).map(s => (
                <button
                  key={s}
                  disabled={updating || invoice.status === s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all disabled:opacity-40 ${
                    invoice.status === s
                      ? `${STATUS_CONFIG[s].color} border-transparent font-semibold`
                      : "border-[#E2E8F0] text-[#64748B] hover:border-[#0D9488] hover:text-[#0D9488]"
                  }`}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 flex justify-end gap-3">
          <button
            onClick={handleDownloadPDF} disabled={downloading}
            className="px-4 py-2 text-sm bg-[#0F172A] text-white rounded-xl hover:bg-[#1E293B] flex items-center gap-2 disabled:opacity-50"
          >
            {downloading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
            {downloading ? "Generating…" : "Download PDF"}
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC]">Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────
export default function InvoiceManagerPanel() {
  const [invoices, setInvoices] = useState<InvoiceWithItems[]>([]);
  const [clients, setClients] = useState<{ id: string; full_name: string; email: string; role: string }[]>([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0, overdue: 0, revenue: 0, outstanding: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<InvoiceWithItems | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [invRes, profilesRes, statsRes] = await Promise.all([
      getInvoices({ status: statusFilter !== "all" ? statusFilter : undefined }),
      getAllProfiles(),
      getInvoiceStats(),
    ]);
    setInvoices((invRes.data as InvoiceWithItems[]) || []);
    setClients(((profilesRes.data || []) as { id: string; full_name: string; email: string; role: string }[]).filter(p => p.role === "client"));
    setStats(statsRes);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = invoices.filter(inv => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      inv.id.toLowerCase().includes(q) ||
      inv.client?.full_name?.toLowerCase().includes(q) ||
      inv.client?.email?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    setDeleting(id);
    await deleteInvoice(id);
    setDeleting(null);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Invoices" value={stats.total} color="bg-[#0F172A]" icon={Receipt} />
        <StatCard label="Paid" value={stats.paid} color="bg-emerald-500" icon={CheckCircle} />
        <StatCard label="Sent" value={stats.unpaid} color="bg-blue-500" icon={Clock} />
        <StatCard label="Overdue" value={stats.overdue} color="bg-red-500" icon={AlertCircle} />
        <StatCard label="Revenue" value={`PKR ${stats.revenue.toLocaleString()}`} color="bg-[#0D9488]" icon={TrendingUp} />
        <StatCard label="Outstanding" value={`PKR ${stats.outstanding.toLocaleString()}`} color="bg-orange-500" icon={DollarSign} />
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
              placeholder="Search by invoice ID, client name or email…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#94A3B8]" />
            <select
              className="px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 bg-white"
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>
          <button onClick={() => load()} className="p-2.5 border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] text-[#64748B]">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0D9488] text-white text-sm rounded-xl hover:bg-[#0f766e] transition-colors"
          >
            <Plus size={16} /> New Invoice
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Receipt size={32} className="text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[#64748B] text-sm">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {["Invoice #", "Client", "Amount", "Due Date", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => {
                  const cfg = STATUS_CONFIG[inv.status as Status] || STATUS_CONFIG.draft;
                  return (
                    <tr key={inv.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-[#0D9488]">{inv.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#0F172A]">{inv.client?.full_name || "—"}</div>
                        <div className="text-xs text-[#94A3B8]">{inv.client?.email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-[#0F172A]">
                        PKR {Number(inv.total).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">{inv.due_date || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                          <cfg.icon size={11} /> {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewInvoice(inv)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0D9488] hover:bg-[#F0FDFA] transition-colors"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(inv.id)}
                            disabled={deleting === inv.id}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            {deleting === inv.id ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateInvoiceModal
          clients={clients}
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}
      {viewInvoice && (
        <ViewInvoiceModal
          invoice={viewInvoice}
          onClose={() => setViewInvoice(null)}
          onStatusChange={() => { load(); setViewInvoice(null); }}
        />
      )}
    </div>
  );
}
