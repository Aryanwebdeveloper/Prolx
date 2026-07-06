"use client";

import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard, Globe, Briefcase, Users, FileText, Star,
  DollarSign, MessageSquare, Briefcase as CareerIcon, Settings,
  TrendingUp, Eye, Mail, BarChart3, Menu, X, LogOut, Calendar,
  PlusCircle, Edit, Trash2, Download, Save, UserCog, Award, CheckCircle,
  Receipt, FileSignature, Clock, Bell, FormInput, User as UserIcon,
  CheckSquare
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
import CareersApplicationsPanel from "@/components/admin/careers-applications-panel";
import ApplicationFormSettings from "@/components/admin/application-form-settings";
import ContactSubmissionsPanel from "@/components/admin/contact-submissions-panel";
import ConsultationsPanel from "@/components/admin/consultations-panel";
import SettingsPanel from "@/components/admin/settings-panel";
import InvoiceManagerPanel from "@/components/admin/invoice-manager-panel";
import LetterGeneratorPanel from "@/components/admin/letter-generator-panel";
import AttendanceManagerPanel from "@/components/admin/attendance-manager-panel";
import AnnouncementsManagerPanel from "@/components/admin/announcements-manager-panel";
import InterviewManagementPanel from "@/components/admin/interview-management-panel";
import EmailLogsPanel from "@/components/admin/email-logs-panel";
import MyAccountPanel from "@/components/admin/my-account-panel";
import MyTeamProfilePanel from "@/components/admin/my-team-profile-panel";
import TeamChatPanel from "@/components/admin/team-chat-panel";
import TaskManagerPanel from "@/components/admin/task-manager-panel";
import { getUnreadMessagesCount } from "@/app/communication-actions";

const statsCards = [
  { label: "Total Visitors", value: "12,847", trend: "+18%", icon: Eye, color: "teal" },
  { label: "Leads Received", value: "284", trend: "+12%", icon: Mail, color: "orange" },
  { label: "Portfolio Views", value: "3,421", trend: "+24%", icon: TrendingUp, color: "blue" },
  { label: "Blog Reads", value: "8,103", trend: "+31%", icon: BarChart3, color: "purple" },
];

const getNavItems = (role: string) => {
  const baseItems = [
    { icon: LayoutDashboard, label: "Overview", id: "overview" },
    { icon: UserIcon, label: "My Account", id: "my-account" },
  ];

  // Staff & admin shared items
  if (role === "staff" || role === "admin") {
    baseItems.push(
      { icon: UserCog, label: "My Team Settings", id: "my-profile" },
      { icon: MessageSquare, label: "Team Chat", id: "team-chat" },
      { icon: CheckSquare, label: "My Tasks", id: "tasks" },
    );
  }

  // Admin-only items
  if (role === "admin") {
    baseItems.push(
      { icon: Globe, label: "Services", id: "services" },
      { icon: Briefcase, label: "Portfolio", id: "portfolio" },
      { icon: Users, label: "Team", id: "team" },
      { icon: FileText, label: "Blog", id: "blog" },
      { icon: Star, label: "Testimonials", id: "testimonials" },
      { icon: DollarSign, label: "Pricing", id: "pricing" },
      { icon: Mail, label: "Contact Submissions", id: "contact" },
      { icon: Calendar, label: "Consultation Bookings", id: "consultations" },
      { icon: CareerIcon, label: "Careers", id: "careers" },
      { icon: Users, label: "Job Applications", id: "applications" },
      { icon: FormInput, label: "Form Settings", id: "form-settings" },
      { icon: Calendar, label: "Interview Management", id: "interviews" },
      { icon: Mail, label: "Email Logs", id: "email-logs" },
      { icon: UserCog, label: "Users", id: "users" },
      { icon: Award, label: "Certificates", id: "certificates" },
      { icon: Receipt, label: "Invoices", id: "invoices" },
      { icon: FileSignature, label: "Letters", id: "letters" },
      { icon: Clock, label: "Attendance", id: "attendance" },
      { icon: Bell, label: "Announcements", id: "announcements" },
      { icon: Settings, label: "Settings", id: "settings" },
    );
  } else if (role === "staff") {
     // Staff specific additional items
     baseItems.push(
       { icon: Clock, label: "Attendance", id: "attendance" },
       { icon: Bell, label: "Announcements", id: "announcements" },
     );
  }

  return baseItems;
};

export default function AdminDashboard({ user }: { user: User }) {
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Get user profile to determine role
  const [profile, setProfile] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await createClient().from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
      // Set default tab based on role
      if (data?.role === "staff") setActive("my-account");
      if (data?.role === "client") setActive("my-account");
    };
    fetchProfile();
  }, [user.id]);

  useEffect(() => {
    const loadUnreadCount = async () => {
      const count = await getUnreadMessagesCount();
      setUnreadCount(count);
    };
    loadUnreadCount();

    const supabase = createClient();
    const channel = supabase
      .channel("sidebar-unread-messages-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_messages" },
        () => {
          loadUnreadCount();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_message_reads" },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);
  useEffect(() => {
    if (active === "team-chat") {
      setUnreadCount(0);
    }
  }, [active]);

  const role = profile?.role || "client";
  const navItems = getNavItems(role);

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
              Prolx {role === "admin" ? "Admin" : role === "staff" ? "Staff" : "Portal"}
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
              className={`w-full flex items-center justify-between px-5 py-3 text-sm transition-colors ${
                active === id
                  ? "bg-[#0D9488] text-white"
                  : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                {label}
              </div>
              {id === "team-chat" && unreadCount > 0 && active !== "team-chat" && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full select-none shrink-0 mr-1 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center text-white font-bold text-xs overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.email?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{profile?.full_name || user.email}</p>
              <p className="text-[#64748B] text-xs capitalize">{role}</p>
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
            <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center text-white font-bold text-xs overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.email?.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </header>

        <div className="p-6">
          {active === "overview" && <OverviewPanel />}
          {active === "my-account" && <MyAccountPanel />}

          {active === "my-profile" && <MyTeamProfilePanel />}
          {active === "services" && <ServicesManagerPanel />}
          {active === "portfolio" && <PortfolioManagerPanel />}
          {active === "team" && <TeamManagerPanel />}
          {active === "blog" && <BlogManagerPanel />}
          {active === "testimonials" && <TestimonialsManagerPanel />}
          {active === "pricing" && <PricingManagerPanel />}
          {active === "contact" && <ContactSubmissionsPanel />}
          {active === "consultations" && <ConsultationsPanel />}
          {active === "careers" && <CareersManagerPanel />}
          {active === "applications" && <CareersApplicationsPanel />}
          {active === "form-settings" && <ApplicationFormSettings />}
          {active === "interviews" && <InterviewManagementPanel />}
          {active === "email-logs" && <EmailLogsPanel />}
          {active === "users" && <UsersManagerPanel />}
          {active === "certificates" && <CertificateManagerPanel />}
          {active === "invoices" && <InvoiceManagerPanel />}
          {active === "letters" && <LetterGeneratorPanel />}
          {active === "attendance" && <AttendanceManagerPanel />}
          {active === "announcements" && <AnnouncementsManagerPanel />}
          {active === "settings" && <SettingsPanel />}
          {active === "team-chat" && <TeamChatPanel user={user} userRole={role} />}
          {active === "tasks" && <TaskManagerPanel user={user} userRole={role} />}
        </div>
      </main>
    </div>
  );
}





