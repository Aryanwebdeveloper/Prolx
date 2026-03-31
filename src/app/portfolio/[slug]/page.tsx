import { getCaseStudyBySlug, getPortfolioProjects } from "@/app/portfolio-actions";
import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, CheckCircle2, Target, Lightbulb, Code2, BarChart3, Palette, Globe, ExternalLink, Github, ArrowRight } from "lucide-react";

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: caseStudy, error } = await getCaseStudyBySlug(slug);

  if (!caseStudy) {
    notFound();
  }

  const { data: allProjects } = await getPortfolioProjects();
  const currentIndex = allProjects?.findIndex((p: any) => p.slug === caseStudy.portfolio_projects.slug) ?? -1;
  const nextProject = currentIndex !== -1 && allProjects ? allProjects[(currentIndex + 1) % allProjects.length] : null;

  const project = caseStudy.portfolio_projects;
  const metrics = caseStudy.metrics?.split("\n").map((m: string) => {
    const [label, value, desc] = m.split("|");
    return { label, value, desc };
  }).filter((m: any) => m.label && m.value);

  const challenges = caseStudy.client_challenges?.split("\n").filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      {/* Breadcrumbs & Header */}
      <section className="pt-32 pb-16 bg-[#F8FAFC]">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm font-bold text-[#64748B] mb-8">
            <Link href="/" className="hover:text-[#0D9488]">Home</Link>
            <ChevronRight size={14} />
            <Link href="/portfolio" className="hover:text-[#0D9488]">Portfolio</Link>
            <ChevronRight size={14} />
            <span className="text-[#0D9488]">{project.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-xs font-black uppercase tracking-widest mb-6">
                {project.category}
              </span>
              <h1 
                className="text-5xl md:text-7xl font-extrabold text-[#0F172A] mb-8 leading-[1.1]"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                {caseStudy.title || project.name}
              </h1>
              
              <div className="flex flex-wrap gap-4 mb-8">
                {project.live_url && (
                  <a 
                    href={project.live_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#0D9488] hover:bg-[#0B7A6F] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-[#0D9488]/20"
                  >
                    <ExternalLink size={18} />
                    View Live Application
                  </a>
                )}
                {project.github_url && (
                  <a 
                    href={project.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] px-6 py-3 rounded-xl font-bold transition-all border border-[#E2E8F0]"
                  >
                    <Github size={18} />
                    Source Code
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-8 py-8 border-t border-[#E2E8F0]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B] mb-1">Client</p>
                  <p className="font-bold text-[#0F172A]">{caseStudy.client_name || project.client}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B] mb-1">Industry</p>
                  <p className="font-bold text-[#0F172A]">{caseStudy.industry || project.industry}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B] mb-1">Duration</p>
                  <p className="font-bold text-[#0F172A]">4 Months</p>
                </div>
              </div>
            </div>
            
            <div className="lg:pb-8">
              <p className="text-xl text-[#475569] leading-relaxed italic" style={{ fontFamily: "'Fraunces', serif" }}>
                "{project.summary}"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="aspect-[21/9] rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
          <Image 
            src={caseStudy.hero_image_url || project.featured_image_url} 
            alt={project.name}
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-16">
            
            {/* Left Column: Narrative */}
            <div className="lg:col-span-8 space-y-20">
              
              {/* Background */}
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#F0FDFA] flex items-center justify-center text-[#0D9488]">
                    <Globe size={24} />
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Project Background</h2>
                </div>
                <div className="text-lg text-[#64748B] leading-relaxed prose max-w-none">
                  {caseStudy.project_background || "Exploring the origins and vision behind the digital transformation journey."}
                </div>
              </div>

              {/* Challenges */}
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] flex items-center justify-center text-[#F97316]">
                    <Target size={24} />
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Client Challenges</h2>
                </div>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {(challenges && challenges.length > 0 ? challenges : ["Integrating legacy systems", "Scaling for high traffic", "Improving user retention"]).map((c: string, i: number) => (
                    <li key={i} className="flex gap-3 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <CheckCircle2 className="text-[#0D9488] flex-shrink-0 mt-1" size={18} />
                      <span className="font-bold text-[#0F172A] text-sm">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Research & Strategy */}
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center text-[#6366F1]">
                    <Lightbulb size={24} />
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Research & Strategy</h2>
                </div>
                <p className="text-lg text-[#64748B] leading-relaxed">
                  {caseStudy.research_strategy || "A data-driven approach to understanding user behavior and market demands."}
                </p>
              </div>

              {/* Design & UX */}
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] flex items-center justify-center text-[#DB2777]">
                    <Palette size={24} />
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Design Process</h2>
                </div>
                <p className="text-lg text-[#64748B] leading-relaxed">
                  {caseStudy.design_process || "Crafting intuitive interfaces that prioritize accessibility and brand identity."}
                </p>
              </div>

              {/* Development */}
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5F3FF] flex items-center justify-center text-[#7C3AED]">
                    <Code2 size={24} />
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Development Approach</h2>
                </div>
                <p className="text-lg text-[#64748B] leading-relaxed">
                  {caseStudy.development_approach || "Building modular, secure, and high-performance systems ready for scale."}
                </p>
              </div>

            </div>

            {/* Right Column: Sticky Sidebar Info */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-8">
                
                {/* Tech Stack */}
                <div className="p-8 rounded-[2rem] bg-[#0F172A] text-white shadow-xl">
                  <h4 className="font-black text-xs uppercase tracking-widest text-[#0D9488] mb-6">Technology Stack</h4>
                  <div className="flex flex-wrap gap-3">
                    {(caseStudy.technologies || project.tech_stack || "").split(",").map((t: string) => (
                      <span key={t} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-colors">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Results Card */}
                <div className="p-8 rounded-[2rem] bg-[#F8FAFC] border border-[#E2E8F0] shadow-sm overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0D9488]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                  <h4 className="font-black text-xs uppercase tracking-widest text-[#0D9488] mb-8 flex items-center gap-2">
                    <BarChart3 size={16} /> Results & Metrics
                  </h4>
                  <div className="space-y-8 relative z-10">
                    {metrics && metrics.length > 0 ? metrics.map((m: any, idx: number) => (
                      <div key={idx} className="animate-in fade-in slide-in-from-right-4 duration-500 delay-[200ms]">
                        <div className="text-4xl font-black text-[#0F172A] mb-1">{m.value}</div>
                        <div className="text-xs font-black uppercase tracking-widest text-[#0D9488] mb-1">{m.label}</div>
                        <div className="text-sm text-[#64748B] leading-snug">{m.desc}</div>
                      </div>
                    )) : (
                      <div className="text-[#64748B] text-sm py-4">Compiling detailed results...</div>
                    )}
                  </div>
                </div>

                {/* Sidebar CTA */}
                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white">
                  <h4 className="font-bold text-lg mb-4">Have a similar project?</h4>
                  <p className="text-white/80 text-sm mb-6 leading-relaxed">Let's discuss how we can bring similar results to your business.</p>
                  <Link href="/contact" className="flex items-center justify-center gap-2 bg-white text-[#0D9488] w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-opacity-90 transition-colors">
                    Work With Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Screenshots Gallery */}
      {caseStudy.screenshots && caseStudy.screenshots.length > 0 && (
        <section className="py-24 bg-[#F8FAFC]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-xs font-black uppercase tracking-widest text-[#0D9488] mb-4 block">Visual Interface</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Experience the Results</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {caseStudy.screenshots.map((url: string, idx: number) => (
                <div key={idx} className="group relative aspect-video rounded-[2.5rem] overflow-hidden shadow-xl border border-[#E2E8F0] transform hover:scale-[1.02] transition-all duration-500">
                  <Image 
                    src={url} 
                    alt={`Interface Preview ${idx + 1}`} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full text-[#0D9488] scale-0 group-hover:scale-100 transition-transform duration-500">
                      <ExternalLink size={24} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Next Project / Footer CTA */}
      <section className="py-32 bg-white border-t border-[#F1F5F9]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
            <div>
              <p className="text-[#64748B] font-black uppercase tracking-[0.2em] text-[10px] mb-4">Up Next</p>
              <h3 className="text-4xl font-extrabold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                {nextProject ? nextProject.name : "Start Your Own Project"}
              </h3>
              {nextProject && (
                <Link 
                  href={`/portfolio/${nextProject.slug}`}
                  className="inline-flex items-center gap-2 text-[#0D9488] font-black uppercase tracking-widest text-[10px] hover:gap-4 transition-all"
                >
                  View Case Study <ArrowRight size={14} />
                </Link>
              )}
            </div>
            
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-4 bg-[#0F172A] hover:bg-black text-white px-10 py-5 rounded-full text-lg font-bold transition-all shadow-2xl hover:translate-y-[-4px] active:scale-95"
            >
              Start Your Success Story
              <ChevronRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
