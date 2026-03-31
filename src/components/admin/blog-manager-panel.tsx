"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Save, X } from "lucide-react";
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from "@/app/blog-actions";
import { ImageUpload } from "../ui/image-upload";

export default function BlogManagerPanel() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", slug: "", category: "", author_name: "", 
    featured_image_url: "", excerpt: "", content: "",
    tags: "", status: "Draft"
  });

  const loadPosts = async () => {
    setLoading(true);
    const { data } = await getBlogPosts();
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, []);

  const handleEdit = (post: any) => {
    setForm({
      title: post.title, slug: post.slug, category: post.category || "",
      author_name: post.author_name || "", featured_image_url: post.featured_image_url || "",
      excerpt: post.excerpt || "", content: post.content || "",
      tags: post.tags || "", status: post.status
    });
    setEditingId(post.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await deleteBlogPost(id);
    loadPosts();
  };

  const handleSave = async () => {
    if (editingId) {
      await updateBlogPost(editingId, form as any);
    } else {
      await createBlogPost(form as any);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({
      title: "", slug: "", category: "", author_name: "", 
      featured_image_url: "", excerpt: "", content: "",
      tags: "", status: "Draft"
    });
    loadPosts();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="font-bold text-[#0F172A] text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Blog Manager
            </h2>
            <p className="text-sm text-[#64748B] mt-1">Create, edit, and schedule blog posts with SEO metadata.</p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ title: "", slug: "", category: "", author_name: "", featured_image_url: "", excerpt: "", content: "", tags: "", status: "Draft" });
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl transition-all"
          >
            {showForm ? <X size={16} /> : <PlusCircle size={16} />}
            {showForm ? "Cancel" : "Add New Post"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#CCFBF1] p-6 border-l-4 border-l-[#0D9488]">
          <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            {editingId ? "Edit Post" : "Add New Post"}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Post Title</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">URL Slug (e.g. my-post-title)</label>
              <input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B]">
                <option value="">Select...</option>
                <option value="Web Dev">Web Dev</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Case Studies">Case Studies</option>
                <option value="Tutorials">Tutorials</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Author</label>
              <input type="text" value={form.author_name} onChange={e => setForm({...form, author_name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-sm font-medium text-[#0F172A]">Featured Image</label>
              <ImageUpload
                value={form.featured_image_url}
                onChange={(url) => setForm({ ...form, featured_image_url: url })}
                onRemove={() => setForm({ ...form, featured_image_url: "" })}
                bucket="blog-images"
                aspectRatio="video"
                label="Upload Blog Cover"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Excerpt</label>
              <textarea rows={2} value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Content (Markdown/HTML)</label>
              <textarea rows={8} value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] font-mono text-xs resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Tags (comma-separated)</label>
              <input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B]">
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl text-sm transition-all">
              <Save size={14} /> Save Post
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-[#64748B] hover:text-[#0F172A] text-sm font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Title</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Author</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, i) => (
                  <tr key={post.id || i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 text-[#0F172A] font-medium">{post.title}</td>
                    <td className="py-3 px-4 text-[#64748B]">{post.category}</td>
                    <td className="py-3 px-4 text-[#64748B]">{post.author_name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        post.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 
                        post.status === 'Draft' ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(post)} className="p-1.5 rounded-lg hover:bg-[#F0FDFA] text-[#0D9488] transition-colors"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#EF4444] transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-6 text-gray-500">No blog posts found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
