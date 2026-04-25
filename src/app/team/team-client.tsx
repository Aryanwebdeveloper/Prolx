"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronRight, Linkedin, Github, Twitter } from "lucide-react";

export default function TeamClient({ members, departments }: { members: any[]; departments: string[] }) {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? members : members.filter((m) => m.department === active);

  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      <section className="pt-28 pb-16 bg-[#F0FDFA]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
            <Link href="/" className="hover:text-[#0D9488]">Home</Link>
            <ChevronRight size={14} />
            <span className="text-[#0D9488]">Our Team</span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Meet the{" "}
            <em style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}>
              Team
            </em>
          </h1>
          <p className="text-[#64748B] text-lg max-w-xl">
            Talented specialists united by a passion for building exceptional digital experiences.
          </p>
        </div>
      </section>

      <section className="py-8 border-b border-[#E2E8F0]">
        <div className="container mx-auto px-4 flex flex-wrap gap-3">
          {departments.map((d) => (
            <button
              key={d}
              onClick={() => setActive(d)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                active === d ? "bg-[#0D9488] text-white shadow" : "bg-[#F0FDFA] text-[#64748B] hover:bg-[#CCFBF1] hover:text-[#0D9488]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {!members || members.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#E2E8F0] rounded-2xl">
               <h2 className="text-xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>No Team Members Found</h2>
               <p className="text-[#64748B] text-sm text-center">We haven't added any team members yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map(({ id, full_name, role, department, bio, experience, skills, photo_url, linkedin_url, github_url }) => (
                <div
                  key={id}
                  className="group bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:border-[#2DD4BF] hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden bg-[#F0FDFA]">
                    <Image src={photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80"} alt={full_name} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D9488]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-xs font-mono bg-[#F0FDFA] text-[#0D9488] px-2 py-0.5 rounded mb-2 w-fit">{department}</span>
                    <h3 className="font-bold text-[#0F172A] text-base" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{full_name}</h3>
                    <p className="text-xs text-[#64748B] mb-1">{role}</p>
                    {bio && <p className="text-xs text-[#94A3B8] italic mb-2 leading-relaxed">{bio}</p>}
                    <p className="text-xs text-[#94A3B8] mb-3 font-mono">{experience || '1+ year'} experience</p>
                    <div className="flex flex-wrap gap-1 mb-4 flex-1">
                      {(Array.isArray(skills) ? skills : []).slice(0, 3).map((s: string) => (
                        <span key={s} className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] px-2 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-auto">
                      {linkedin_url && (
                        <a href={linkedin_url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-[#F0FDFA] flex items-center justify-center hover:bg-[#0D9488] hover:text-white text-[#64748B] transition-colors">
                          <Linkedin size={14} />
                        </a>
                      )}
                      {github_url && (
                        <a href={github_url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-[#F0FDFA] flex items-center justify-center hover:bg-[#0D9488] hover:text-white text-[#64748B] transition-colors">
                          <Github size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {filtered.length === 0 && members.length > 0 && (
            <div className="text-center py-20 text-[#64748B]">
              No members found in this department.
            </div>
          )}
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
