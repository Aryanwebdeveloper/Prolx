"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard, Globe, Briefcase, Users, FileText, Star,
  DollarSign, MessageSquare, Briefcase as CareerIcon, Settings,
  TrendingUp, Eye, Mail, BarChart3, Menu, X, LogOut,
  PlusCircle, Edit, Trash2, Download, Save,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", id: "overview" },
  { icon: Globe, label: "Services", id: "services" },
  { icon: Briefcase, label: "Portfolio", id: "portfolio" },
  { icon: FileText, label: "Case Studies", id: "casestudies" },
  { icon: Users, label: "Team", id: "team" },
  { icon: FileText, label: "Blog", id: "blog" },
  { icon: Star, label: "Testimonials", id: "testimonials" },
  { icon: DollarSign, label: "Pricing", id: "pricing" },
  { icon: Mail, label: "Contact Submissions", id: "contact" },
  { icon: CareerIcon, label: "Careers", id: "careers" },
  { icon: Settings, label: "Settings", id: "settings" },
];

const statsCards = [
  { label: "Total Visitors", value: "12,847", trend: "+18%", icon: Eye, color: "teal" },
  { label: "Leads Received", value: "284", trend: "+12%", icon: Mail, color: "orange" },
  { label: "Portfolio Views", value: "3,421", trend: "+24%", icon: TrendingUp, color: "blue" },
  { label: "Blog Reads", value: "8,103", trend: "+31%", icon: BarChart3, color: "purple" },
];

const recentSubmissions = [
  { name: "Sarah Connor", email: "sarah@example.com", service: "Website Development", budget: "$2k–$5k", date: "Dec 15, 2024", status: "New" },
  { name: "Michael Chen", email: "m.chen@corp.com", service: "Mobile App", budget: "$5k–$15k", date: "Dec 14, 2024", status: "Replied" },
  { name: "Priya Patel", email: "priya@startup.io", service: "UI/UX Design", budget: "$500–$2k", date: "Dec 13, 2024", status: "New" },
  { name: "James Williams", email: "james@biz.net", service: "SaaS Development", budget: "$15k+", date: "Dec 12, 2024", status: "Read" },
  { name: "Aisha Rahman", email: "aisha@ecommerce.pk", service: "E-commerce", budget: "$2k–$5k", date: "Dec 11, 2024", status: "Replied" },
];

