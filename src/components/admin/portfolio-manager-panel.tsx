"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Save, X, BookOpen, ExternalLink, Globe } from "lucide-react";
import { getPortfolioProjects, createPortfolioProject, updatePortfolioProject, deletePortfolioProject } from "@/app/portfolio-actions";
import { ImageUpload } from "../ui/image-upload";
import CaseStudyEditor from "./case-study-editor";
import { toast } from "sonner";

export default function PortfolioManagerPanel() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [managingCaseStudy, setManagingCaseStudy] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: "", client: "", category: "", industry: "", 
    tech_stack: "", featured_image_url: "", summary: "",
    slug: "", short_description: "",
    live_url: "", github_url: "",
    is_featured: false, display_order: 0
  });

  const loadData = async () => {
    setLoading(true);
    const { data } = await getPortfolioProjects();
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = (item: any) => {
    setForm({
      name: item.name, client: item.client || "", category: item.category || "",
      industry: item.industry || "", tech_stack: item.tech_stack || "",
      featured_image_url: item.featured_image_url || "", summary: item.summary || "",
      slug: item.slug || "", short_description: item.short_description || "",
      live_url: item.live_url || "", github_url: item.github_url || "",
      is_featured: item.is_featured || false, display_order: item.display_order || 0
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project? This will also delete any associated case study.")) return;
    await deletePortfolioProject(id);
    loadData();
    toast.success("Project deleted.");
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Project name is required.");
      return;
    }
    
    if (editingId) {
      await updatePortfolioProject(editingId, form);
      toast.success("Project updated.");
    } else {
      await createPortfolioProject(form);
      toast.success("Project created.");
    }
    setShowForm(false);
    setEditingId(null);
    setForm({
      name: "", client: "", category: "", industry: "", 
      tech_stack: "", featured_image_url: "", summary: "",
      slug: "", short_description: "",
      live_url: "", github_url: "",
      is_featured: false, display_order: 0
    });
    loadData();
  };

  if (managingCaseStudy) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 min-h-[500px]">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F1F5F9]">
          <h2 className="font-bold text-[#0F172A] text-2xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Case Study Editor
          </h2>
          <button 
            onClick={() => { setManagingCaseStudy(null); loadData(); }}
            className="p-2 hover:bg-[#F8FAFC] rounded-lg text-[#64748B] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <CaseStudyEditor project={managingCaseStudy} onClose={() => { setManagingCaseStudy(null); loadData(); }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-[#0F172A] text-2xl flex items-center gap-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              <Globe className="text-[#0D9488]" size={24} />
              Portfolio Manager
            </h2>
            <p className="text-sm text-[#64748B] mt-1">Showcase your best "Projects That Speak for Themselves".</p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", client: "", category: "", industry: "", tech_stack: "", featured_image_url: "", summary: "", slug: "", short_description: "", live_url: "", github_url: "", is_featured: false, display_order: 0 });
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#0D9488]/20"
          >
            {showForm ? <X size={18} /> : <PlusCircle size={18} />}
            {showForm ? "Cancel" : "Add Project"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#CCFBF1] p-8 border-l-4 border-l-[#0D9488] shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-bold text-[#0F172A] text-lg mb-6 flex items-center gap-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            {editingId ? <Edit size={20} className="text-[#0D9488]" /> : <PlusCircle size={20} className="text-[#0D9488]" />}
            {editingId ? "Edit Project Details" : "Create New Project Entry"}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Project Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all" placeholder="e.g. FinEdge Banking App" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Client Name</label>
                <input type="text" value={form.client} onChange={e => setForm({...form, client: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">URL Slug (leave empty to auto-generate)</label>
                <input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all placeholder:text-gray-300" placeholder="finedge-app" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] focus:ring-2 focus:ring-[#0D9488]/20 outline-none">
                  <option value="">Select Category...</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="Web Application">Web Application</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="SaaS Solution">SaaS Solution</option>
                  <option value="Digital Transformation">Digital Transformation</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Industry</label>
                <input type="text" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0D9488]/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Tech Stack (comma-separated)</label>
                <input type="text" value={form.tech_stack} onChange={e => setForm({...form, tech_stack: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0D9488]/20 outline-none" placeholder="React, Node.js, Supabase" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Live Application URL</label>
                <input type="url" value={form.live_url} onChange={e => setForm({...form, live_url: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0D9488]/20 outline-none" placeholder="https://app.prolx.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">GitHub Repository URL</label>
                <input type="url" value={form.github_url} onChange={e => setForm({...form, github_url: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0D9488]/20 outline-none" placeholder="https://github.com/..." />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#0F172A]">Featured Image (16:9 recommended)</label>
                <ImageUpload
                  value={form.featured_image_url}
                  onChange={(url) => setForm({ ...form, featured_image_url: url })}
                  onRemove={() => setForm({ ...form, featured_image_url: "" })}
                  bucket="portfolio-images"
                  aspectRatio="video"
                  label="Click to upload & crop"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Short Highlight (e.g. "Banking Redefined")</label>
                <input type="text" value={form.short_description} onChange={e => setForm({...form, short_description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0D9488]/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Brief Summary</label>
                <textarea rows={3} value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0D9488]/20 outline-none resize-none" placeholder="Enter a brief overview of the project..." />
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_featured" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} className="w-5 h-5 accent-[#0D9488] border-[#E2E8F0] rounded-lg" />
                <label htmlFor="is_featured" className="text-sm font-bold text-[#0F172A]">High Priority Feature</label>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-[#0F172A]">Sort Order:</label>
                <input type="number" value={form.display_order} onChange={e => setForm({...form, display_order: parseInt(e.target.value) || 0})} className="w-20 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-sm focus:border-[#0D9488] outline-none" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[#F1F5F9]">
            <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 bg-[#0F172A] hover:bg-black text-white font-bold rounded-xl text-sm transition-all shadow-lg">
              <Save size={18} /> {editingId ? "Update Project" : "Save Project"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-6 py-3 text-[#64748B] hover:text-[#0F172A] text-sm font-bold transition-colors">
              Discard Changes
            </button>
          </div>
        </div>
      )}

      {/* Modern Data Grid */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-20 text-center">
                <div className="animate-spin w-10 h-10 border-4 border-[#0D9488] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-[#64748B]">Fetching your portfolio...</p>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  <th className="py-4 px-6 text-xs font-bold text-[#64748B] uppercase tracking-widest text-[10px]">Project Entity</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#64748B] uppercase tracking-widest text-[10px]">Industry & Tech</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#64748B] uppercase tracking-widest text-[10px]">Case Study</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#64748B] uppercase tracking-widest text-[10px]">Status</th>
                  <th className="py-4 px-6 text-right text-xs font-bold text-[#64748B] uppercase tracking-widest text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((item, i) => (
                  <tr key={item.id || i} className="group border-b border-[#F8FAFC] hover:bg-[#F0FDFA]/30 transition-all duration-200">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-[#E2E8F0] flex-shrink-0">
                          <img src={item.featured_image_url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&q=50"} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-[#0F172A]">{item.name}</div>
                          <div className="text-xs text-[#64748B]">{item.client}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="text-xs font-semibold text-[#0D9488] mb-1">{item.category}</div>
                      <div className="flex flex-wrap gap-1">
                        {(item.tech_stack?.split(",") || []).slice(0, 3).map((t: string, idx: number) => (
                          <span key={idx} className="text-[10px] bg-[#F1F5F9] px-1.5 py-0.5 rounded text-[#64748B]">{t.trim()}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                       <button 
                        onClick={() => setManagingCaseStudy(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          item.case_studies?.length > 0
                            ? "bg-[#0D9488]/10 text-[#0D9488] hover:bg-[#0D9488]/20"
                            : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                        }`}
                       >
                         <BookOpen size={14} />
                         {item.case_studies?.length > 0 ? "Edit Case Study" : "Add Case Study"}
                       </button>
                    </td>
                    <td className="py-5 px-6">
                      {item.is_featured ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">
                          ⭐ FEATURED
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#94A3B8] font-semibold">STANDARD</span>
                      )}
                    </td>
                    <td className="py-5 px-6 text-right text-[#0F172A] font-bold">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-[#64748B] hover:text-[#0D9488] transition-all"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 rounded-xl hover:bg-red-50 text-[#64748B] hover:text-[#EF4444] transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="max-w-xs mx-auto text-[#64748B]">
                        <p className="font-bold text-[#0F172A] mb-2">No projects yet</p>
                        <p className="text-sm">Start by adding your first project to showcase your expertise!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

