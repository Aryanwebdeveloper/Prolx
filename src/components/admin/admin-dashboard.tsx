"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard, Globe, Briefcase, Users, FileText, Star,
  DollarSign, MessageSquare, Briefcase as CareerIcon, Settings,
  TrendingUp, Eye, Mail, BarChart3, Menu, X, LogOut, Calendar,
  PlusCircle, Edit, Trash2, Download, Save, UserCog, Award, CheckCircle,
  Receipt, FileSignature, Clock, Bell
} from "lucide-react";
import Link from "next/link";
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";
import OverviewPanel from "@/components/admin/overview-panel";
import UsersManagerPanel from "@/components/admin/users-manager-panel";
import CertificateManagerPanel from "@/components/admin/certificate-manager-panel";
import BlogManagerPanel from "@/components/admin/blog-manager-panel";
import PortfolioManagerPanel from "@/components/admin/portfolio-manager-panel";
import TestimonialsManagerPanel from "@/components/admin/testimonials-manager-panel";
import PricingManagerPanel from "@/components/admin/pricing-manager-panel";
import TeamManagerPanel from "@/components/admin/team-manager-panel";
import ServicesManagerPanel from "@/components/admin/services-manager-panel";
import CareersManagerPanel from "@/components/admin/careers-manager-panel";
import ContactSubmissionsPanel from "@/components/admin/contact-submissions-panel";
import ConsultationsPanel from "@/components/admin/consultations-panel";
import SettingsPanel from "@/components/admin/settings-panel";
import InvoiceManagerPanel from "@/components/admin/invoice-manager-panel";
import LetterGeneratorPanel from "@/components/admin/letter-generator-panel";
import AttendanceManagerPanel from "@/components/admin/attendance-manager-panel";
import AnnouncementsManagerPanel from "@/components/admin/announcements-manager-panel";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", id: "overview" },
  { icon: Globe, label: "Services", id: "services" },
  { icon: Briefcase, label: "Portfolio", id: "portfolio" },
  { icon: Users, label: "Team", id: "team" },
  { icon: FileText, label: "Blog", id: "blog" },
  { icon: Star, label: "Testimonials", id: "testimonials" },
  { icon: DollarSign, label: "Pricing", id: "pricing" },
  { icon: Mail, label: "Contact Submissions", id: "contact" },
  { icon: Calendar, label: "Consultation Bookings", id: "consultations" },
  { icon: CareerIcon, label: "Careers", id: "careers" },
  { icon: UserCog, label: "Users", id: "users" },
  { icon: Award, label: "Certificates", id: "certificates" },
  { icon: Receipt, label: "Invoices", id: "invoices" },
  { icon: FileSignature, label: "Letters", id: "letters" },
  { icon: Clock, label: "Attendance", id: "attendance" },
  { icon: Bell, label: "Announcements", id: "announcements" },
  { icon: Settings, label: "Settings", id: "settings" },
];

const statsCards = [
  { label: "Total Visitors", value: "12,847", trend: "+18%", icon: Eye, color: "teal" },
  { label: "Leads Received", value: "284", trend: "+12%", icon: Mail, color: "orange" },
  { label: "Portfolio Views", value: "3,421", trend: "+24%", icon: TrendingUp, color: "blue" },
  { label: "Blog Reads", value: "8,103", trend: "+31%", icon: BarChart3, color: "purple" },
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
          {active === "team" && <TeamManagerPanel />}
          {active === "blog" && <BlogManagerPanel />}
          {active === "testimonials" && <TestimonialsManagerPanel />}
          {active === "pricing" && <PricingManagerPanel />}
          {active === "contact" && <ContactSubmissionsPanel />}
          {active === "consultations" && <ConsultationsPanel />}
          {active === "careers" && <CareersManagerPanel />}
          {active === "users" && <UsersManagerPanel />}
          {active === "certificates" && <CertificateManagerPanel />}
          {active === "invoices" && <InvoiceManagerPanel />}
          {active === "letters" && <LetterGeneratorPanel />}
          {active === "attendance" && <AttendanceManagerPanel />}
          {active === "announcements" && <AnnouncementsManagerPanel />}
          {active === "settings" && <SettingsPanel />}
        </div>
      </main>
    </div>
  );
}




