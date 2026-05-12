"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Save, X, User } from "lucide-react";
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from "@/app/team-actions";
import { getAllProfiles } from "@/app/certificate-actions";
import { ImageUpload } from "../ui/image-upload";

export default function TeamManagerPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "", role: "", department: "", experience: "",
    bio: "", skills: "", photo_url: "", linkedin_url: "", github_url: "",
    is_active: true, is_visible: true, display_order: 0, linked_user_id: ""
  });

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [teamRes, profilesRes] = await Promise.all([
      getTeamMembers(false),
      getAllProfiles()
    ]);
    setItems(teamRes.data || []);
    setProfiles((profilesRes.data || []).filter((p: any) => p.role !== "client"));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = (item: any) => {
    setForm({
      full_name: item.full_name, role: item.role || "", department: item.department || "",
      experience: item.experience || "", bio: item.bio || "", skills: item.skills || "",
      photo_url: item.photo_url || "", linkedin_url: item.linkedin_url || "",
      github_url: item.github_url || "", is_active: item.is_active, 
      is_visible: item.is_visible ?? true,
      display_order: item.display_order || 0,
      linked_user_id: item.linked_user_id || ""
    });
    setEditingId(item.id);
    setShowForm(true);
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team member?")) return;
    const { error } = await deleteTeamMember(id);
    if (error) {
      setMessage({ type: "error", text: "Failed to delete: " + error.message });
    } else {
      setMessage({ type: "success", text: "Team member deleted successfully." });
      loadData();
    }
  };

  const handleDelink = async (id: string) => {
    if (!confirm("Remove the link to user account for this member? They will no longer be able to manage their own profile.")) return;
    const { error } = await updateTeamMember(id, { linked_user_id: null });
    if (error) {
      setMessage({ type: "error", text: "Failed to delink: " + error.message });
    } else {
      setMessage({ type: "success", text: "User account delinked successfully." });
      loadData();
    }
  };

  const handleSave = async () => {
    const payload = { ...form, linked_user_id: form.linked_user_id === "" ? null : form.linked_user_id };
    let res;
    
    if (editingId) {
      res = await updateTeamMember(editingId, payload);
    } else {
      res = await createTeamMember(payload);
    }

    if (res.error) {
      setMessage({ type: "error", text: "Failed to save: " + res.error.message });
      return;
    }

    setMessage({ type: "success", text: "Team member saved successfully!" });
    setShowForm(false);
    setEditingId(null);
    setForm({
      full_name: "", role: "", department: "", experience: "",
      bio: "", skills: "", photo_url: "", linkedin_url: "", github_url: "",
      is_active: true, is_visible: true, display_order: 0, linked_user_id: ""
    });
    loadData();
    
    // Clear success message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
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
              setForm({ full_name: "", role: "", department: "", experience: "", bio: "", skills: "", photo_url: "", linkedin_url: "", github_url: "", is_active: true, is_visible: true, display_order: 0, linked_user_id: "" });
              setShowForm(!showForm);
              setMessage(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl transition-all"
          >
            {showForm ? <X size={16} /> : <PlusCircle size={16} />}
            {showForm ? "Cancel" : "Add Team Member"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          <span className="text-sm font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto opacity-50 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

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
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Link to User Profile (Optional)</label>
              <select value={form.linked_user_id} onChange={e => setForm({...form, linked_user_id: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B]">
                <option value="">No User Linked</option>
                {profiles.map(p => {
                  const isAlreadyLinked = items.some(item => item.linked_user_id === p.id && item.id !== editingId);
                  return (
                    <option key={p.id} value={p.id} disabled={isAlreadyLinked}>
                      {p.full_name || p.email} ({p.role}) {isAlreadyLinked ? "— [Already Linked]" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Role (Job Title)</label>
              <input type="text" value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="e.g. Graphic Designer, Web Developer" className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Department</label>
              <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B]">
                <option value="">Select...</option>
                <option value="Leadership">Leadership</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="WordPress">WordPress</option>
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
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 text-[#0D9488] border-[#E2E8F0] rounded" />
                <label htmlFor="is_active" className="text-sm font-medium text-[#0F172A]">Active (Staff Status)</label>
              </div>
              <div className="flex items-center gap-3">
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
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Dept</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Visibility</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id || i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#0F172A]">{item.full_name}</div>
                      {item.linked_user_id ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-[#0D9488] font-semibold bg-[#F0FDFA] px-1.5 py-0.5 rounded">
                            Linked: {item.profiles?.full_name || 'User Account'}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-[#94A3B8] italic mt-0.5">Not linked to any account</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">{item.role}</td>
                    <td className="py-3 px-4 text-[#64748B]">{item.department}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.is_visible ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {item.is_visible ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.is_active ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.linked_user_id && (
                          <button 
                            onClick={() => handleDelink(item.id)} 
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                            title="Delink User"
                          >
                            <X size={14} />
                          </button>
                        )}
                        <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-[#F0FDFA] text-[#0D9488] transition-colors" title="Edit Member"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#EF4444] transition-colors" title="Delete Member"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-6 text-gray-500">No team members found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

