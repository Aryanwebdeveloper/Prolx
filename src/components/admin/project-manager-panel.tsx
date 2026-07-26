"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Briefcase, Plus, Search, Filter, RefreshCw, LayoutGrid, List,
  Calendar, CheckSquare, DollarSign, Clock, Users, ArrowRight, X,
  Trash2, Edit, CheckSquare as CheckSquareIcon, AlertCircle
} from "lucide-react";
import {
  getProjects, createProject, updateProject, deleteProject, getProjectStats
} from "@/app/project-actions";
import { getAllProfiles } from "@/app/certificate-actions";

type Project = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  health: string;
  client_id?: string;
  project_manager_id?: string;
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  budget?: number;
  budget_currency: string;
  actual_cost?: number;
  progress: number;
  tags?: string[];
  project_manager?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  client?: {
    id: string;
    full_name: string;
    email: string;
  };
  members?: Array<{
    user_id: string;
    role: string;
    user: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
  }>;
  milestones?: Array<{
    id: string;
    title: string;
    is_completed: boolean;
    due_date?: string;
  }>;
};

type Profile = { id: string; full_name: string; email: string; role: string; };

export default function ProjectManagerPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState({
    total: 0, active: 0, completed: 0, planning: 0, onHold: 0, atRisk: 0, behind: 0
  });

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", status: "planning", priority: "medium",
    start_date: "", end_date: "", budget: 0, project_manager_id: "",
    memberIds: [] as string[]
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, profsRes, statsRes] = await Promise.all([
        getProjects(),
        getAllProfiles(),
        getProjectStats()
      ]);
      setProjects((projRes.data as Project[]) || []);
      setProfiles((profsRes.data as Profile[]) || []);
      if (statsRes.data) setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createProject(form);
      setShowCreateModal(false);
      setForm({
        title: "", description: "", status: "planning", priority: "medium",
        start_date: "", end_date: "", budget: 0, project_manager_id: "",
        memberIds: []
      });
      await loadData();
    } catch (err) {
      alert("Failed to create project: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (projectId: string, newStatus: string) => {
    try {
      await updateProject(projectId, { status: newStatus });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(projectId);
      await loadData();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    }
  };

  const filtered = projects.filter(p => {
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getHealthColor = (health: string) => {
    if (health === "on_track") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (health === "at_risk") return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-rose-100 text-rose-800 border-rose-200";
  };

  const getPriorityColor = (prio: string) => {
    if (prio === "urgent") return "bg-rose-50 text-rose-600 border-rose-100";
    if (prio === "high") return "bg-orange-50 text-orange-600 border-orange-100";
    return "bg-slate-50 text-slate-600 border-slate-100";
  };

  const columns = [
    { label: "Planning", id: "planning" },
    { label: "Active", id: "active" },
    { label: "On Hold", id: "on_hold" },
    { label: "Completed", id: "completed" }
  ];

  return (
    <div className="space-y-6 text-[#0F172A]">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Projects", value: stats.total, color: "text-[#0F172A]" },
          { label: "Active Sprints", value: stats.active, color: "text-blue-600" },
          { label: "Completed", value: stats.completed, color: "text-emerald-600" },
          { label: "At Risk / Behind", value: stats.atRisk + stats.behind, color: "text-rose-500" },
          { label: "On Hold", value: stats.onHold, color: "text-slate-500" }
        ].map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="text-xs text-slate-500">{card.label}</div>
            <div className={`text-2xl font-bold font-mono mt-1 ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Main Header / Actions Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Workspace Project Boards
          </h2>
          <p className="text-xs text-slate-500">
            Define sprint milestones, budgets, track task delivery sprint speed, and assign cross-functional teams.
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded ${viewMode === "kanban" ? "bg-white shadow text-[#0D9488]" : "text-slate-500"}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${viewMode === "list" ? "bg-white shadow text-[#0D9488]" : "text-slate-500"}`}
            >
              <List size={15} />
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            <Plus size={14} /> Create Board / Project
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3 shadow-sm">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:border-[#0D9488]"
          />
        </div>
        <div>
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-transparent focus:outline-none focus:border-[#0D9488]"
          >
            <option value="all">All Boards</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button onClick={loadData} className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-600">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Reload
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {columns.map(col => {
            const colProjects = filtered.filter(p => p.status === col.id);
            return (
              <div key={col.id} className="bg-slate-50 p-4 rounded-xl border space-y-4 min-h-[500px]">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-xs text-slate-700">{col.label}</span>
                  <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full font-bold">{colProjects.length}</span>
                </div>

                <div className="space-y-3">
                  {colProjects.map(proj => (
                    <div
                      key={proj.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200 space-y-3.5 text-xs relative group"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-bold text-slate-800 leading-tight group-hover:text-[#0D9488] transition-colors">{proj.title}</span>
                        <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] border font-bold capitalize shrink-0 ${getPriorityColor(proj.priority)}`}>
                          {proj.priority}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{proj.description || "No project overview details set."}</p>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                          <span>Sprints Velocity</span>
                          <span>{proj.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#0D9488] rounded-full" style={{ width: `${proj.progress}%` }} />
                        </div>
                      </div>

                      {/* Members */}
                      <div className="flex items-center justify-between border-t pt-3 mt-3">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {proj.members?.slice(0, 3).map((m, i) => (
                            <div key={i} className="w-6 h-6 rounded-full border border-white overflow-hidden bg-slate-100 flex items-center justify-center text-[8px] font-bold">
                              {m.user?.avatar_url ? (
                                <img src={m.user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                m.user?.full_name?.charAt(0).toUpperCase()
                              )}
                            </div>
                          ))}
                          {proj.members && proj.members.length > 3 && (
                            <div className="w-6 h-6 rounded-full border border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                              +{proj.members.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-1 hover:bg-slate-100 rounded text-rose-500"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && !loading && (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No project boards matching.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Board Name</th>
                    <th className="py-3 px-4">Sprint Progress</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Manager</th>
                    <th className="py-3 px-4">End Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(proj => (
                    <tr key={proj.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-800">{proj.title}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                            <div className="h-full bg-[#0D9488] rounded-full" style={{ width: `${proj.progress}%` }} />
                          </div>
                          <span className="font-mono text-[10px] text-slate-500">{proj.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-1.5 py-0.5 rounded border text-[10px] font-bold capitalize ${getPriorityColor(proj.priority)}`}>
                          {proj.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {proj.project_manager?.full_name || "Unassigned"}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {proj.end_date ? new Date(proj.end_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1 hover:bg-slate-100 rounded text-rose-500"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border shadow-xl max-w-lg w-full overflow-hidden text-xs">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-sm">Create Sprint Board / Project</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block font-semibold mb-1">Project/Board Name *</label>
                <input
                  type="text" required placeholder="e.g. Redesign Agency Website"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Sprint Overview Details</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Outline key sprint timelines, objectives, and deliverables..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] min-h-16"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Project Manager</label>
                  <select
                    value={form.project_manager_id}
                    onChange={e => setForm(f => ({ ...f, project_manager_id: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="">-- Select Manager --</option>
                    {profiles
                      .filter(p => p.role === 'admin' || p.role === 'project_manager')
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.full_name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Board Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Estimated End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Multi-select Members */}
              <div>
                <label className="block font-semibold mb-1">Sprint Members *</label>
                <div className="max-h-24 overflow-y-auto border rounded p-2 space-y-1 bg-slate-50/50">
                  {profiles
                    .filter(p => p.role !== 'client')
                    .map(p => {
                      const isChecked = form.memberIds.includes(p.id);
                      return (
                        <label key={p.id} className="flex items-center gap-2 py-0.5 hover:bg-slate-100/50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setForm(f => ({
                                ...f,
                                  memberIds: isChecked ? f.memberIds.filter(x => x !== p.id) : [...f.memberIds, p.id]
                              }));
                            }}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span>{p.full_name} ({p.role})</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg font-semibold">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#0D9488] text-white font-semibold rounded-lg hover:bg-[#0F766E] disabled:opacity-50"
                >
                  {saving ? "Creating Sprint..." : "Create Sprint Board"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
