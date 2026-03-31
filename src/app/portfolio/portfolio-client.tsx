"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronRight, BookOpen } from "lucide-react";

export default function PortfolioClient({ projects, categories }: { projects: any[]; categories: string[] }) {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-[#F0FDFA] to-white overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0D9488]/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
          
          <div className="flex items-center gap-2 text-sm font-bold text-[#64748B] mb-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <Link href="/" className="hover:text-[#0D9488] transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-[#0D9488]">Portfolio</span>
          </div>
          
          <div className="max-w-4xl">
            <h1
              className="text-5xl md:text-7xl font-extrabold text-[#0F172A] mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Projects That{" "}
              <em style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}>
                Speak
              </em>{" "}
              for Themselves
            </h1>
            <p className="text-[#64748B] text-xl md:text-2xl max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
              We don&apos;t just build products; we craft digital legacies. Explore our showcase of innovation, 
              precision, and transformative results.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs - Premium Sticky */}
      <section className="sticky top-[72px] z-30 bg-white/80 backdrop-blur-md py-6 border-y border-[#F1F5F9]">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-[#0F172A] uppercase tracking-widest mr-2">Filter By:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  active === cat
                    ? "bg-[#0F172A] text-white shadow-xl shadow-black/10 scale-105"
                    : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid - Premium Masonry-like */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          {!projects || projects.length === 0 ? (
            <div className="text-center py-32 bg-[#F8FAFC] rounded-[2rem] border-2 border-dashed border-[#E2E8F0]">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <BookOpen className="text-[#94A3B8]" size={32} />
               </div>
               <h2 className="text-2xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>No Masterpieces Found Yet</h2>
               <p className="text-[#64748B] max-w-md mx-auto">We're currently polishing our latest successes. Check back soon for new case studies.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
              {filtered.map((project, idx) => (
                <div
                  key={project.id}
                  className={`group relative animate-in fade-in slide-in-from-bottom-8 duration-700 delay-[${idx * 100}ms]`}
                >
                  <Link href={`/portfolio/${project.slug}`} className="block overflow-hidden rounded-[2rem] bg-[#F1F5F9] aspect-[16/10] relative mb-8">
                    <Image
                      src={project.featured_image_url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80"}
                      alt={project.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px] flex items-center justify-center">
                       <span className="bg-white text-[#0F172A] px-8 py-3 rounded-full font-bold shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          View Case Study
                       </span>
                    </div>
                    {project.is_featured && (
                      <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black tracking-widest text-[#0D9488] shadow-sm uppercase">
                        ⭐ Top Tier Project
                      </div>
                    )}
                  </Link>

                  <div className="px-2">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-[#0D9488]">
                        {project.category || "General"}
                      </span>
                      <div className="w-1 h-1 bg-[#CBD5E1] rounded-full"></div>
                      <span className="text-xs font-bold text-[#64748B]">
                        {project.client}
                      </span>
                    </div>
                    
                    <h3
                      className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-4 group-hover:text-[#0D9488] transition-colors leading-tight"
                      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                      {project.name}
                    </h3>
                    
                    <p className="text-lg text-[#64748B] mb-8 leading-relaxed line-clamp-2">
                      {project.summary || "A transformative digital solution tailored for business excellence and user engagement."}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-6">
                      <div className="flex flex-wrap gap-2">
                        {(project.tech_stack?.split(",") || []).slice(0, 4).map((t: string) => (
                          <span
                            key={t}
                            className="text-[10px] font-bold uppercase tracking-widest bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] px-3 py-1.5 rounded-lg"
                          >
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                      
                      <Link
                        href={`/portfolio/${project.slug}`}
                        className="inline-flex items-center gap-2 group/link text-[#0F172A] font-black text-sm uppercase tracking-widest hover:text-[#0D9488] transition-colors"
                      >
                        Explore Case Study
                        <ChevronRight size={18} className="transform group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length === 0 && projects.length > 0 && (
            <div className="text-center py-32 text-[#64748B]">
              <p className="text-xl font-bold text-[#0F172A] mb-2">No matches found in this niche.</p>
              <p>Try exploring another category or view all our projects.</p>
              <button 
                onClick={() => setActive("All")}
                className="mt-6 text-[#0D9488] font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-24 bg-[#0F172A] text-white overflow-hidden relative">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#0D9488]/10 rounded-full blur-[100px]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 italic" style={{ fontFamily: "'Fraunces', serif" }}>
            "Good design is obvious. Great design is transparent."
          </h2>
          <p className="text-[#94A3B8] font-bold uppercase tracking-widest text-sm">— JOE SPARANO</p>
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
