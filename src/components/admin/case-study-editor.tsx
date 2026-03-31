"use client";

import { useState, useEffect } from "react";
import { Save, X, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { upsertCaseStudy, getCaseStudyByProjectId } from "@/app/portfolio-actions";
import { ImageUpload } from "../ui/image-upload";
import { toast } from "sonner";

interface CaseStudyEditorProps {
  project: any;
  onClose: () => void;
}

export default function CaseStudyEditor({ project, onClose }: CaseStudyEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    client_name: "",
    industry: "",
    hero_image_url: "",
    project_background: "",
    client_challenges: "",
    research_strategy: "",
    design_process: "",
    development_approach: "",
    technologies: "",
    metrics: "", // Label|Value|Desc
    status: "Draft",
    screenshots: [] as string[],
  });

  useEffect(() => {
    const loadCaseStudy = async () => {
      setLoading(true);
      const { data, error } = await getCaseStudyByProjectId(project.id);
      if (data) {
        setForm({
          title: data.title || project.name,
          slug: data.slug || project.slug || project.name.toLowerCase().replace(/ /g, "-"),
          client_name: data.client_name || project.client,
          industry: data.industry || project.industry,
          hero_image_url: data.hero_image_url || project.featured_image_url,
          project_background: data.project_background || "",
          client_challenges: data.client_challenges || "",
          research_strategy: data.research_strategy || "",
          design_process: data.design_process || "",
          development_approach: data.development_approach || "",
          technologies: data.technologies || project.tech_stack,
          metrics: data.metrics || "",
          status: data.status || "Draft",
          screenshots: data.screenshots || [],
        });
      } else {
        // Initialize with project data
        setForm(f => ({
          ...f,
          title: project.name,
          slug: project.slug || project.name.toLowerCase().replace(/ /g, "-"),
          client_name: project.client,
          industry: project.industry,
          hero_image_url: project.featured_image_url,
          technologies: project.tech_stack,
        }));
      }
      setLoading(false);
    };
    loadCaseStudy();
  }, [project]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await upsertCaseStudy({
      ...form,
      portfolio_id: project.id,
    });

    if (error) {
      toast.error("Failed to save case study: " + error.message);
    } else {
      toast.success("Case study saved successfully!");
      onClose();
    }
    setSaving(false);
  };

  const addScreenshot = (url: string) => {
    setForm({ ...form, screenshots: [...form.screenshots, url] });
  };

  const removeScreenshot = (index: number) => {
    const newScreenshots = [...form.screenshots];
    newScreenshots.splice(index, 1);
    setForm({ ...form, screenshots: newScreenshots });
  };

  if (loading) return <div className="p-8 text-center text-[#64748B]">Loading Case Study...</div>;

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto px-1 pr-4 custom-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Case Study: {project.name}
          </h3>
          <p className="text-sm text-[#64748B]">Detailed presentation for the portfolio detail page.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Case Study Title</label>
            <input 
              type="text" 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all"
              placeholder="e.g. Modernizing Personal Banking"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">URL Slug</label>
            <input 
              type="text" 
              value={form.slug} 
              onChange={e => setForm({...form, slug: e.target.value})} 
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Hero Image</label>
            <ImageUpload
              value={form.hero_image_url}
              onChange={(url) => setForm({ ...form, hero_image_url: url })}
              onRemove={() => setForm({ ...form, hero_image_url: "" })}
              bucket="portfolio-images"
              aspectRatio="video"
              label="Upload Hero Image"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Status</label>
            <select 
              value={form.status} 
              onChange={e => setForm({...form, status: e.target.value})} 
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] outline-none focus:border-[#0D9488]"
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Technologies (comma-separated)</label>
            <input 
              type="text" 
              value={form.technologies} 
              onChange={e => setForm({...form, technologies: e.target.value})} 
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Metrics (Label|Value|Desc, one per line)</label>
            <textarea 
              rows={4} 
              value={form.metrics} 
              onChange={e => setForm({...form, metrics: e.target.value})} 
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none"
              placeholder="User Growth|+300%|in 6 months&#10;App Rating|4.8*|on App Store"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-[#F1F5F9]">
        <h4 className="font-bold text-[#0F172A]">Project Narrative</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Project Background</label>
              <textarea 
                rows={5} 
                value={form.project_background} 
                onChange={e => setForm({...form, project_background: e.target.value})} 
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Client Challenges (one per line)</label>
              <textarea 
                rows={5} 
                value={form.client_challenges} 
                onChange={e => setForm({...form, client_challenges: e.target.value})} 
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Research & Strategy</label>
              <textarea 
                rows={5} 
                value={form.research_strategy} 
                onChange={e => setForm({...form, research_strategy: e.target.value})} 
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Design Process</label>
              <textarea 
                rows={5} 
                value={form.design_process} 
                onChange={e => setForm({...form, design_process: e.target.value})} 
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Development Approach</label>
              <textarea 
                rows={5} 
                value={form.development_approach} 
                onChange={e => setForm({...form, development_approach: e.target.value})} 
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-3">Visual Screenshots</label>
              <div className="grid grid-cols-2 gap-3">
                {form.screenshots.map((url, idx) => (
                  <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-[#E2E8F0]">
                    <img src={url} alt={`Screenshot ${idx}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeScreenshot(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="aspect-video">
                  <ImageUpload
                    onChange={addScreenshot}
                    onRemove={() => {}}
                    bucket="portfolio-images"
                    aspectRatio="video"
                    label="Add Screenshot"
                    className="h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-[#F1F5F9] flex items-center justify-end gap-3 sticky bottom-0 bg-white pb-4">
        <button 
          onClick={onClose}
          className="px-6 py-2.5 text-[#64748B] hover:text-[#0F172A] font-semibold transition-colors"
        >
          Cancel
        </button>
        <button 
          disabled={saving}
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-[#0D9488]/50 text-white font-bold rounded-xl transition-all shadow-lg shadow-[#0D9488]/20"
        >
          {saving ? "Saving..." : <><Save size={18} /> Save Case Study</>}
        </button>
      </div>
    </div>
  );
}
