"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Briefcase, Calendar, CheckSquare, Clock, Users, ArrowRight,
  TrendingUp, RefreshCw, Eye, X, BookOpen, AlertCircle
} from "lucide-react";
import { getMyProjects } from "@/app/project-actions";

type Project = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  health: string;
  start_date?: string;
  end_date?: string;
  progress: number;
  members?: Array<{
    user_id: string;
  }>;
  milestones?: Array<{
    id: string;
    title: string;
    is_completed: boolean;
    due_date?: string;
  }>;
};

export default function MyProjectsPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProj, setSelectedProj] = useState<Project | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getMyProjects();
      setProjects((data as unknown as Project[]) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getHealthColor = (health: string) => {
    if (health === "on_track") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (health === "at_risk") return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-rose-50 text-rose-700 border-rose-100";
  };

  const getPriorityColor = (prio: string) => {
    if (prio === "urgent") return "text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded";
    if (prio === "high") return "text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded";
    return "text-slate-500 bg-slate-50 px-2 py-0.5 rounded";
  };

  return (
    <div className="space-y-6 text-[#0F172A] font-sans">
      {/* Banner */}
      <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            <Briefcase size={18} className="text-[#0D9488]" /> Assigned Projects
          </h2>
          <p className="text-xs text-slate-500">Track and review delivery goals for your active client projects.</p>
        </div>
        <button onClick={loadData} className="p-1.5 hover:bg-slate-100 rounded text-slate-400">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Grid of Projects */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">Loading projects catalog...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed rounded-xl">
          <Briefcase size={28} className="text-slate-200 mx-auto mb-2" />
          <p className="text-xs text-slate-500">You are not currently assigned to any active project boards.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {projects.map(proj => (
            <div
              key={proj.id}
              onClick={() => { setSelectedProj(proj); setShowDetailModal(true); }}
              className="bg-white border rounded-xl p-5 hover:shadow-md hover:border-[#0D9488]/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-1 mb-3">
                  <h4 className="font-bold text-slate-800 leading-tight truncate">{proj.title}</h4>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded capitalize ${getPriorityColor(proj.priority)}`}>
                    {proj.priority}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4">{proj.description || "No project overview description provided."}</p>

                {/* Sprints progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                    <span>Sprints progress</span>
                    <span>{proj.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0D9488] rounded-full" style={{ width: `${proj.progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  <span>{proj.members?.length || 1} team members</span>
                </div>
                <span className="text-[#0D9488] font-semibold hover:underline flex items-center gap-0.5">
                  Milestones <ArrowRight size={11} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project details modal */}
      {showDetailModal && selectedProj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl border shadow-xl max-w-lg w-full h-[70vh] flex flex-col overflow-hidden text-xs">
            <div className="flex justify-between items-center p-4 border-b shrink-0 bg-slate-50">
              <h3 className="font-bold text-sm">
                Project Dashboard: {selectedProj.title}
              </h3>
              <button onClick={() => { setShowDetailModal(false); setSelectedProj(null); }} className="p-1 hover:bg-slate-100 rounded">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
                <div>
                  <span className="block text-slate-400 font-semibold text-[10px]">Sprint Scope</span>
                  <p className="text-slate-700 italic">"{selectedProj.description || 'No description provided.'}"</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div>
                    <span className="block text-slate-400 font-semibold text-[10px]">Start Date</span>
                    <span className="font-semibold text-slate-700">{selectedProj.start_date ? new Date(selectedProj.start_date).toLocaleDateString() : "—"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold text-[10px]">Delivery Deadline</span>
                    <span className="font-semibold text-slate-700">{selectedProj.end_date ? new Date(selectedProj.end_date).toLocaleDateString() : "—"}</span>
                  </div>
                </div>
              </div>

              {/* Milestones timeline */}
              <div>
                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-1"><Calendar size={13} /> Project Milestones</h4>
                <div className="space-y-2 border rounded-lg p-3 bg-white">
                  {!selectedProj.milestones || selectedProj.milestones.length === 0 ? (
                    <p className="text-slate-400 italic text-center py-4">No milestone stages configured for this board.</p>
                  ) : (
                    selectedProj.milestones.map(m => (
                      <div key={m.id} className="flex justify-between items-center border-b last:border-0 pb-2 last:pb-0">
                        <div>
                          <div className={`font-semibold ${m.is_completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{m.title}</div>
                          {m.due_date && <div className="text-[10px] text-slate-400">Due: {new Date(m.due_date).toLocaleDateString()}</div>}
                        </div>
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${m.is_completed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {m.is_completed ? 'Completed' : 'Active'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
