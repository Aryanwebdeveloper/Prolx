"use client";

import { useState, useEffect } from "react";
import { Save, Lock } from "lucide-react";
import { getSiteSettings, updateSiteSettings } from "@/app/settings-actions";
import { createClient } from "../../../supabase/client";

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Record<string, any>>({
    site_name: "Prolx CMS",
    contact_email: "contact@prolx.com",
    contact_phone: "+1 (555) 123-4567",
    address: "123 Tech Lane, Innovation City, TC 90210",
    seo_description: "We build digital experiences that drive growth.",
    facebook_url: "",
    twitter_url: "",
    linkedin_url: "",
    instagram_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function loadData() {
      const { data } = await getSiteSettings();
      if (data && Object.keys(data).length > 0) {
        setSettings(prev => ({ ...prev, ...data }));
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    await updateSiteSettings(settings);
    setSaving(false);
    alert("Settings saved successfully!");
  };

  const handleUpdatePassword = async () => {
    if (password.length < 6) {
      setPasswordMessage({ text: "Password must be at least 6 characters.", type: "error" });
      return;
    }
    if (password !== confirmPassword) {
      setPasswordMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }
    
    setUpdatingPassword(true);
    setPasswordMessage({ text: "", type: "" });
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      setPasswordMessage({ text: error.message, type: "error" });
    } else {
      setPasswordMessage({ text: "Password updated successfully!", type: "success" });
      setPassword("");
      setConfirmPassword("");
    }
    setUpdatingPassword(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <h2 className="font-bold text-[#0F172A] text-xl mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          General Settings
        </h2>
        <p className="text-sm text-[#64748B] mb-6">Manage global website configurations, SEO, and contact details.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-[#0F172A] border-b pb-2">Site Information</h3>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Site Name</label>
              <input type="text" name="site_name" value={settings.site_name || ""} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Default SEO Description</label>
              <textarea name="seo_description" rows={3} value={settings.seo_description || ""} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-[#0F172A] border-b pb-2">Contact Details</h3>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Contact Email</label>
              <input type="email" name="contact_email" value={settings.contact_email || ""} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Phone Number</label>
              <input type="text" name="contact_phone" value={settings.contact_phone || ""} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Office Address</label>
              <textarea name="address" rows={2} value={settings.address || ""} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none" />
            </div>
          </div>

          <div className="space-y-4 md:col-span-2">
            <h3 className="font-semibold text-[#0F172A] border-b pb-2">Social Links</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">LinkedIn Profile</label>
                <input type="url" name="linkedin_url" value={settings.linkedin_url || ""} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Twitter / X</label>
                <input type="url" name="twitter_url" value={settings.twitter_url || ""} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Facebook Page</label>
                <input type="url" name="facebook_url" value={settings.facebook_url || ""} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Instagram Profile</label>
                <input type="url" name="instagram_url" value={settings.instagram_url || ""} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-opacity-70 text-white font-semibold rounded-xl text-sm transition-all"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 max-w-xl">
        <h2 className="font-bold text-[#0F172A] text-xl mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          Security
        </h2>
        <p className="text-sm text-[#64748B] mb-6">Update your account password securely.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">New Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" 
            />
          </div>
          {passwordMessage.text && (
            <p className={`text-sm ${passwordMessage.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
              {passwordMessage.text}
            </p>
          )}
          <div className="pt-2">
            <button 
              onClick={handleUpdatePassword} 
              disabled={updatingPassword}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0F172A] hover:bg-black disabled:opacity-70 text-white font-semibold rounded-xl text-sm transition-all"
            >
              <Lock size={16} /> {updatingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
