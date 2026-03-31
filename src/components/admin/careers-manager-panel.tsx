"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Save, X } from "lucide-react";
import { getCareerJobs, createCareerJob, updateCareerJob, deleteCareerJob } from "@/app/careers-actions";

export default function CareersManagerPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", department: "", location: "", type: "", 
    requirements: "", description: "", status: "Open"
  });

  const loadData = async () => {
    setLoading(true);
    const { data } = await getCareerJobs();
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = (item: any) => {
    setForm({
      title: item.title, department: item.department || "", location: item.location || "",
      type: item.type || "", requirements: item.requirements || "",
      description: item.description || "", status: item.status
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job listing?")) return;
    await deleteCareerJob(id);
    loadData();
  };

  const handleSave = async () => {
    if (editingId) {
      await updateCareerJob(editingId, form);
    } else {
      await createCareerJob(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({
      title: "", department: "", location: "", type: "", 
      requirements: "", description: "", status: "Open"
    });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="font-bold text-[#0F172A] text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Careers Manager
            </h2>
            <p className="text-sm text-[#64748B] mt-1">Post and manage job openings.</p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ title: "", department: "", location: "", type: "", requirements: "", description: "", status: "Open" });
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl transition-all"
          >
            {showForm ? <X size={16} /> : <PlusCircle size={16} />}
            {showForm ? "Cancel" : "Add Job"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#CCFBF1] p-6 border-l-4 border-l-[#0D9488]">
          <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            {editingId ? "Edit Job" : "Add New Job"}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Job Title</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Department</label>
              <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B]">
                <option value="">Select...</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Location</label>
              <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B]">
                <option value="">Select...</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Requirements (newline-separated)</label>
              <textarea rows={3} value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Description</label>
              <textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B]">
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl text-sm transition-all">
              <Save size={14} /> Save Job
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
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Position</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Department</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Location</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id || i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 text-[#0F172A] font-medium">{item.title}</td>
                    <td className="py-3 px-4 text-[#64748B]">{item.department}</td>
                    <td className="py-3 px-4 text-[#64748B]">{item.location}</td>
                    <td className="py-3 px-4 text-[#64748B]">{item.type}</td>
                    <td className="py-3 px-4 text-[#64748B]">{item.status}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-[#F0FDFA] text-[#0D9488] transition-colors"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#EF4444] transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-6 text-gray-500">No jobs found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
