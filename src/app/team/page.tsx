"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronRight, Linkedin, Github, Twitter } from "lucide-react";

const departments = ["All", "Leadership", "Engineering", "Design", "Marketing"];

const team = [
  {
    name: "Zain Ahmad", role: "CEO & Co-Founder", dept: "Leadership",
    exp: "10 years", skills: ["Business Strategy", "Product Vision", "Client Relations"],
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
  },
  {
    name: "Sara Malik", role: "CTO & Co-Founder", dept: "Leadership",
    exp: "9 years", skills: ["System Architecture", "Cloud", "Engineering Leadership"],
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
  },
  {
    name: "Hassan Ali", role: "Lead Backend Engineer", dept: "Engineering",
    exp: "7 years", skills: ["Node.js", "PostgreSQL", "AWS", "Docker"],
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
  },
  {
    name: "Nida Khan", role: "Senior Frontend Engineer", dept: "Engineering",
    exp: "5 years", skills: ["React", "Next.js", "TypeScript", "Performance"],
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80",
  },
  {
    name: "Bilal Ahmed", role: "Mobile Developer", dept: "Engineering",
    exp: "4 years", skills: ["React Native", "Flutter", "iOS", "Android"],
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80",
  },
  {
    name: "Fatima Shah", role: "Lead UI/UX Designer", dept: "Design",
    exp: "6 years", skills: ["Figma", "User Research", "Design Systems", "Prototyping"],
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80",
  },
  {
    name: "Ali Raza", role: "Graphic Designer", dept: "Design",
    exp: "4 years", skills: ["Brand Design", "Illustration", "Motion", "Adobe CC"],
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80",
  },
  {
    name: "Omar Siddiqui", role: "Digital Marketing Lead", dept: "Marketing",
    exp: "5 years", skills: ["SEO", "Google Ads", "Content Strategy", "Analytics"],
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80",
  },
];

export default function TeamPage() {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? team : team.filter((m) => m.dept === active);

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
            50+ talented specialists united by a passion for building exceptional digital experiences.
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
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(({ name, role, dept, exp, skills, img }) => (
              <div
                key={name}
                className="group bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:border-[#2DD4BF] hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-56 overflow-hidden bg-[#F0FDFA]">
                  <Image src={img} alt={name} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D9488]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-5">
                  <span className="text-xs font-mono bg-[#F0FDFA] text-[#0D9488] px-2 py-0.5 rounded mb-2 inline-block">{dept}</span>
                  <h3 className="font-bold text-[#0F172A] text-base" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{name}</h3>
                  <p className="text-xs text-[#64748B] mb-1">{role}</p>
                  <p className="text-xs text-[#94A3B8] mb-3 font-mono">{exp} experience</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {skills.slice(0, 3).map((s) => (
                      <span key={s} className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] px-2 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {[Linkedin, Github, Twitter].map((Icon, i) => (
                      <a key={i} href="#" className="w-7 h-7 rounded-lg bg-[#F0FDFA] flex items-center justify-center hover:bg-[#0D9488] hover:text-white text-[#64748B] transition-colors">
                        <Icon size={14} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
