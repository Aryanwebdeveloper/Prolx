"use client";

import { useState, useEffect } from "react";
import { Save, User, Globe, AlertCircle, CheckCircle, Info } from "lucide-react";
import { getMyTeamProfile, updateTeamMember } from "@/app/team-actions";
import { ImageUpload } from "../ui/image-upload";

export default function MyTeamProfilePanel() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [form, setForm] = useState({
    full_name: "", role: "", department: "", experience: "",
    bio: "", skills: "", photo_url: "", linkedin_url: "", github_url: "",
    is_active: true
  });

  const loadProfile = async () => {
    setLoading(true);
    const { data, error } = await getMyTeamProfile();
    if (data) {
      setProfile(data);
      setForm({
        full_name: data.full_name || "",
        role: data.role || "",
        department: data.department || "",
        experience: data.experience || "",
        bio: data.bio || "",
        skills: Array.isArray(data.skills) ? data.skills.join(", ") : (data.skills || ""),
        photo_url: data.photo_url || "",
        linkedin_url: data.linkedin_url || "",
        github_url: data.github_url || "",
        is_active: data.is_active
      });
    }
    setLoading(false);
  };

  useEffect(() => { loadProfile(); }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    
    const payload = {
      ...form,
      // Admin-only fields are NOT included here to prevent staff from overriding them
      // is_visible and display_order and user_id are managed by admin
    };

    const { error } = await updateTeamMember(profile.id, payload);
    
    if (error) {
      setMessage({ type: "error", text: "Failed to update profile. " + error.message });
    } else {
      setMessage({ type: "success", text: "Your profile has been updated successfully!" });
      loadProfile();
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-[#64748B]">Loading your team profile...</div>;

  if (!profile) return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
      <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>No Team Profile Linked</h2>
      <p className="text-[#64748B] text-sm max-w-md mx-auto mb-6">
        Your user account is not yet linked to a team member profile. Please contact an administrator to link your account so you can manage your public profile.
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-[#0D9488]/10 flex items-center justify-center text-[#0D9488]">
                <User size={24} />
             </div>
             <div>
                <h2 className="font-bold text-[#0F172A] text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  My Team Profile
                </h2>
                <p className="text-sm text-[#64748B]">Manage how you appear on the public "Our Team" page.</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${profile.is_visible ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {profile.is_visible ? "Visible on Site" : "Hidden by Admin"}
             </span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 grid lg:grid-cols-3 gap-8">
        {/* Left Column: Status */}
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-100 rounded-xl mb-4">
             <User size={16} className="text-teal-600 shrink-0 mt-0.5" />
             <p className="text-[11px] text-teal-700 leading-relaxed">
                <strong>Profile Sync Active:</strong> Your Photo, Name, and Bio are automatically pulled from your <span className="font-bold cursor-pointer" onClick={() => document.getElementById('my-account-tab')?.click()}>My Account</span> settings. Update them there to see changes here.
             </p>
          </div>
          
          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-3">
               <label htmlFor="staff_active" className="text-sm font-semibold text-[#0F172A]">Presence Status</label>
               <div className={`w-2 h-2 rounded-full ${form.is_active ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
            </div>
            <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
              Toggle your active status. When inactive, you will be hidden from the website automatically.
            </p>
            <button
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${form.is_active ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-gray-50"}`}
            >
              {form.is_active ? "Set as Inactive" : "Set as Active"}
            </button>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
             <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
             <p className="text-[11px] text-blue-700 leading-relaxed">
                <strong>Note:</strong> Even if you are active, an administrator can still choose to hide your profile from the public website for maintenance or structural reasons.
             </p>
          </div>
        </div>

        {/* Right Columns: Details */}
        <div className="lg:col-span-2 space-y-6">
           <div className="md:col-span-2 space-y-1.5">
               <label className="block text-sm font-medium text-[#0F172A]">Profile Photo</label>
               <ImageUpload
                 value={form.photo_url}
                 onChange={(url) => setForm({ ...form, photo_url: url })}
                 onRemove={() => setForm({ ...form, photo_url: "" })}
                 bucket="avatars"
                 aspectRatio="square"
                 label="Update Your Photo"
               />
               <p className="text-[10px] text-[#64748B]">This photo will be displayed on the public team page and your internal profile.</p>
           </div>

           <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Full Name</label>
                <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Your full professional name" className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Role / Job Title</label>
                <input type="text" value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="e.g. Senior Web Developer" className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Department</label>
                <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B]">
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
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Experience</label>
                <input type="text" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} placeholder="e.g. 5+ Years" className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
              </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Professional Bio</label>
              <textarea rows={3} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Write a short professional bio for the website..." className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none" />
           </div>

           <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Key Skills (comma-separated)</label>
              <input type="text" value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} placeholder="e.g. React, Next.js, TypeScript, UI/UX" className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
           </div>

           <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-[#F8FAFC]">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5 flex items-center gap-2"><Globe size={14} className="text-[#0D9488]" /> LinkedIn Profile URL</label>
                <input type="text" value={form.linkedin_url} onChange={e => setForm({...form, linkedin_url: e.target.value})} placeholder="https://linkedin.com/in/username" className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5 flex items-center gap-2"><Globe size={14} className="text-[#0D9488]" /> GitHub Profile URL</label>
                <input type="text" value={form.github_url} onChange={e => setForm({...form, github_url: e.target.value})} placeholder="https://github.com/username" className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
              </div>
           </div>

           <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-[#0D9488]/20 disabled:opacity-50"
              >
                {saving ? "Saving Changes..." : <><Save size={18} /> Save Team Profile</>}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
