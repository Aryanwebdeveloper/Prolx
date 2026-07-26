"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronRight, BookOpen, ExternalLink, ArrowRight, Search } from "lucide-react";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/scroll-reveal";
import PageHero from "@/components/page-hero";

// Category colors for badges
const catColors: Record<string, string> = {
  "website":     "bg-blue-50   text-blue-600   border-blue-200",
  "web app":     "bg-teal-50   text-teal-600   border-teal-200",
  "mobile":      "bg-indigo-50 text-indigo-600 border-indigo-200",
  "saas":        "bg-violet-50 text-violet-600 border-violet-200",
  "e-commerce":  "bg-amber-50  text-amber-600  border-amber-200",
  "branding":    "bg-rose-50   text-rose-600   border-rose-200",
  "default":     "bg-teal-50   text-teal-600   border-teal-200",
};

function getBadgeClass(category: string) {
  const key = (category || "").toLowerCase();
  for (const k of Object.keys(catColors)) {
    if (key.includes(k)) return catColors[k];
  }
  return catColors["default"];
}

// Minimal browser-chrome frame wrapper
function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden border border-[#E2E8F0] shadow-md">
      <div className="bg-[#1E293B] px-3 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
          <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
          <div className="w-2 h-2 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex-1 bg-[#0F172A] rounded px-2 py-0.5 text-[9px] text-[#64748B] font-mono flex items-center gap-1.5 min-w-0">
          <div className="w-1 h-1 rounded-full bg-[#0D9488]" />
          <span className="truncate">{url}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function PortfolioClient({
  projects,
  categories,
}: {
  projects: any[];
  categories: string[];
}) {
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = projects.filter((p) => {
    const matchesCat = active === "All" || p.category === active;
    const q = search.toLowerCase();
    const matchesSearch =
      (p.name || "").toLowerCase().includes(q) ||
      (p.summary || "").toLowerCase().includes(q) ||
      (p.tech_stack || "").toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ProlxNavbar />

      <PageHero
        breadcrumb="Portfolio"
        badge="Our Work"
        title={
          <>
            Projects That{" "}
            <span className="bg-gradient-to-r from-[#0D9488] to-[#0891B2] bg-clip-text text-transparent">
              Speak
            </span>{" "}
            for Themselves
          </>
        }
        subtitle="We don't just build products — we craft digital experiences that drive real business results. Every project here is a real success story."
      />

      {/* Filter + Search Sticky Bar */}
      <section className="py-5 border-b border-[#E2E8F0] bg-white sticky top-[64px] md:top-[80px] z-40 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[10px] font-bold text-[#0F172A] uppercase tracking-widest shrink-0 font-mono mr-1">
              Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  active === cat
                    ? "bg-[#0D9488] text-white shadow shadow-teal-900/10"
                    : "bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1] hover:bg-[#CCFBF1]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-full pl-8 pr-4 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0D9488] transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          {!projects || projects.length === 0 ? (
            <ScrollReveal direction="scale">
              <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-[#E2E8F0]">
                <div className="w-16 h-16 rounded-full bg-[#F0FDFA] flex items-center justify-center mx-auto mb-5 border border-[#CCFBF1]">
                  <BookOpen className="text-[#0D9488]" size={26} />
                </div>
                <h2
                  className="text-2xl font-bold text-[#0F172A] mb-2"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  No Projects Yet
                </h2>
                <p className="text-[#64748B] text-sm max-w-md mx-auto">
                  We&apos;re currently polishing our latest case studies. Check back soon for new projects.
                </p>
              </div>
            </ScrollReveal>
          ) : filtered.length === 0 ? (
            <ScrollReveal direction="scale">
              <div className="text-center py-24 bg-white rounded-3xl border border-[#E2E8F0]">
                <p className="text-xl font-bold text-[#0F172A] mb-2">No matches found.</p>
                <p className="text-[#64748B] text-sm mb-5">Try a different category or clear your search.</p>
                <button
                  onClick={() => { setActive("All"); setSearch(""); }}
                  className="text-sm text-[#0D9488] font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            </ScrollReveal>
          ) : (
            <StaggerContainer key={active + search} className="grid md:grid-cols-2 gap-16" stagger={0.12}>
              {filtered.map((project) => {
                const techTags = (project.tech_stack || "")
                  .split(",")
                  .map((t: string) => t.trim())
                  .filter(Boolean);
                const badgeClass = getBadgeClass(project.category);

                return (
                  <StaggerItem key={project.id} className="group">
                    {/* Image with browser frame */}
                    <Link
                      href={`/portfolio/${project.slug}`}
                      className="block mb-7"
                      aria-label={`View ${project.name} case study`}
                    >
                      <BrowserFrame url={`prolx.cloud/${project.slug}`}>
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                          <Image
                            src={
                              project.featured_image_url ||
                              "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80"
                            }
                            alt={project.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-[#0A0F1E]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                            <span className="flex items-center gap-2 bg-white text-[#0F172A] px-6 py-2.5 rounded-full font-bold text-sm shadow-xl translate-y-3 group-hover:translate-y-0 transition-transform duration-400">
                              <ExternalLink size={14} />
                              View Case Study
                            </span>
                          </div>
                          {/* Featured badge */}
                          {project.is_featured && (
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#0D9488] px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow">
                              ⭐ Featured
                            </div>
                          )}
                        </div>
                      </BrowserFrame>
                    </Link>

                    {/* Project info */}
                    <div className="px-1">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${badgeClass}`}
                        >
                          {project.category || "General"}
                        </span>
                        {project.client && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                            <span className="text-xs font-semibold text-[#64748B]">{project.client}</span>
                          </>
                        )}
                      </div>

                      <Link href={`/portfolio/${project.slug}`}>
                        <h3
                          className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-3 group-hover:text-[#0D9488] transition-colors leading-tight"
                          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                        >
                          {project.name}
                        </h3>
                      </Link>

                      <p className="text-base text-[#64748B] mb-7 leading-relaxed line-clamp-2">
                        {project.summary ||
                          "A transformative digital solution tailored for business excellence."}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Tech tags */}
                        <div className="flex flex-wrap gap-2">
                          {techTags.slice(0, 4).map((t: string) => (
                            <span
                              key={t}
                              className="text-[10px] font-bold uppercase tracking-wider bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] px-3 py-1.5 rounded-lg font-mono"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* CTA link */}
                        <Link
                          href={`/portfolio/${project.slug}`}
                          className="inline-flex items-center gap-2 text-[#0D9488] font-bold text-sm uppercase tracking-wider hover:gap-3.5 transition-all duration-200"
                        >
                          Case Study <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* Premium Quote Banner */}
      <section className="py-24 bg-[#0A0F1E] text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#0D9488]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-15 pointer-events-none" />
        <ScrollReveal direction="up">
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2
              className="text-3xl md:text-5xl font-bold mb-6 italic text-white"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              &ldquo;Good design is obvious. Great design is transparent.&rdquo;
            </h2>
            <p className="text-[#94A3B8] font-bold uppercase tracking-widest text-xs mb-10">
              — JOE SPARANO
            </p>
            <Link
              href="/contact"
              className="glow-btn inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-sm"
            >
              Start Your Project
              <ArrowRight size={16} />
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <ProlxFooter />
    </div>
  );
}
