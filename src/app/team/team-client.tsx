"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { ChevronRight, Linkedin, Github, Search, Star, Award, MapPin } from "lucide-react";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/scroll-reveal";
import PageHero from "@/components/page-hero";

// Standard role sorting priority
const roleOrder = [
  "ceo",
  "co-founder",
  "founder",
  "director",
  "project manager",
  "hr manager",
  "hr department",
  "team lead",
  "senior developer",
  "developer",
  "designer",
  "wordpress developer",
  "marketing",
  "support",
  "intern",
];

function getRolePriority(role: string): number {
  const r = role?.toLowerCase() || "";
  for (let i = 0; i < roleOrder.length; i++) {
    if (r.includes(roleOrder[i])) return i;
  }
  return 999;
}

// Department ordering for the grouped view
const departmentOrder = ["Leadership", "Management", "Engineering", "Design", "Marketing", "HR", "Support", "Interns"];

function getDeptPriority(dept: string): number {
  const idx = departmentOrder.indexOf(dept);
  return idx !== -1 ? idx : 999;
}

function TeamCard({ member, isLarge }: { member: any; isLarge?: boolean }) {
  const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
  const full_name = profile?.full_name || member.full_name;
  const role = member.role;
  const department = member.department;
  const bio = profile?.bio || member.bio;
  const experience = member.experience;
  const skillsList = typeof member.skills === "string"
    ? member.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
    : Array.isArray(member.skills)
    ? member.skills
    : [];
  const photo_url = profile?.avatar_url || member.photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80";
  const linkedin_url = member.linkedin_url;
  const github_url = member.github_url;
  const is_active = member.is_active;

  if (isLarge) {
    // Premium wide card for CEO/Founders/Leadership
    return (
      <StaggerItem className="col-span-1 md:col-span-2 lg:col-span-2">
        <div
          className="group relative rounded-2xl bg-[#0D1B2A]/40 border border-[#0D9488]/30 overflow-hidden flex flex-col md:flex-row h-full transition-all duration-400"
          style={{ transition: "transform 0.35s ease, box-shadow 0.35s ease" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 25px 60px rgba(13,148,136,0.22), 0 0 0 1px rgba(13,148,136,0.4)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          {/* Picture */}
          <div className="relative w-full md:w-2/5 h-64 md:h-auto min-h-[260px] bg-[#0A0F1E] overflow-hidden shrink-0">
            <Image
              src={photo_url}
              alt={full_name}
              fill
              sizes="(max-width: 768px) 100vw, 30vw"
              className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0A0F1E]/80 hidden md:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent md:hidden" />
            
            {/* VIP badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-[#0D9488] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
              <Award size={10} />
              Key Executive
            </div>
          </div>

          {/* Info container */}
          <div className="p-7 flex flex-col justify-between flex-1 relative z-10 bg-gradient-to-br from-[#0D1B2A]/90 to-[#0A0F1E]/95">
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#2DD4BF] font-mono">
                  {department}
                </span>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </div>
              </div>

              <h3
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                {full_name}
              </h3>
              <p className="text-sm font-semibold text-[#0D9488] mb-3">{role}</p>

              {bio && <p className="text-xs text-[#94A3B8] leading-relaxed mb-4 italic line-clamp-3">&ldquo;{bio}&rdquo;</p>}
            </div>

            <div>
              {/* Experience and Skills */}
              <div className="flex flex-wrap gap-1.5 mb-5 items-center">
                <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mr-2 font-mono">
                  {experience || "4+ years"} exp
                </span>
                {skillsList.map((s: string) => (
                  <span
                    key={s}
                    className="text-[10px] bg-white/5 border border-white/10 text-white/80 px-2.5 py-0.5 rounded font-mono"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Social icons */}
              <div className="flex gap-2">
                {linkedin_url && (
                  <a
                    href={linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#0D9488] hover:border-[#0D9488] text-[#94A3B8] hover:text-white transition-all"
                  >
                    <Linkedin size={14} />
                  </a>
                )}
                {github_url && (
                  <a
                    href={github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#0D9488] hover:border-[#0D9488] text-[#94A3B8] hover:text-white transition-all"
                  >
                    <Github size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </StaggerItem>
    );
  }

  // Regular card for other team members
  return (
    <StaggerItem>
      <div
        className="group relative rounded-2xl bg-white border border-[#E2E8F0] overflow-hidden flex flex-col h-full transition-all duration-400 hover:-translate-y-1.5"
        style={{ transition: "transform 0.35s ease, box-shadow 0.35s ease" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 40px rgba(0,0,0,0.06), 0 0 0 1px rgba(13,148,136,0.15)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        <div className="relative h-56 overflow-hidden bg-slate-50 shrink-0">
          <Image
            src={photo_url}
            alt={full_name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Availability status badge */}
          <div className="absolute top-4 right-4 z-10">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase backdrop-blur-md border ${
              is_active ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-gray-500/10 border-gray-500/20 text-gray-500"
            }`}>
              <div className={`w-1 h-1 rounded-full ${is_active ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
              {is_active ? "Active" : "Away"}
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1 bg-white relative z-10 justify-between">
          <div>
            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-[#0D9488] bg-[#F0FDFA] px-2 py-0.5 rounded mb-2.5 font-mono">
              {department}
            </span>
            <h3
              className="font-bold text-[#0F172A] text-base mb-0.5 group-hover:text-[#0D9488] transition-colors"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              {full_name}
            </h3>
            <p className="text-xs text-[#64748B] font-medium mb-3">{role}</p>
            {bio && <p className="text-xs text-[#94A3B8] italic mb-3 leading-relaxed line-clamp-2">{bio}</p>}
            <p className="text-[10px] text-[#94A3B8] mb-4 font-mono font-semibold">{experience || "1+ year"} experience</p>
          </div>

          <div>
            {/* Skills */}
            <div className="flex flex-wrap gap-1 mb-4">
              {skillsList.slice(0, 3).map((s: string) => (
                <span
                  key={s}
                  className="text-[9px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] px-2 py-0.5 rounded font-mono"
                >
                  {s}
                </span>
              ))}
              {skillsList.length > 3 && (
                <span className="text-[9px] text-[#94A3B8] self-center ml-1">+{skillsList.length - 3}</span>
              )}
            </div>

            {/* Social links */}
            <div className="flex gap-2">
              {linkedin_url && (
                <a
                  href={linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7.5 h-7.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center hover:bg-[#0D9488] hover:text-white text-[#64748B] hover:border-[#0D9488] transition-all"
                  style={{ width: 30, height: 30 }}
                >
                  <Linkedin size={13} />
                </a>
              )}
              {github_url && (
                <a
                  href={github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7.5 h-7.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center hover:bg-[#0D9488] hover:text-white text-[#64748B] hover:border-[#0D9488] transition-all"
                  style={{ width: 30, height: 30 }}
                >
                  <Github size={13} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </StaggerItem>
  );
}

export default function TeamClient({ members, departments }: { members: any[]; departments: string[] }) {
  const [active, setActive] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Sort and filter members
  const processedMembers = useMemo(() => {
    // Filter by search query and active tab
    return members
      .filter((m) => {
        const matchesTab = active === "All" || m.department === active;
        const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
        const nameStr = (profile?.full_name || m.full_name || "").toLowerCase();
        const roleStr = (m.role || "").toLowerCase();
        const skillsStr = (m.skills || "").toLowerCase();
        const queryStr = searchQuery.toLowerCase();
        const matchesSearch =
          nameStr.includes(queryStr) || roleStr.includes(queryStr) || skillsStr.includes(queryStr);
        return matchesTab && matchesSearch;
      })
      // Sort: CEO & founders first, then by rolePriority
      .sort((a, b) => {
        const priorityA = getRolePriority(a.role);
        const priorityB = getRolePriority(b.role);
        return priorityA - priorityB;
      });
  }, [members, active, searchQuery]);

  // Group members by department when 'All' is selected
  const groupedSections = useMemo(() => {
    if (active !== "All" || searchQuery) return [];
    
    const groups: Record<string, any[]> = {};
    processedMembers.forEach((m) => {
      const dept = m.department || "Other";
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(m);
    });

    return Object.keys(groups)
      .map((name) => ({
        name,
        members: groups[name],
      }))
      .sort((a, b) => getDeptPriority(a.name) - getDeptPriority(b.name));
  }, [processedMembers, active, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ProlxNavbar />

      <PageHero
        breadcrumb="Our Team"
        badge="Expert Builders"
        badgeIcon={<Award size={13} />}
        title={
          <>
            Meet the{" "}
            <span className="bg-gradient-to-r from-[#0D9488] to-[#0891B2] bg-clip-text text-transparent">
              Architects
            </span>
          </>
        }
        subtitle="Talented designers, engineers, and digital specialists united by a passion for building world-class enterprise platforms."
      />

      {/* Filter and Search Bar */}
      <section className="py-6 border-b border-[#E2E8F0] bg-white sticky top-[64px] md:top-[80px] z-40 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {departments.map((d) => (
              <button
                key={d}
                onClick={() => setActive(d)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  active === d
                    ? "bg-[#0D9488] text-white shadow shadow-teal-900/10"
                    : "bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1] hover:bg-[#CCFBF1]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search by name, role, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-full pl-9 pr-4 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0D9488] transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Team Directory grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {processedMembers.length === 0 ? (
            <ScrollReveal direction="scale" className="text-center py-24 bg-white border border-[#E2E8F0] rounded-2xl max-w-lg mx-auto shadow-sm">
              <div className="w-14 h-14 rounded-full bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center mx-auto mb-4">
                <Search size={22} className="text-[#0D9488]" />
              </div>
              <h3
                className="text-lg font-bold text-[#0F172A] mb-1.5"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                No Team Members Found
              </h3>
              <p className="text-[#64748B] text-sm px-6">
                No matching members fit your search or category filters. Try clearing some query parameters.
              </p>
            </ScrollReveal>
          ) : active === "All" && !searchQuery ? (
            /* Grouped views by department when rendering everything */
            <div className="space-y-20">
              {groupedSections.map((sect) => (
                <div key={sect.name} className="relative">
                  {/* Category Section title header */}
                  <div className="flex items-center gap-4 mb-8">
                    <h2
                      className="text-2xl font-extrabold text-[#0F172A] tracking-tight whitespace-nowrap"
                      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                      {sect.name}
                    </h2>
                    <div className="h-px bg-[#E2E8F0] w-full mt-1" />
                  </div>

                  <StaggerContainer key={sect.name + active + searchQuery} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" stagger={0.08}>
                    {sect.members.map((m) => (
                      <TeamCard
                        key={m.id}
                        member={m}
                        isLarge={sect.name === "Leadership" || sect.name === "Management" || getRolePriority(m.role) <= 1}
                      />
                    ))}
                  </StaggerContainer>
                </div>
              ))}
            </div>
          ) : (
            /* Flat view when filtering by category or query */
            <StaggerContainer key={active + searchQuery} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" stagger={0.08}>
              {processedMembers.map((m) => {
                const isLeadRole = getRolePriority(m.role) <= 1;
                const isGroupDept = m.department === "Leadership" || m.department === "Management";
                return (
                  <TeamCard
                    key={m.id}
                    member={m}
                    isLarge={isLeadRole || isGroupDept}
                  />
                );
              })}
            </StaggerContainer>
          )}
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
