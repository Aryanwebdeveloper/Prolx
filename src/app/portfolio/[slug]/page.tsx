import { getCaseStudyBySlug, getPortfolioProjects } from "@/app/portfolio-actions";
import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ChevronRight, CheckCircle2, Target, Lightbulb, Code2,
  BarChart3, Palette, Globe, ExternalLink, Github, ArrowRight,
} from "lucide-react";
import { Metadata } from "next";
import ScrollReveal from "@/components/scroll-reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: cs } = await getCaseStudyBySlug(slug);
  if (!cs) return { title: "Case Study | Prolx" };
  const proj = cs.portfolio_projects;
  return {
    title: `${cs.title || proj.name} | Prolx Portfolio`,
    description: proj.summary || cs.project_background?.slice(0, 155),
    openGraph: {
      images: cs.hero_image_url || proj.featured_image_url
        ? [{ url: cs.hero_image_url || proj.featured_image_url }]
        : [],
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: caseStudy } = await getCaseStudyBySlug(slug);

  if (!caseStudy) notFound();

  const { data: allProjects } = await getPortfolioProjects();
  const currentIndex =
    allProjects?.findIndex(
      (p: any) => p.slug === caseStudy.portfolio_projects.slug
    ) ?? -1;
  const nextProject =
    currentIndex !== -1 && allProjects
      ? allProjects[(currentIndex + 1) % allProjects.length]
      : null;

  const project = caseStudy.portfolio_projects;

  const metrics = caseStudy.metrics
    ?.split("\n")
    .map((m: string) => {
      const [label, value, desc] = m.split("|");
      return { label, value, desc };
    })
    .filter((m: any) => m.label && m.value) ?? [];

  const challenges = caseStudy.client_challenges
    ?.split("\n")
    .filter(Boolean) ?? [];

  const techList = (caseStudy.technologies || project.tech_stack || "")
    .split(",")
    .map((t: string) => t.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ProlxNavbar />

      {/* ── Dark Hero ──────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 bg-[#0A0F1E] overflow-hidden text-white">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#0D9488]/10 blur-[120px] animate-glow-pulse pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="up">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-[#94A3B8] mb-8 font-mono">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={14} className="text-[#0D9488]" />
              <Link href="/portfolio" className="hover:text-white transition-colors">Portfolio</Link>
              <ChevronRight size={14} className="text-[#0D9488]" />
              <span className="text-[#2DD4BF] truncate max-w-[200px]">{project.name}</span>
            </nav>

            <div className="grid lg:grid-cols-2 gap-12 items-end">
              <div>
                <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-[#0D9488]/30 text-[#2DD4BF] px-3 py-1 rounded-full mb-6 font-mono">
                  {project.category}
                </span>

                <h1
                  className="text-5xl md:text-6xl font-extrabold leading-[1.05] mb-7"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {caseStudy.title || project.name}
                </h1>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glow-btn inline-flex items-center gap-2 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white px-6 py-3 rounded-xl font-bold text-sm"
                    >
                      <ExternalLink size={15} />
                      View Live
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
                    >
                      <Github size={15} />
                      Source Code
                    </a>
                  )}
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap gap-8 pt-6 border-t border-white/10">
                  {[
                    { label: "Client", val: caseStudy.client_name || project.client },
                    { label: "Industry", val: caseStudy.industry || project.industry },
                    { label: "Duration", val: caseStudy.duration || "4 Months" },
                  ].map(({ label, val }) =>
                    val ? (
                      <div key={label}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] font-mono mb-1">
                          {label}
                        </p>
                        <p className="font-bold text-white text-sm">{val}</p>
                      </div>
                    ) : null
                  )}
                </div>
              </div>

              {/* Summary quote */}
              <div className="lg:pb-8">
                <p
                  className="text-lg text-[#94A3B8] leading-relaxed italic"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  &ldquo;{project.summary}&rdquo;
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Hero Image ─────────────────────────────────────── */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
          <Image
            src={caseStudy.hero_image_url || project.featured_image_url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&q=80"}
            alt={project.name}
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-16">

            {/* Left narrative */}
            <div className="lg:col-span-8 space-y-16">

              {/* Background */}
              <ScrollReveal direction="up">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center shrink-0">
                    <Globe size={20} className="text-[#0D9488]" />
                  </div>
                  <h2
                    className="text-3xl font-extrabold text-[#0F172A]"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Project Background
                  </h2>
                </div>
                <p className="text-lg text-[#64748B] leading-relaxed">
                  {caseStudy.project_background ||
                    "Exploring the origins and vision behind this transformative digital journey."}
                </p>
              </ScrollReveal>

              {/* Challenges */}
              {challenges.length > 0 && (
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-[#FFF7ED] flex items-center justify-center shrink-0">
                      <Target size={20} className="text-[#F97316]" />
                    </div>
                    <h2
                      className="text-3xl font-extrabold text-[#0F172A]"
                      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                      Client Challenges
                    </h2>
                  </div>
                  <ul className="grid sm:grid-cols-2 gap-4">
                    {challenges.map((c: string, i: number) => (
                      <li
                        key={i}
                        className="flex gap-3 p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm"
                      >
                        <CheckCircle2 className="text-[#0D9488] shrink-0 mt-0.5" size={18} />
                        <span className="font-semibold text-[#0F172A] text-sm leading-relaxed">
                          {c}
                        </span>
                      </li>
                    ))}
                  </ul>
                </ScrollReveal>
              )}

              {/* Research */}
              {caseStudy.research_strategy && (
                <ScrollReveal direction="up" delay={0.15}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
                      <Lightbulb size={20} className="text-[#6366F1]" />
                    </div>
                    <h2
                      className="text-3xl font-extrabold text-[#0F172A]"
                      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                      Research &amp; Strategy
                    </h2>
                  </div>
                  <p className="text-lg text-[#64748B] leading-relaxed">
                    {caseStudy.research_strategy}
                  </p>
                </ScrollReveal>
              )}

              {/* Design */}
              {caseStudy.design_process && (
                <ScrollReveal direction="up" delay={0.2}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-[#FDF2F8] flex items-center justify-center shrink-0">
                      <Palette size={20} className="text-[#DB2777]" />
                    </div>
                    <h2
                      className="text-3xl font-extrabold text-[#0F172A]"
                      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                      Design Process
                    </h2>
                  </div>
                  <p className="text-lg text-[#64748B] leading-relaxed">
                    {caseStudy.design_process}
                  </p>
                </ScrollReveal>
              )}

              {/* Development */}
              {caseStudy.development_approach && (
                <ScrollReveal direction="up" delay={0.25}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-[#F5F3FF] flex items-center justify-center shrink-0">
                      <Code2 size={20} className="text-[#7C3AED]" />
                    </div>
                    <h2
                      className="text-3xl font-extrabold text-[#0F172A]"
                      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                      Development Approach
                    </h2>
                  </div>
                  <p className="text-lg text-[#64748B] leading-relaxed">
                    {caseStudy.development_approach}
                  </p>
                </ScrollReveal>
              )}
            </div>

            {/* Right sticky sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">

                {/* Tech Stack */}
                <div className="p-7 rounded-2xl bg-[#0A0F1E] text-white shadow-xl">
                  <h4 className="font-bold text-[10px] uppercase tracking-widest text-[#2DD4BF] mb-5 font-mono">
                    Technology Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {techList.map((t: string) => (
                      <span
                        key={t}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/80 hover:bg-white/10 transition-colors font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Results Metrics */}
                {metrics.length > 0 && (
                  <div className="p-7 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#0D9488]/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
                    <h4 className="font-bold text-[10px] uppercase tracking-widest text-[#0D9488] mb-6 font-mono flex items-center gap-2">
                      <BarChart3 size={14} /> Results &amp; Metrics
                    </h4>
                    <div className="space-y-7 relative z-10">
                      {metrics.map((m: any, idx: number) => (
                        <div key={idx}>
                          <div className="text-4xl font-extrabold text-[#0F172A] mb-1 font-mono">
                            {m.value}
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[#0D9488] mb-1">
                            {m.label}
                          </div>
                          {m.desc && (
                            <div className="text-xs text-[#64748B] leading-snug">{m.desc}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sidebar CTA */}
                <div className="p-7 rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#0891B2] text-white shadow-lg">
                  <h4 className="font-bold text-base mb-2">Have a similar project?</h4>
                  <p className="text-white/80 text-xs mb-5 leading-relaxed">
                    Let&apos;s discuss how we can bring similar results to your business.
                  </p>
                  <Link
                    href="/contact"
                    className="flex items-center justify-center gap-2 bg-white text-[#0D9488] w-full py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Work With Us
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Screenshots Gallery ─────────────────────────────── */}
      {caseStudy.screenshots && caseStudy.screenshots.length > 0 && (
        <section className="py-24 bg-white border-t border-[#E2E8F0]">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-2 rounded-full mb-5 font-mono">
                Visual Interface
              </div>
              <h2
                className="text-4xl font-bold text-[#0F172A]"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Experience the Results
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-8">
              {caseStudy.screenshots.map((url: string, idx: number) => (
                <ScrollReveal key={idx} direction={idx % 2 === 0 ? "left" : "right"} delay={idx * 0.08}>
                  <div className="group relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-[#E2E8F0] hover:scale-[1.02] transition-all duration-400">
                    <Image
                      src={url}
                      alt={`Screenshot ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg scale-0 group-hover:scale-100 transition-transform duration-300">
                        <ExternalLink size={18} className="text-[#0D9488]" />
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Next Project CTA ───────────────────────────────── */}
      <section className="py-24 bg-[#0A0F1E] text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#0D9488]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-15 pointer-events-none" />
        <ScrollReveal direction="up">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B] mb-3 font-mono">
                  Up Next
                </p>
                <h3
                  className="text-4xl font-extrabold mb-3"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {nextProject ? nextProject.name : "Start Your Own Project"}
                </h3>
                {nextProject && (
                  <Link
                    href={`/portfolio/${nextProject.slug}`}
                    className="inline-flex items-center gap-1.5 text-[#2DD4BF] font-bold text-sm hover:gap-3 transition-all duration-200"
                  >
                    View Case Study <ArrowRight size={14} />
                  </Link>
                )}
              </div>

              <Link
                href="/contact"
                className="glow-btn shrink-0 inline-flex items-center gap-2.5 px-9 py-4 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-base"
              >
                Start Your Success Story
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <ProlxFooter />
    </div>
  );
}
