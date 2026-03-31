"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Save, X } from "lucide-react";
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from "@/app/testimonials-actions";
import { ImageUpload } from "../ui/image-upload";

export default function TestimonialsManagerPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    client_name: "", company: "", role: "", rating: 5, 
    quote: "", photo_url: "", video_url: "",
    is_visible: true, display_order: 0
  });

  const loadData = async () => {
    setLoading(true);
    const { data } = await getTestimonials(false);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = (item: any) => {
    setForm({
      client_name: item.client_name, company: item.company || "", role: item.role || "",
      rating: item.rating || 5, quote: item.quote || "", photo_url: item.photo_url || "",
      video_url: item.video_url || "", is_visible: item.is_visible, display_order: item.display_order || 0
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await deleteTestimonial(id);
    loadData();
  };

  const handleSave = async () => {
    if (editingId) {
      await updateTestimonial(editingId, form);
    } else {
      await createTestimonial(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({
      client_name: "", company: "", role: "", rating: 5, 
      quote: "", photo_url: "", video_url: "",
      is_visible: true, display_order: 0
    });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="font-bold text-[#0F172A] text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Testimonials Manager
            </h2>
            <p className="text-sm text-[#64748B] mt-1">Manage client testimonials and reviews displayed on the website.</p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ client_name: "", company: "", role: "", rating: 5, quote: "", photo_url: "", video_url: "", is_visible: true, display_order: 0 });
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl transition-all"
          >
            {showForm ? <X size={16} /> : <PlusCircle size={16} />}
            {showForm ? "Cancel" : "Add Testimonial"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#CCFBF1] p-6 border-l-4 border-l-[#0D9488]">
          <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            {editingId ? "Edit Testimonial" : "Add New Testimonial"}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Client Name</label>
              <input type="text" value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Company</label>
              <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Role</label>
              <input type="text" value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Rating (1-5)</label>
              <select value={form.rating} onChange={e => setForm({...form, rating: parseInt(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B]">
                <option value={5}>5 Starts</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Quote</label>
              <textarea rows={3} value={form.quote} onChange={e => setForm({...form, quote: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-sm font-medium text-[#0F172A]">Client Photo</label>
              <ImageUpload
                value={form.photo_url}
                onChange={(url) => setForm({ ...form, photo_url: url })}
                onRemove={() => setForm({ ...form, photo_url: "" })}
                bucket="testimonials"
                aspectRatio="square"
                label="Upload Client Photo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Video URL (optional)</label>
              <input type="text" value={form.video_url} onChange={e => setForm({...form, video_url: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 mt-4">
                <input type="checkbox" id="is_visible" checked={form.is_visible} onChange={e => setForm({...form, is_visible: e.target.checked})} className="w-4 h-4 text-[#0D9488] border-[#E2E8F0] rounded" />
                <label htmlFor="is_visible" className="text-sm font-medium text-[#0F172A]">Visible on Website</label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Display Order</label>
              <input type="number" value={form.display_order} onChange={e => setForm({...form, display_order: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl text-sm transition-all">
              <Save size={14} /> Save Testimonial
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
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Client Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Company</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Rating</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Visible</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id || i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 text-[#0F172A] font-medium">{item.client_name}</td>
                    <td className="py-3 px-4 text-[#64748B]">{item.company}</td>
                    <td className="py-3 px-4 text-[#64748B]">
                      {"★".repeat(item.rating) + "☆".repeat(5-item.rating)}
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">{item.is_visible ? "Yes" : "No"}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-[#F0FDFA] text-[#0D9488] transition-colors"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#EF4444] transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-6 text-gray-500">No testimonials found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
