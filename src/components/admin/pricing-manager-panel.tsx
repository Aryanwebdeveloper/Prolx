"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Save, X } from "lucide-react";
import { getPricingPlans, createPricingPlan, updatePricingPlan, deletePricingPlan } from "@/app/pricing-actions";

export default function PricingManagerPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", price_usd: "", price_pkr: "", description: "", 
    features: "", is_recommended: false, cta_text: "Get Started",
    is_active: true, display_order: 0
  });

  const loadData = async () => {
    setLoading(true);
    const { data } = await getPricingPlans(false);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = (item: any) => {
    setForm({
      name: item.name, price_usd: item.price_usd || "", price_pkr: item.price_pkr || "",
      description: item.description || "", features: item.features || "",
      is_recommended: item.is_recommended || false, cta_text: item.cta_text || "Get Started",
      is_active: item.is_active, display_order: item.display_order || 0
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pricing plan?")) return;
    await deletePricingPlan(id);
    loadData();
  };

  const handleSave = async () => {
    if (editingId) {
      await updatePricingPlan(editingId, form);
    } else {
      await createPricingPlan(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({
      name: "", price_usd: "", price_pkr: "", description: "", 
      features: "", is_recommended: false, cta_text: "Get Started",
      is_active: true, display_order: 0
    });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="font-bold text-[#0F172A] text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Pricing Manager
            </h2>
            <p className="text-sm text-[#64748B] mt-1">Manage pricing plans, features, and recommended badges.</p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", price_usd: "", price_pkr: "", description: "", features: "", is_recommended: false, cta_text: "Get Started", is_active: true, display_order: 0 });
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl transition-all"
          >
            {showForm ? <X size={16} /> : <PlusCircle size={16} />}
            {showForm ? "Cancel" : "Add Plan"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#CCFBF1] p-6 border-l-4 border-l-[#0D9488]">
          <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            {editingId ? "Edit Plan" : "Add New Plan"}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Plan Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Price (USD)</label>
              <input type="text" value={form.price_usd} onChange={e => setForm({...form, price_usd: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Price (PKR)</label>
              <input type="text" value={form.price_pkr} onChange={e => setForm({...form, price_pkr: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">CTA Button Text</label>
              <input type="text" value={form.cta_text} onChange={e => setForm({...form, cta_text: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Features (one per line)</label>
              <textarea rows={5} value={form.features} onChange={e => setForm({...form, features: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none leading-relaxed" />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_recommended" checked={form.is_recommended} onChange={e => setForm({...form, is_recommended: e.target.checked})} className="w-4 h-4 text-[#0D9488] border-[#E2E8F0] rounded" />
                <label htmlFor="is_recommended" className="text-sm font-medium text-[#0F172A]">Highlighted / Recommended Plan</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 text-[#0D9488] border-[#E2E8F0] rounded" />
                <label htmlFor="is_active" className="text-sm font-medium text-[#0F172A]">Active</label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Display Order</label>
              <input type="number" value={form.display_order} onChange={e => setForm({...form, display_order: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl text-sm transition-all">
              <Save size={14} /> Save Plan
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-[#64748B] hover:text-[#0F172A] text-sm font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Plan Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Price (USD)</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Price (PKR)</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Recommended</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id || i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 text-[#0F172A] font-medium">
                      {item.name} {item.is_active ? "" : <span className="text-xs text-red-500 ml-2">(Inactive)</span>}
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">{item.price_usd}</td>
                    <td className="py-3 px-4 text-[#64748B]">{item.price_pkr}</td>
                    <td className="py-3 px-4 text-[#64748B]">{item.is_recommended ? "⭐ Yes" : "No"}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-[#F0FDFA] text-[#0D9488] transition-colors"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#EF4444] transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-6 text-gray-500">No pricing plans found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
