"use client";

import { useState, useEffect } from "react";
import { Award, User, LogOut, ExternalLink, Copy, Check, Menu, X, Receipt, FileSignature, Lock } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserCertificates, getUserProfile, updateProfile } from "@/app/certificate-actions";
import { formatCertDate, getCertStatus } from "@/lib/certificates";
import { ImageUpload } from "../ui/image-upload";
import { updateProfileAvatar } from "@/app/image-actions";
import ClientInvoicePanel from "@/components/client/client-invoice-panel";
import ClientLetterPanel from "@/components/client/client-letter-panel";
import Image from "next/image";

type Certificate = {
  id: string;
  title: string;
  description?: string;
  recipient_name: string;
  issue_date: string;
  expiry_date?: string;
  status: string;
  category: string;
  issued_by: string;
};

type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
};

const statusColors = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-gray-100 text-gray-600",
  expired: "bg-orange-100 text-orange-700",
};

export default function ClientDashboard({ user }: { user: SupabaseUser }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("invoices");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: "", type: "" });

  const router = useRouter();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [profileRes, certsRes] = await Promise.all([
        getUserProfile(user.id),
        getUserCertificates(user.id),
      ]);
      setProfile(profileRes.data as Profile);
      setCerts((certsRes.data as Certificate[]) || []);
      setLoading(false);
    }
    load();
  }, [user.id]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

  const navItems = [
    { icon: Receipt, label: "My Invoices", id: "invoices" },
    { icon: FileSignature, label: "My Documents", id: "documents" },
    { icon: Award, label: "My Certificates", id: "certificates" },
    { icon: User, label: "My Profile", id: "profile" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0D9488] flex items-center justify-center">
              <span className="text-white font-bold text-sm font-mono">Px</span>
            </div>
            <span className="text-white font-bold text-lg" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Client Portal
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="px-3 py-4">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-[#0D9488]/20 text-[#2DD4BF]`}>
            {profile?.role || "client"}
          </div>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto px-3 space-y-1">
          {navItems.map(({ icon: Icon, label, id }) => (
            <button
              key={id}
              onClick={() => { setActive(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-colors ${
                active === id
                  ? "bg-[#0D9488] text-white"
                  : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center text-white font-bold text-xs">
              {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{profile?.full_name || user.email}</p>
              <p className="text-[#64748B] text-xs capitalize">Client</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#94A3B8] hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#64748B]">
              <Menu size={22} />
            </button>
            <h1 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              {navItems.find(n => n.id === active)?.label || "Dashboard"}
            </h1>
          </div>
          <Link href="/" className="text-xs text-[#64748B] hover:text-[#0D9488] transition-colors">← Back to Website</Link>
        </header>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#64748B] text-sm">Loading your dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              {active === "invoices" && (
                <ClientInvoicePanel userId={user.id} />
              )}
              {active === "documents" && (
                <ClientLetterPanel userId={user.id} />
              )}
              {active === "certificates" && (
                <div className="space-y-6">
                   {/* Certificates List */}
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
                    <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center">
                      <h2 className="font-bold text-[#0F172A] text-lg" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        My Certificates
                      </h2>
                      <span className="text-sm text-[#64748B] bg-[#F8FAFC] px-3 py-1 rounded-full border border-[#E2E8F0]">{certs.length} Total</span>
                    </div>
                    {certs.length === 0 ? (
                      <div className="p-12 text-center">
                        <Award size={32} className="text-[#CBD5E1] mx-auto mb-3" />
                        <p className="text-[#64748B] text-sm">You don't have any certificates yet.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#F8FAFC]">
                        {certs.map(cert => {
                          const computed = getCertStatus(cert.status, cert.expiry_date);
                          return (
                            <div key={cert.id} className="p-5 hover:bg-[#F8FAFC] transition-colors">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[computed]}`}>
                                      {computed}
                                    </span>
                                    <span className="text-xs text-[#94A3B8]">{cert.category}</span>
                                  </div>
                                  <h3 className="font-semibold text-[#0F172A] mb-1">{cert.title}</h3>
                                  <p className="text-xs text-[#64748B]">
                                    Issued: {formatCertDate(cert.issue_date)}
                                    {cert.expiry_date && ` · Expires: ${formatCertDate(cert.expiry_date)}`}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono text-xs text-[#0D9488] bg-[#F0FDFA] px-2.5 py-1 rounded-lg">{cert.id}</span>
                                  <button onClick={() => handleCopyId(cert.id)} className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0D9488] hover:bg-[#F0FDFA] transition-colors" title="Copy ID">
                                    {copiedId === cert.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                  </button>
                                  <a href={`/certificates/${cert.id}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0D9488] hover:bg-[#F0FDFA] transition-colors" title="View Verification Page">
                                    <ExternalLink size={14} />
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {active === "profile" && (
                <div className="max-w-xl space-y-6">
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                    <h2 className="font-bold text-[#0F172A] text-lg mb-6" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>My Profile</h2>
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#0D9488] to-[#14B8A6] flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-sm">
                          {profile?.avatar_url ? (
                            <Image 
                              src={profile.avatar_url} 
                              alt={profile.full_name || "Avatar"} 
                              fill 
                              className="object-cover"
                            />
                          ) : (
                            profile?.full_name?.charAt(0)?.toUpperCase() || "?"
                          )}
                        </div>
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-bold text-[#0F172A] text-xl mb-1">{profile?.full_name || "—"}</h3>
                        <p className="text-sm text-[#64748B] mb-4">{user.email}</p>
                        
                        <div className="max-w-[200px] mx-auto sm:mx-0">
                          <ImageUpload
                            value={profile?.avatar_url}
                            bucket="avatars"
                            label="Change Photo"
                            aspectRatio="square"
                            onChange={async (url) => {
                              if (profile) {
                                setProfile({ ...profile, avatar_url: url });
                                await updateProfile(user.id, { avatar_url: url });
                              }
                            }}
                            onRemove={async () => {
                              if (profile) {
                                setProfile({ ...profile, avatar_url: "" });
                                await updateProfile(user.id, { avatar_url: "" });
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: "Full Name", value: profile?.full_name },
                        { label: "Email", value: user.email },
                        { label: "Member Since", value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : undefined },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center py-3 border-b border-[#F8FAFC] last:border-0">
                          <span className="text-sm text-[#64748B]">{label}</span>
                          <span className="text-sm font-medium text-[#0F172A] capitalize">{value || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 max-w-xl">
                    <h2 className="font-bold text-[#0F172A] text-lg mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      Security Settings
                    </h2>
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
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
