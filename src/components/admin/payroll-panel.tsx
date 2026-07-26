"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Plus, DollarSign, CheckCircle2, CalendarDays, X, Edit } from "lucide-react";
import { createPayrollPeriod, generatePayrollForPeriod, getPayrollPeriods, getPayrollRecords, updatePayrollRecord, markPayrollPeriodPaid } from "@/app/erp-actions";

type PayrollPeriod = {
  id: string;
  period_label: string;
  month: number;
  year: number;
  status: string;
};

type PayrollRecord = {
  id: string;
  basic_salary: number;
  total_allowances: number;
  total_deductions: number;
  tax_deduction: number;
  advance_deduction: number;
  gross_salary: number;
  net_salary: number;
  payment_status: string;
  user?: { full_name?: string; email?: string };
};

export default function PayrollPanel() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [periodRes] = await Promise.all([getPayrollPeriods()]);
      const nextPeriods = (periodRes.data as PayrollPeriod[]) || [];
      setPeriods(nextPeriods);
      if (!selectedPeriod && nextPeriods[0]?.id) {
        setSelectedPeriod(nextPeriods[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedPeriod) return;
    const fetchRecords = async () => {
      const { data } = await getPayrollRecords(selectedPeriod);
      setRecords((data as PayrollRecord[]) || []);
    };
    fetchRecords();
  }, [selectedPeriod]);

  const createPeriod = async () => {
    setSaving(true);
    try {
      const { data } = await createPayrollPeriod(month, year);
      if (data?.id) {
        setSelectedPeriod(data.id);
      }
      await load();
    } finally {
      setSaving(false);
    }
  };

  const generatePeriod = async () => {
    if (!selectedPeriod) return;
    setSaving(true);
    try {
      const { error } = await generatePayrollForPeriod(selectedPeriod);
      if (error) {
        alert(error.message || "Failed to generate payroll");
        return;
      }
      await load();
      const { data } = await getPayrollRecords(selectedPeriod);
      setRecords((data as PayrollRecord[]) || []);
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async () => {
    if (!selectedPeriod) return;
    setSaving(true);
    try {
      await markPayrollPeriodPaid(selectedPeriod);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setSaving(true);
    try {
      await updatePayrollRecord(editingRecord.id, {
        basic_salary: editingRecord.basic_salary,
        total_allowances: editingRecord.total_allowances,
        total_deductions: editingRecord.total_deductions,
        tax_deduction: editingRecord.tax_deduction,
        advance_deduction: editingRecord.advance_deduction,
        gross_salary: editingRecord.gross_salary,
        net_salary: editingRecord.net_salary,
      });
      setEditingRecord(null);
      const { data } = await getPayrollRecords(selectedPeriod);
      setRecords((data as PayrollRecord[]) || []);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Payroll Period Management
            </h2>
            <p className="text-sm text-[#64748B]">Create payroll periods, generate payslips, and finalize payments.</p>
          </div>
          <button onClick={() => load()} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0D9488]">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-[#E2E8F0] p-4">
            <label className="block text-xs font-semibold mb-2">Existing Payroll Periods</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm"
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.period_label} · {period.status}
                </option>
              ))}
            </select>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={generatePeriod} disabled={saving || !selectedPeriod} className="flex items-center gap-2 rounded-xl bg-[#0D9488] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0F766E] disabled:opacity-60">
                <DollarSign size={15} /> Generate Payroll
              </button>
              <button onClick={markPaid} disabled={saving || !selectedPeriod} className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] disabled:opacity-60">
                <CheckCircle2 size={15} /> Mark Paid
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] p-4">
            <label className="block text-xs font-semibold mb-2">Create New Period</label>
            <div className="grid gap-3 sm:grid-cols-2">
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString("default", { month: "long" })}</option>
                ))}
              </select>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm" />
            </div>
            <button onClick={createPeriod} disabled={saving} className="mt-4 flex items-center gap-2 rounded-xl bg-[#0F172A] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1E293B] disabled:opacity-60">
              <Plus size={15} /> Create period
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="border-b border-[#E2E8F0] p-4">
          <h3 className="font-semibold text-[#0F172A]">Payroll records</h3>
        </div>
        {records.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#64748B]">No payroll records for the selected period yet.</div>
        ) : (
          <div className="divide-y divide-[#F8FAFC]">
            {records.map((record) => (
              <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-semibold text-[#0F172A]">{record.user?.full_name || "Employee"}</div>
                  <div className="text-xs text-[#64748B]">{record.user?.email || ""}</div>
                </div>
                
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="text-slate-500 font-semibold mb-0.5">Basic</div>
                    <div className="font-bold text-slate-700">{record.basic_salary?.toLocaleString() || 0}</div>
                  </div>
                  <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                    <div className="text-emerald-600 font-semibold mb-0.5">Allowances</div>
                    <div className="font-bold text-emerald-700">+{record.total_allowances?.toLocaleString() || 0}</div>
                  </div>
                  <div className="bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                    <div className="text-rose-600 font-semibold mb-0.5">Deductions</div>
                    <div className="font-bold text-rose-700">-{((record.total_deductions || 0) + (record.tax_deduction || 0) + (record.advance_deduction || 0)).toLocaleString()}</div>
                  </div>
                  <div className="bg-[#F0FDFA] p-2 rounded-lg border border-teal-100 shadow-inner">
                    <div className="text-[#0D9488] font-bold mb-0.5">Net Pay</div>
                    <div className="font-bold text-[#0D9488] text-sm">{record.net_salary?.toLocaleString() || 0}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="rounded-full bg-[#F0FDFA] px-3 py-1 text-xs font-semibold text-[#0D9488]">
                    {record.payment_status}
                  </div>
                  <button onClick={() => setEditingRecord(record)} className="text-slate-400 hover:text-[#0D9488]">
                    <Edit size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-slate-50">
              <h3 className="font-bold text-slate-800">Edit Payslip</h3>
              <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveRecord} className="p-4 space-y-4">
              <div className="text-sm font-semibold text-slate-700 mb-2">{editingRecord.user?.full_name}</div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Basic Salary</label>
                  <input type="number" required value={editingRecord.basic_salary} 
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const gross = val + editingRecord.total_allowances;
                      setEditingRecord({ ...editingRecord, basic_salary: val, gross_salary: gross, net_salary: gross - editingRecord.total_deductions - editingRecord.tax_deduction - editingRecord.advance_deduction });
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Allowances</label>
                  <input type="number" required value={editingRecord.total_allowances} 
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const gross = editingRecord.basic_salary + val;
                      setEditingRecord({ ...editingRecord, total_allowances: val, gross_salary: gross, net_salary: gross - editingRecord.total_deductions - editingRecord.tax_deduction - editingRecord.advance_deduction });
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Deductions</label>
                  <input type="number" required value={editingRecord.total_deductions} 
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingRecord({ ...editingRecord, total_deductions: val, net_salary: editingRecord.gross_salary - val - editingRecord.tax_deduction - editingRecord.advance_deduction });
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tax Deduction</label>
                  <input type="number" required value={editingRecord.tax_deduction} 
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingRecord({ ...editingRecord, tax_deduction: val, net_salary: editingRecord.gross_salary - editingRecord.total_deductions - val - editingRecord.advance_deduction });
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488]" />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border flex justify-between text-sm font-semibold">
                <span className="text-slate-500">Net Salary</span>
                <span className="text-[#0D9488]">{editingRecord.net_salary}</span>
              </div>

              <div className="flex gap-2 pt-2 border-t mt-4">
                <button type="button" onClick={() => setEditingRecord(null)} className="flex-1 py-2 border rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-[#0D9488] text-white font-semibold text-sm rounded-lg hover:bg-[#0F766E] disabled:opacity-60 transition-colors">
                  {saving ? "Saving..." : "Save Payslip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
