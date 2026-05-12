"use client";

import { useState, useEffect } from "react";
import { Save, User, AlertCircle, CheckCircle } from "lucide-react";
import { getMyProfile, updateMyProfile } from "@/app/profile-actions";
import { ImageUpload } from "../ui/image-upload";

export default function MyAccountPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [form, setForm] = useState({
    full_name: "",
    bio: "",
    avatar_url: ""
  });

  const loadProfile = async () => {
    setLoading(true);
    const { data, error } = await getMyProfile();
    if (data) {
      setForm({
        full_name: data.full_name || "",
        bio: data.bio || "",
        avatar_url: data.avatar_url || ""
      });
    }
    setLoading(false);
  };

  useEffect(() => { loadProfile(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    const { error } = await updateMyProfile(form);
    
    if (error) {
      setMessage({ type: "error", text: "Failed to update account. " + error.message });
    } else {
      setMessage({ type: "success", text: "Your account details have been updated successfully!" });
      loadProfile();
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-[#64748B]">Loading your account...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-[#0D9488]/10 flex items-center justify-center text-[#0D9488]">
              <User size={24} />
           </div>
           <div>
              <h2 className="font-bold text-[#0F172A] text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                My Account
              </h2>
              <p className="text-sm text-[#64748B]">Manage your basic profile information and avatar.</p>
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
        {/* Left Column: Avatar */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-3">Profile Photo</label>
            <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
              This photo will be used across the application. If you are a team member, this photo will automatically sync to your public team card.
            </p>
            <ImageUpload
              value={form.avatar_url}
              onChange={(url) => setForm({ ...form, avatar_url: url })}
              onRemove={() => setForm({ ...form, avatar_url: "" })}
              bucket="avatars"
              aspectRatio="square"
              label="Upload Avatar"
            />
          </div>
        </div>

        {/* Right Columns: Details */}
        <div className="lg:col-span-2 space-y-6">
           <div className="grid md:grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Full Name</label>
                <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Personal Bio</label>
                <textarea rows={4} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Tell us a little about yourself..." className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none" />
                <p className="text-xs text-[#64748B] mt-2">If you are a team member, this bio will be featured on your team card.</p>
              </div>
           </div>

           <div className="flex justify-end pt-4 border-t border-[#F8FAFC]">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-[#0D9488]/20 disabled:opacity-50"
              >
                {saving ? "Saving..." : <><Save size={18} /> Update Account</>}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
