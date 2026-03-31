"use client";

import { useState, useEffect, useCallback } from "react";
import { Receipt, Search, Download, Eye, X, FileText, CheckCircle, Clock } from "lucide-react";
import { getInvoices } from "@/app/invoice-actions";
import type { InvoiceWithItems } from "@/types/erp";

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-600", icon: FileText },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700", icon: Clock },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-700", icon: Clock },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-500", icon: X },
} as const;

export default function ClientInvoicePanel({ userId }: { userId: string }) {
  const [invoices, setInvoices] = useState<InvoiceWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    // Client can only fetch their own invoices due to RLS, but we can also filter just in case
    // getInvoices returns all allowed by RLS.
    const { data } = await getInvoices(); 
    setInvoices((data as InvoiceWithItems[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = invoices.filter(inv => {
    if (!search) return true;
    return inv.id.toLowerCase().includes(search.toLowerCase());
  });

  const handleDownload = async (invoice: InvoiceWithItems) => {
    setDownloading(invoice.id);
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
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const outstanding = invoices.filter(i => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + Number(i.total), 0);
  const paid = invoices.filter(i => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.total), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="text-xs text-[#64748B] mb-1">Total Invoices</div>
          <div className="text-3xl font-bold text-[#0F172A] font-mono">{invoices.length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="text-xs text-[#64748B] mb-1">Outstanding Balance</div>
          <div className="text-3xl font-bold text-orange-500 font-mono">PKR {outstanding.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="text-xs text-[#64748B] mb-1">Total Paid</div>
          <div className="text-3xl font-bold text-emerald-500 font-mono">PKR {paid.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <div className="flex mb-4 relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
            placeholder="Search invoice ID…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Receipt size={32} className="text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[#64748B] text-sm">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {["Invoice #", "Issue Date", "Due Date", "Amount", "Status", "Download"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => {
                  const cfg = STATUS_CONFIG[inv.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
                  const Icon = cfg.icon;
                  return (
                    <tr key={inv.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 font-mono font-semibold text-[#0D9488]">{inv.id}</td>
                      <td className="px-4 py-3 text-[#64748B]">{inv.issue_date}</td>
                      <td className="px-4 py-3 text-[#64748B]">{inv.due_date || "—"}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-[#0F172A]">PKR {Number(inv.total).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                          <Icon size={11} /> {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDownload(inv)}
                          disabled={downloading === inv.id}
                          className="p-2 rounded-xl text-[#0D9488] hover:bg-[#F0FDFA] transition-colors disabled:opacity-50"
                        >
                          {downloading === inv.id ? <div className="w-4 h-4 border-2 border-[currentcolor] border-t-transparent rounded-full animate-spin" /> : <Download size={16} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
