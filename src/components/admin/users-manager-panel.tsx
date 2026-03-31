"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, CheckCircle2, XCircle, Clock, Edit, Trash2, UserCog,
  RefreshCw, Search, Filter, ChevronDown, Shield, AlertCircle, Key
} from "lucide-react";
import {
  getAllProfiles, updateProfileStatus, updateProfileRole, deleteProfile, adminResetUserPassword
} from "@/app/certificate-actions";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  avatar_url?: string;
  created_at: string;
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
};

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  staff: "bg-blue-100 text-blue-700",
  client: "bg-[#F0FDFA] text-[#0D9488]",
};

export default function UsersManagerPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    const { data } = await getAllProfiles();
    setProfiles(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  const handleStatus = async (id: string, status: "active" | "rejected" | "pending") => {
    setActionLoading(id + status);
    await updateProfileStatus(id, status);
    await loadProfiles();
    setActionLoading(null);
  };

  const handleRole = async (id: string, role: "admin" | "staff" | "client") => {
    setActionLoading(id + role);
    await updateProfileRole(id, role);
    setEditingRole(null);
    await loadProfiles();
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    setActionLoading(id + "delete");
    await deleteProfile(id);
    await loadProfiles();
    setActionLoading(null);
  };

  const handleResetPassword = async (id: string, name: string) => {
    const newPassword = prompt(`Enter new password for ${name} (min 6 chars):`);
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    
    if (!confirm(`Are you sure you want to reset the password for ${name}?`)) return;

    setActionLoading(id + "reset");
    const { error } = await adminResetUserPassword(id, newPassword);
    if (error) {
      alert(`Failed to reset password: ${error.message}`);
    } else {
      alert("Password successfully reset!");
    }
    setActionLoading(null);
  };

  const filtered = profiles.filter(p => {
    const matchSearch = !search ||
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: profiles.length,
    pending: profiles.filter(p => p.status === "pending").length,
    active: profiles.filter(p => p.status === "active").length,
    rejected: profiles.filter(p => p.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: counts.total, color: "text-[#0F172A]", bg: "bg-white" },
          { label: "Pending Approval", value: counts.pending, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Active Users", value: counts.active, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Rejected", value: counts.rejected, color: "text-red-600", bg: "bg-red-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-[#E2E8F0] p-5`}>
            <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
            <div className="text-xs text-[#64748B] mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                className="pl-9 pr-4 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] w-52"
              />
            </div>
            <div className="flex gap-1">
              {(["all", "pending", "active", "rejected"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    statusFilter === s ? "bg-[#0D9488] text-white" : "bg-[#F0FDFA] text-[#64748B] hover:bg-[#CCFBF1]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={loadProfiles}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0] transition-all"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#64748B] text-sm">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={32} className="text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[#64748B] text-sm">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["User", "Role", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(profile => (
                  <tr key={profile.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                    {/* User Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0D9488]/10 flex items-center justify-center text-[#0D9488] font-bold text-sm shrink-0">
                          {profile.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-medium text-[#0F172A]">{profile.full_name || "—"}</div>
                          <div className="text-xs text-[#64748B]">{profile.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      {editingRole === profile.id ? (
                        <select
                          defaultValue={profile.role}
                          onChange={e => handleRole(profile.id, e.target.value as "admin" | "staff" | "client")}
                          onBlur={() => setEditingRole(null)}
                          className="text-xs border border-[#E2E8F0] rounded-lg px-2 py-1 focus:outline-none focus:border-[#0D9488]"
                          autoFocus
                        >
                          <option value="client">Client</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingRole(profile.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${roleColors[profile.role] || "bg-gray-100 text-gray-700"}`}
                        >
                          {profile.role}
                          <ChevronDown size={10} />
                        </button>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[profile.status] || "bg-gray-100 text-gray-700"}`}>
                        {profile.status}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="py-3 px-4 text-xs text-[#64748B]">
                      {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {profile.status !== "active" && (
                          <button
                            onClick={() => handleStatus(profile.id, "active")}
                            disabled={!!actionLoading}
                            title="Approve"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        {profile.status !== "rejected" && (
                          <button
                            onClick={() => handleStatus(profile.id, "rejected")}
                            disabled={!!actionLoading}
                            title="Reject"
                            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                        {profile.status !== "pending" && (
                          <button
                            onClick={() => handleStatus(profile.id, "pending")}
                            disabled={!!actionLoading}
                            title="Set Pending"
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors disabled:opacity-50"
                          >
                            <Clock size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleResetPassword(profile.id, profile.full_name || profile.email)}
                          disabled={!!actionLoading}
                          title="Reset Password"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                          <Key size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(profile.id)}
                          disabled={!!actionLoading}
                          title="Delete User"
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
