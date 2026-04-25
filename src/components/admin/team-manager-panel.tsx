"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Save, X } from "lucide-react";
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from "@/app/team-actions";
import { ImageUpload } from "../ui/image-upload";

export default function TeamManagerPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "", role: "", department: "", experience: "",
    bio: "", skills: "", photo_url: "", linkedin_url: "", github_url: "",
    is_active: true, display_order: 0
  });

  const loadData = async () => {
    setLoading(true);
    const { data } = await getTeamMembers(false);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = (item: any) => {
    setForm({
      full_name: item.full_name, role: item.role || "", department: item.department || "",
      experience: item.experience || "", bio: item.bio || "", skills: item.skills || "",
      photo_url: item.photo_url || "", linkedin_url: item.linkedin_url || "",
      github_url: item.github_url || "", is_active: item.is_active, display_order: item.display_order || 0
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team member?")) return;
    await deleteTeamMember(id);
    loadData();
  };

  const handleSave = async () => {
    if (editingId) {
      await updateTeamMember(editingId, form);
    } else {
      await createTeamMember(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({
      full_name: "", role: "", department: "", experience: "",
      bio: "", skills: "", photo_url: "", linkedin_url: "", github_url: "",
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
              Team Manager
            </h2>
            <p className="text-sm text-[#64748B] mt-1">Manage team member profiles displayed on the Team page.</p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ full_name: "", role: "", department: "", experience: "", bio: "", skills: "", photo_url: "", linkedin_url: "", github_url: "", is_active: true, display_order: 0 });
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl transition-all"
          >
            {showForm ? <X size={16} /> : <PlusCircle size={16} />}
            {showForm ? "Cancel" : "Add Team Member"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#CCFBF1] p-6 border-l-4 border-l-[#0D9488]">
          <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            {editingId ? "Edit Team Member" : "Add New Team Member"}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Full Name</label>
              <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Role</label>
              <input type="text" value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Department</label>
              <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B]">
                <option value="">Select...</option>
                <option value="Leadership">Leadership</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Years of Experience</label>
              <input type="text" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Short Bio</label>
              <textarea rows={2} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="One-line description shown on the team page..." className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Skills (comma-separated)</label>
              <input type="text" value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-sm font-medium text-[#0F172A]">Profile Photo</label>
              <ImageUpload
                value={form.photo_url}
                onChange={(url) => setForm({ ...form, photo_url: url })}
                onRemove={() => setForm({ ...form, photo_url: "" })}
                bucket="team-members"
                aspectRatio="square"
                label="Upload Member Photo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">LinkedIn URL</label>
              <input type="text" value={form.linkedin_url} onChange={e => setForm({...form, linkedin_url: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">GitHub URL</label>
              <input type="text" value={form.github_url} onChange={e => setForm({...form, github_url: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 text-[#0D9488] border-[#E2E8F0] rounded" />
              <label htmlFor="is_active" className="text-sm font-medium text-[#0F172A]">Active Member</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Display Order</label>
              <input type="number" value={form.display_order} onChange={e => setForm({...form, display_order: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl text-sm transition-all">
              <Save size={14} /> Save Member
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
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Department</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id || i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 text-[#0F172A] font-medium">{item.full_name}</td>
                    <td className="py-3 px-4 text-[#64748B]">{item.role}</td>
                    <td className="py-3 px-4 text-[#64748B]">{item.department}</td>
                    <td className="py-3 px-4 text-[#64748B]">{item.is_active ? "Active" : "Inactive"}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-[#F0FDFA] text-[#0D9488] transition-colors"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#EF4444] transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-6 text-gray-500">No team members found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
