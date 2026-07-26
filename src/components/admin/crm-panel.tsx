"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Plus, X, Search, RefreshCw, Phone, Globe, Mail,
  Building2, Star, CheckCircle, Clock, Eye
} from "lucide-react";
import { createClient } from "../../../supabase/client";

type Client = {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: string;
  status: string;
  created_at: string;
  // extended CRM fields (from extended_profiles if exists)
  company?: string;
  phone?: string;
  website?: string;
  notes?: string;
};

type Project = {
  id: string;
  title: string;
  status: string;
  client_id: string;
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active:   { bg: "#F0FDF4", text: "#16A34A" },
  inactive: { bg: "#F8FAFC", text: "#64748B" },
};

export default function CRMPanel() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const [{ data: clientData }, { data: projectData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("role", "client").order("created_at", { ascending: false }),
        supabase.from("projects").select("id, title, status, client_id"),
      ]);
      setClients(clientData || []);
      setProjects(projectData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = clients.filter(c =>
    !search ||
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const getClientProjects = (clientId: string) =>
    projects.filter(p => p.client_id === clientId);

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setShowDetailModal(true);
  };

  const clientProjects = selectedClient ? getClientProjects(selectedClient.id) : [];

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === "active").length,
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === "active").length,
  };

  return (
    <div className="space-y-5 text-xs">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-slate-800 text-base" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Client CRM
          </h2>
          <p className="text-slate-400 text-[11px]">Manage your client relationships, projects, and communication history</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 border rounded-lg font-semibold text-slate-500 hover:bg-slate-50">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Clients", value: stats.totalClients, icon: Users, color: "#0D9488" },
          { label: "Active Clients", value: stats.activeClients, icon: CheckCircle, color: "#10B981" },
          { label: "Total Projects", value: stats.totalProjects, icon: Star, color: "#3B82F6" },
          { label: "Active Projects", value: stats.activeProjects, icon: Clock, color: "#F97316" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] text-slate-500 font-semibold">{card.label}</p>
                <p className="text-2xl font-bold font-mono mt-1" style={{ color: card.color }}>{card.value}</p>
              </div>
              <card.icon size={18} style={{ color: card.color }} className="opacity-50 mt-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2 bg-white border rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 border rounded-lg px-3 py-1.5 flex-1 min-w-[200px]">
          <Search size={12} className="text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search clients by name or email..."
            className="bg-transparent outline-none w-full"
          />
        </div>
      </div>

      {/* Client Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading CRM data...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-xl py-16 text-center">
          <Users size={28} className="text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400">No clients found. Add client accounts from User Access management.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(client => {
            const clientProjCount = getClientProjects(client.id).length;
            const sc = STATUS_COLORS[client.status] || STATUS_COLORS.inactive;
            return (
              <div
                key={client.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleViewClient(client)}
              >
                <div className="flex gap-3 items-start mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {client.avatar_url ? (
                      <img src={client.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : client.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{client.full_name}</h3>
                    <p className="text-slate-400 truncate">{client.email}</p>
                  </div>
                  <span
                    className="shrink-0 text-[9px] font-bold capitalize px-1.5 py-0.5 rounded"
                    style={{ background: sc.bg, color: sc.text }}
                  >
                    {client.status}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t pt-3 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Star size={11} />
                    {clientProjCount} project{clientProjCount !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1 text-[#0D9488] font-semibold">
                    <Eye size={11} /> View Profile
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Client Detail Modal */}
      {showDetailModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full text-xs overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-slate-50">
              <h3 className="font-bold text-sm">Client Profile: {selectedClient.full_name}</h3>
              <button onClick={() => setShowDetailModal(false)}><X size={16} /></button>
            </div>

            <div className="p-5 space-y-4">
              {/* Client info */}
              <div className="flex gap-4 items-center pb-3 border-b">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center text-white font-bold text-xl shrink-0">
                  {selectedClient.avatar_url ? (
                    <img src={selectedClient.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : selectedClient.full_name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{selectedClient.full_name}</h4>
                  <p className="text-slate-500">{selectedClient.email}</p>
                  <p className="text-slate-400 capitalize mt-0.5">{selectedClient.status} client</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-50 rounded-lg p-3">
                  <span className="text-slate-400 font-semibold">Member Since</span>
                  <p className="font-bold text-slate-700 mt-1">{new Date(selectedClient.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <span className="text-slate-400 font-semibold">Total Projects</span>
                  <p className="font-bold text-slate-700 mt-1">{clientProjects.length}</p>
                </div>
              </div>

              {/* Client projects list */}
              {clientProjects.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-700 mb-2">Active Projects</h4>
                  <div className="space-y-2">
                    {clientProjects.map(proj => (
                      <div key={proj.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                        <span className="font-semibold text-slate-700">{proj.title}</span>
                        <span className={`text-[9px] font-bold capitalize px-2 py-0.5 rounded ${proj.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {proj.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full py-2 border rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