export default function AdminDashboard({ user }: { user: User }) {
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0D9488] flex items-center justify-center">
              <span className="text-white font-bold text-sm font-mono">Px</span>
            </div>
            <span className="text-white font-bold text-lg" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Prolx Admin
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, id }) => (
            <button
              key={id}
              onClick={() => { setActive(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
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
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user.email}</p>
              <p className="text-[#64748B] text-xs">Admin</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#94A3B8] hover:text-[#EF4444] hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 lg:ml-64 min-h-screen">
        <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#64748B]">
              <Menu size={22} />
            </button>
            <h1 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              {navItems.find((n) => n.id === active)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-[#64748B] hover:text-[#0D9488] transition-colors">
              ← View Site
            </Link>
            <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center text-white font-bold text-xs">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-6">
          {active === "overview" && <OverviewPanel />}
          {active === "services" && <ServicesManagerPanel />}
          {active === "portfolio" && <PortfolioManagerPanel />}
          {active === "casestudies" && <CaseStudiesManagerPanel />}
          {active === "team" && <TeamManagerPanel />}
          {active === "blog" && <BlogManagerPanel />}
          {active === "testimonials" && <TestimonialsManagerPanel />}
          {active === "pricing" && <PricingManagerPanel />}
          {active === "contact" && <ContactSubmissionsPanel />}
          {active === "careers" && <CareersManagerPanel />}
          {active === "settings" && <SettingsPanel userEmail={user.email || ""} />}
        </div>
      </main>
    </div>
  );
}

/* ====================== OVERVIEW PANEL ====================== */
function OverviewPanel() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map(({ label, value, trend, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                color === "teal" ? "bg-[#CCFBF1]" : color === "orange" ? "bg-[#FFF7ED]" : color === "blue" ? "bg-blue-50" : "bg-purple-50"
              }`}>
                <Icon size={18} className={
                  color === "teal" ? "text-[#0D9488]" : color === "orange" ? "text-[#F97316]" : color === "blue" ? "text-blue-500" : "text-purple-500"
                } />
              </div>
              <span className="text-xs font-semibold text-[#0D9488] bg-[#F0FDFA] px-2 py-0.5 rounded-full">{trend}</span>
            </div>
            <div className="text-2xl font-bold text-[#0F172A] mb-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
            <div className="text-xs text-[#64748B]">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Visitor Trend (Last 7 Days)
          </h3>
          <div className="flex items-end gap-3 h-40">
            {[65, 45, 78, 92, 68, 85, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-[#0D9488]/10 rounded-lg relative overflow-hidden" style={{ height: `${h}%` }}>
                  <div className="absolute bottom-0 left-0 right-0 bg-[#0D9488] rounded-lg" style={{ height: "100%" }} />
                </div>
                <span className="text-xs text-[#64748B]">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Lead Sources
          </h3>
          <div className="space-y-3">
            {[
              { source: "Organic Search", pct: 42, color: "#0D9488" },
              { source: "Direct Traffic", pct: 25, color: "#14B8A6" },
              { source: "Social Media", pct: 18, color: "#2DD4BF" },
              { source: "Referral", pct: 10, color: "#CCFBF1" },
              { source: "Paid Ads", pct: 5, color: "#F97316" },
            ].map(({ source, pct, color }) => (
              <div key={source} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-sm text-[#64748B] flex-1">{source}</span>
                <div className="w-32 h-2 bg-[#F0FDFA] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
                <span className="text-xs font-mono text-[#0F172A] w-10 text-right">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          Top Pages
        </h3>
        <div className="space-y-2">
          {[
            { page: "/", views: "4,521", bounce: "32%" },
            { page: "/services", views: "2,184", bounce: "28%" },
            { page: "/portfolio", views: "1,842", bounce: "22%" },
            { page: "/blog", views: "1,456", bounce: "18%" },
            { page: "/contact", views: "987", bounce: "45%" },
          ].map(({ page, views, bounce }) => (
            <div key={page} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl">
              <span className="text-sm font-mono text-[#0D9488]">{page}</span>
              <div className="flex items-center gap-6">
                <span className="text-sm text-[#0F172A] font-medium">{views} views</span>
                <span className="text-xs text-[#64748B]">{bounce} bounce</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          {[
            { icon: FileText, label: "Add Blog Post", color: "teal" },
            { icon: Briefcase, label: "Add Project", color: "blue" },
            { icon: Users, label: "Add Team Member", color: "purple" },
            { icon: Star, label: "Add Testimonial", color: "orange" },
          ].map(({ icon: Icon, label, color }) => (
            <button key={label} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all hover:-translate-y-0.5 ${
              color === "teal" ? "border-[#CCFBF1] text-[#0D9488] hover:bg-[#F0FDFA]" :
              color === "blue" ? "border-blue-100 text-blue-600 hover:bg-blue-50" :
              color === "purple" ? "border-purple-100 text-purple-600 hover:bg-purple-50" :
              "border-orange-100 text-[#F97316] hover:bg-[#FFF7ED]"
            }`}>
              <PlusCircle size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          Recent Contact Submissions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                {["Name", "Service", "Budget", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.slice(0, 5).map((s, i) => (
                <tr key={i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-medium text-[#0F172A]">{s.name}</div>
                    <div className="text-xs text-[#64748B]">{s.email}</div>
                  </td>
                  <td className="py-3 px-3 text-[#64748B]">{s.service}</td>
                  <td className="py-3 px-3 text-[#64748B] font-mono text-xs">{s.budget}</td>
                  <td className="py-3 px-3 text-[#64748B] text-xs">{s.date}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      s.status === "New" ? "bg-[#F0FDFA] text-[#0D9488]" :
                      s.status === "Replied" ? "bg-blue-50 text-blue-600" : "bg-[#F8FAFC] text-[#64748B]"
                    }`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ====================== MANAGER PANEL TEMPLATE ====================== */
function ManagerPanel({ title, description, columns, rows, formFields }: {
  title: string;
  description: string;
  columns: string[];
  rows: { cells: string[]; status?: string }[];
  formFields: { label: string; type: "text" | "textarea" | "select" | "tags"; placeholder?: string; options?: string[] }[];
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="font-bold text-[#0F172A] text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              {title}
            </h2>
            <p className="text-sm text-[#64748B] mt-1">{description}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl transition-all"
          >
            <PlusCircle size={16} />
            Add New
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#CCFBF1] p-6 border-l-4 border-l-[#0D9488]">
          <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Add New Entry
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {formFields.map((field) => (
              <div key={field.label} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{field.label}</label>
                {field.type === "textarea" ? (
                  <textarea
                    rows={3}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none"
                  />
                ) : field.type === "select" ? (
                  <select className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] focus:outline-none focus:border-[#0D9488]">
                    <option value="">Select…</option>
                    {field.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-6">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl text-sm transition-all">
              <Save size={14} /> Save Entry
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 text-[#64748B] hover:text-[#0F172A] text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {columns.map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                ))}
                <th className="text-right py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                  {row.cells.map((cell, j) => (
                    <td key={j} className="py-3 px-4 text-[#0F172A]">
                      {j === 0 ? <span className="font-medium">{cell}</span> : <span className="text-[#64748B]">{cell}</span>}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-[#F0FDFA] text-[#0D9488] transition-colors"><Edit size={14} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-[#EF4444] transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ====================== SPECIFIC PANELS ====================== */
function ServicesManagerPanel() {
  return (
    <ManagerPanel
      title="Services Manager"
      description="Add, edit, and manage your service offerings displayed on the website."
      columns={["Service Name", "Category", "Technologies", "Status"]}
      rows={[
        { cells: ["Website Development", "Development", "Next.js, React, TypeScript", "Active"] },
        { cells: ["Custom Web Apps", "Development", "Next.js, Node.js, PostgreSQL", "Active"] },
        { cells: ["Mobile App Development", "Mobile", "React Native, Flutter", "Active"] },
        { cells: ["UI/UX Design", "Design", "Figma, Framer, Adobe XD", "Active"] },
        { cells: ["Graphic Design", "Design", "Illustrator, Photoshop", "Active"] },
        { cells: ["Branding", "Design", "Illustrator, Figma", "Active"] },
        { cells: ["E-commerce Development", "Development", "Shopify, WooCommerce", "Active"] },
        { cells: ["SaaS Development", "Development", "Next.js, Prisma, Stripe", "Active"] },
        { cells: ["SEO Optimization", "Marketing", "Ahrefs, SEMrush", "Active"] },
        { cells: ["Digital Marketing", "Marketing", "Google Ads, Meta Ads", "Active"] },
        { cells: ["Cloud Solutions", "Infrastructure", "AWS, GCP, Docker", "Active"] },
        { cells: ["Website Maintenance", "Support", "WordPress, Next.js", "Active"] },
      ]}
      formFields={[
        { label: "Service Name", type: "text", placeholder: "e.g. Website Development" },
        { label: "Category", type: "select", options: ["Development", "Design", "Marketing", "Infrastructure", "Support", "Mobile"] },
        { label: "Icon Name", type: "text", placeholder: "e.g. Globe, Code2, Smartphone" },
        { label: "Technologies (comma-separated)", type: "text", placeholder: "Next.js, React, TypeScript" },
        { label: "Description", type: "textarea", placeholder: "Detailed service description..." },
        { label: "Benefits (comma-separated)", type: "textarea", placeholder: "SEO-optimized, Mobile-first design, CMS integration..." },
      ]}
    />
  );
}

function PortfolioManagerPanel() {
  return (
    <ManagerPanel
      title="Portfolio Manager"
      description="Manage project entries displayed in the portfolio section."
      columns={["Project Name", "Client", "Category", "Featured"]}
      rows={[
        { cells: ["FinEdge Banking App", "FinEdge Technologies", "Mobile Apps", "⭐ Yes"] },
        { cells: ["Bloom E-commerce Store", "Bloom Retail", "Web Development", "⭐ Yes"] },
        { cells: ["MedCare Patient Portal", "MedCare Solutions", "Web Development", "⭐ Yes"] },
        { cells: ["TechHub SaaS Dashboard", "TechHub Inc.", "Web Development", "No"] },
        { cells: ["EduLearn Mobile Platform", "EduLearn Academy", "Mobile Apps", "No"] },
        { cells: ["LuxHomes Brand Identity", "LuxHomes Real Estate", "UI/UX Design", "No"] },
        { cells: ["FoodHub Delivery App", "FoodHub", "Mobile Apps", "No"] },
        { cells: ["GreenEnergy Marketing", "GreenEnergy Co.", "Digital Marketing", "No"] },
      ]}
      formFields={[
        { label: "Project Name", type: "text", placeholder: "e.g. FinEdge Banking App" },
        { label: "Client Name", type: "text", placeholder: "e.g. FinEdge Technologies" },
        { label: "Category", type: "select", options: ["Web Development", "Mobile Apps", "UI/UX Design", "Digital Marketing"] },
        { label: "Industry", type: "text", placeholder: "e.g. Fintech, Healthcare" },
        { label: "Tech Stack (comma-separated)", type: "text", placeholder: "React Native, Node.js, PostgreSQL" },
        { label: "Featured Image URL", type: "text", placeholder: "https://..." },
        { label: "Brief Summary", type: "textarea", placeholder: "Short project description..." },
      ]}
    />
  );
}

function CaseStudiesManagerPanel() {
  return (
    <ManagerPanel
      title="Case Studies Manager"
      description="Create and manage detailed case study pages for your best projects."
      columns={["Case Study", "Client", "Industry", "Status"]}
      rows={[
        { cells: ["FinEdge Banking App", "FinEdge Technologies", "Fintech", "Published"] },
        { cells: ["Bloom E-commerce Store", "Bloom Retail", "E-commerce", "Published"] },
        { cells: ["MedCare Patient Portal", "MedCare Solutions", "Healthcare", "Published"] },
      ]}
      formFields={[
        { label: "Case Study Title", type: "text", placeholder: "e.g. FinEdge Banking App" },
        { label: "Client Name", type: "text", placeholder: "e.g. FinEdge Technologies" },
        { label: "Industry", type: "text", placeholder: "e.g. Fintech" },
        { label: "URL Slug", type: "text", placeholder: "e.g. finedge-banking-app" },
        { label: "Hero Image URL", type: "text", placeholder: "https://..." },
        { label: "Project Background", type: "textarea", placeholder: "Detailed project background..." },
        { label: "Client Challenges (one per line)", type: "textarea", placeholder: "Challenge 1\nChallenge 2\nChallenge 3" },
        { label: "Research & Strategy", type: "textarea", placeholder: "Strategy description..." },
        { label: "Design Process", type: "textarea", placeholder: "Design process details..." },
        { label: "Development Approach", type: "textarea", placeholder: "Development details..." },
        { label: "Technologies (comma-separated)", type: "text", placeholder: "React Native, Node.js" },
        { label: "Metrics (format: label|value|desc, one per line)", type: "textarea", placeholder: "User Growth|+300%|in 6 months" },
      ]}
    />
  );
}

function TeamManagerPanel() {
  return (
    <ManagerPanel
      title="Team Manager"
      description="Manage team member profiles displayed on the Team page."
      columns={["Name", "Role", "Department", "Experience"]}
      rows={[
        { cells: ["Zain Ahmad", "CEO & Co-Founder", "Leadership", "10 years"] },
        { cells: ["Sara Malik", "CTO & Co-Founder", "Leadership", "9 years"] },
        { cells: ["Hassan Ali", "Lead Backend Engineer", "Engineering", "7 years"] },
        { cells: ["Nida Khan", "Senior Frontend Engineer", "Engineering", "5 years"] },
        { cells: ["Bilal Ahmed", "Mobile Developer", "Engineering", "4 years"] },
        { cells: ["Fatima Shah", "Lead UI/UX Designer", "Design", "6 years"] },
        { cells: ["Ali Raza", "Graphic Designer", "Design", "4 years"] },
        { cells: ["Omar Siddiqui", "Digital Marketing Lead", "Marketing", "5 years"] },
      ]}
      formFields={[
        { label: "Full Name", type: "text", placeholder: "e.g. John Doe" },
        { label: "Role", type: "text", placeholder: "e.g. Senior Frontend Engineer" },
        { label: "Department", type: "select", options: ["Leadership", "Engineering", "Design", "Marketing", "Operations"] },
        { label: "Years of Experience", type: "text", placeholder: "e.g. 5 years" },
        { label: "Skills (comma-separated)", type: "text", placeholder: "React, TypeScript, Node.js" },
        { label: "Photo URL", type: "text", placeholder: "https://..." },
        { label: "LinkedIn URL", type: "text", placeholder: "https://linkedin.com/in/..." },
        { label: "GitHub URL", type: "text", placeholder: "https://github.com/..." },
      ]}
    />
  );
}

function BlogManagerPanel() {
  return (
    <ManagerPanel
      title="Blog Manager"
      description="Create, edit, and schedule blog posts with SEO metadata."
      columns={["Title", "Category", "Author", "Status", "Date"]}
      rows={[
        { cells: ["Next.js 15 Performance Optimization", "Web Dev", "Ahmed Raza", "Published", "Dec 15, 2024"] },
        { cells: ["Ultimate Guide to Design Systems", "Design", "Fatima Shah", "Published", "Dec 10, 2024"] },
        { cells: ["SEO in 2025: What's Changed", "Marketing", "Omar Siddiqui", "Published", "Dec 5, 2024"] },
        { cells: ["How We Grew FinEdge 300%", "Case Studies", "Prolx Team", "Published", "Nov 28, 2024"] },
        { cells: ["Build a Real-Time Dashboard", "Tutorials", "Hassan Ali", "Published", "Nov 20, 2024"] },
        { cells: ["Micro-interactions That Delight", "Design", "Fatima Shah", "Draft", "—"] },
      ]}
      formFields={[
        { label: "Post Title", type: "text", placeholder: "e.g. 10 Tips for Better SEO" },
        { label: "Category", type: "select", options: ["Web Dev", "Design", "Marketing", "Case Studies", "Tutorials"] },
        { label: "Author", type: "text", placeholder: "e.g. Ahmed Raza" },
        { label: "Featured Image URL", type: "text", placeholder: "https://..." },
        { label: "Excerpt", type: "textarea", placeholder: "Short excerpt for previews..." },
        { label: "Content (Markdown/Rich Text)", type: "textarea", placeholder: "Full blog post content..." },
        { label: "SEO Meta Title", type: "text", placeholder: "Custom meta title for search" },
        { label: "SEO Meta Description", type: "text", placeholder: "Custom meta description..." },
        { label: "Tags (comma-separated)", type: "text", placeholder: "nextjs, react, performance" },
        { label: "Status", type: "select", options: ["Draft", "Published", "Scheduled"] },
      ]}
    />
  );
}

function TestimonialsManagerPanel() {
  return (
    <ManagerPanel
      title="Testimonials Manager"
      description="Manage client testimonials and reviews displayed on the website."
      columns={["Client Name", "Company", "Rating", "Visible"]}
      rows={[
        { cells: ["Sarah Mitchell", "FinEdge Technologies", "★★★★★", "Yes"] },
        { cells: ["James Okonkwo", "MedCare Health", "★★★★★", "Yes"] },
        { cells: ["Priya Sharma", "Bloom Retail", "★★★★★", "Yes"] },
        { cells: ["Ahmed Hassan", "EduLearn Platform", "★★★★★", "Yes"] },
        { cells: ["Lisa Chen", "CloudStack SaaS", "★★★★★", "Yes"] },
        { cells: ["Omar Al-Rashid", "Gulf Logistics", "★★★★☆", "Yes"] },
        { cells: ["Fatima Al-Zahra", "Luxe Interiors", "★★★★★", "Yes"] },
        { cells: ["David Park", "NexGen Fintech", "★★★★★", "Yes"] },
        { cells: ["Rachel Fernandez", "TravelWise App", "★★★★★", "Yes"] },
      ]}
      formFields={[
        { label: "Client Name", type: "text", placeholder: "e.g. Sarah Mitchell" },
        { label: "Company", type: "text", placeholder: "e.g. FinEdge Technologies" },
        { label: "Role", type: "text", placeholder: "e.g. CEO" },
        { label: "Rating (1-5)", type: "select", options: ["5", "4", "3", "2", "1"] },
        { label: "Quote", type: "textarea", placeholder: "Client testimonial text..." },
        { label: "Photo URL", type: "text", placeholder: "https://..." },
        { label: "Video URL (optional)", type: "text", placeholder: "https://youtube.com/..." },
        { label: "Visible", type: "select", options: ["Yes", "No"] },
      ]}
    />
  );
}

function PricingManagerPanel() {
  return (
    <ManagerPanel
      title="Pricing Manager"
      description="Manage pricing plans, features, and recommended badges."
      columns={["Plan Name", "Price (USD)", "Price (PKR)", "Recommended"]}
      rows={[
        { cells: ["Starter Website", "$499", "₨140,000", "No"] },
        { cells: ["Business Website", "$1,299", "₨365,000", "No"] },
        { cells: ["E-commerce", "$2,499", "₨700,000", "⭐ Yes"] },
        { cells: ["Custom Enterprise", "Custom Quote", "Custom Quote", "No"] },
      ]}
      formFields={[
        { label: "Plan Name", type: "text", placeholder: "e.g. Starter Website" },
        { label: "Price (USD)", type: "text", placeholder: "e.g. 499 (or leave empty for custom)" },
        { label: "Price (PKR)", type: "text", placeholder: "e.g. 140000" },
        { label: "Description", type: "textarea", placeholder: "Short plan description..." },
        { label: "Features (one per line)", type: "textarea", placeholder: "Up to 5 pages\nMobile responsive\nBasic SEO" },
        { label: "Recommended", type: "select", options: ["No", "Yes"] },
        { label: "CTA Button Text", type: "text", placeholder: "e.g. Get Started" },
      ]}
    />
  );
}

function CareersManagerPanel() {
  return (
    <ManagerPanel
      title="Careers Manager"
      description="Post and manage job openings. View applications from candidates."
      columns={["Position", "Department", "Location", "Type", "Status"]}
      rows={[
        { cells: ["Senior Full-Stack Developer", "Engineering", "Remote / Karachi", "Full-time", "Open"] },
        { cells: ["UI/UX Designer", "Design", "Remote", "Full-time", "Open"] },
        { cells: ["Digital Marketing Specialist", "Marketing", "Karachi / Hybrid", "Full-time", "Open"] },
        { cells: ["React Native Developer", "Engineering", "Remote", "Contract", "Open"] },
      ]}
      formFields={[
        { label: "Job Title", type: "text", placeholder: "e.g. Senior Full-Stack Developer" },
        { label: "Department", type: "select", options: ["Engineering", "Design", "Marketing", "Operations", "Sales"] },
        { label: "Location", type: "text", placeholder: "e.g. Remote / Karachi" },
        { label: "Type", type: "select", options: ["Full-time", "Part-time", "Contract", "Internship"] },
        { label: "Requirements (one per line)", type: "textarea", placeholder: "5+ years React/Next.js\nStrong TypeScript skills" },
        { label: "Description", type: "textarea", placeholder: "Full job description..." },
        { label: "Status", type: "select", options: ["Open", "Closed", "Paused"] },
      ]}
    />
  );
}

/* ====================== CONTACT SUBMISSIONS ====================== */
function ContactSubmissionsPanel() {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? recentSubmissions : recentSubmissions.filter((s) => s.status === filter);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-bold text-[#0F172A] text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Contact Submissions
            </h2>
            <p className="text-sm text-[#64748B] mt-1">View, filter, and manage incoming contact form submissions.</p>
          </div>
          <div className="flex gap-2">
            {["All", "New", "Read", "Replied"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === f ? "bg-[#0D9488] text-white" : "bg-[#F0FDFA] text-[#64748B] hover:bg-[#CCFBF1]"
                }`}
              >
                {f}
              </button>
            ))}
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F0FDFA] text-[#64748B] hover:bg-[#CCFBF1] transition-all">
              <Download size={12} /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                {["Name", "Email", "Service", "Budget", "Date", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-3 font-medium text-[#0F172A]">{s.name}</td>
                  <td className="py-3 px-3 text-[#64748B] text-xs">{s.email}</td>
                  <td className="py-3 px-3 text-[#64748B]">{s.service}</td>
                  <td className="py-3 px-3 text-[#64748B] font-mono text-xs">{s.budget}</td>
                  <td className="py-3 px-3 text-[#64748B] text-xs">{s.date}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      s.status === "New" ? "bg-[#F0FDFA] text-[#0D9488]" :
                      s.status === "Replied" ? "bg-blue-50 text-blue-600" : "bg-[#F8FAFC] text-[#64748B]"
                    }`}>{s.status}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      <button className="text-xs text-[#0D9488] hover:underline">View</button>
                      <button className="text-xs text-[#64748B] hover:underline">Reply</button>
                      <button className="text-xs text-[#EF4444] hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ====================== SETTINGS PANEL ====================== */
function SettingsPanel({ userEmail }: { userEmail: string }) {
  return (
    <div className="space-y-6">
      {/* SEO Settings */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <h2 className="font-bold text-[#0F172A] text-xl mb-6" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          SEO Defaults
        </h2>
        <div className="space-y-4">
          {[
            { label: "Meta Title", placeholder: "Prolx Digital Agency — Premium Web Development" },
            { label: "Meta Description", placeholder: "Premium digital agency building exceptional web experiences..." },
            { label: "OG Image URL", placeholder: "https://prolx.digital/og-image.png" },
          ].map(({ label, placeholder }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
              />
            </div>
          ))}
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl text-sm transition-all">
            <Save size={14} /> Save SEO Settings
          </button>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <h2 className="font-bold text-[#0F172A] text-xl mb-6" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          Social Media Links
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: "Facebook", placeholder: "https://facebook.com/prolx" },
            { label: "Twitter / X", placeholder: "https://twitter.com/prolx" },
            { label: "Instagram", placeholder: "https://instagram.com/prolx" },
            { label: "LinkedIn", placeholder: "https://linkedin.com/company/prolx" },
            { label: "GitHub", placeholder: "https://github.com/prolx" },
            { label: "Dribbble", placeholder: "https://dribbble.com/prolx" },
          ].map(({ label, placeholder }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}</label>
              <input
                type="url"
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
              />
            </div>
          ))}
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl text-sm mt-6 transition-all">
          <Save size={14} /> Save Social Links
        </button>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <h2 className="font-bold text-[#0F172A] text-xl mb-6" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          Admin User Management
        </h2>
        <div className="space-y-3 mb-6">
          {[
            { email: userEmail, role: "Admin", status: "Active" },
            { email: "editor@prolx.digital", role: "Sub-Admin", status: "Active" },
          ].map((u) => (
            <div key={u.email} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center text-white font-bold text-xs">
                  {u.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{u.email}</p>
                  <p className="text-xs text-[#64748B]">{u.role}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                u.status === "Active" ? "bg-[#F0FDFA] text-[#0D9488]" : "bg-[#F8FAFC] text-[#64748B]"
              }`}>{u.status}</span>
            </div>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-[#E2E8F0] text-[#64748B] hover:border-[#0D9488] hover:text-[#0D9488] rounded-xl text-sm font-medium transition-all">
          <PlusCircle size={14} /> Add Admin User
        </button>
      </div>

      {/* Account */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <h2 className="font-bold text-[#0F172A] text-xl mb-6" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          Account
        </h2>
        <div className="bg-[#F0FDFA] rounded-xl p-4 border border-[#CCFBF1]">
          <p className="text-sm text-[#64748B]">Logged in as</p>
          <p className="font-medium text-[#0F172A]">{userEmail}</p>
        </div>
        <Link
          href="/dashboard/reset-password"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 border border-[#E2E8F0] text-[#64748B] hover:border-[#0D9488] hover:text-[#0D9488] rounded-xl text-sm font-medium transition-all"
        >
          Change Password
        </Link>
      </div>
    </div>
  );
}
