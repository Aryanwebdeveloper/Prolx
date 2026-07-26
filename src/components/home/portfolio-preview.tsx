import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import { getPortfolioProjects } from "@/app/portfolio-actions";
import { StaggerContainer, StaggerItem } from "@/components/scroll-reveal";
import ScrollReveal from "@/components/scroll-reveal";

function BrowserFrame({ children, url }: { children: React.ReactNode; url?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-[#E2E8F0] shadow-lg">
      {/* Browser chrome */}
      <div className="bg-[#1E293B] px-3 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex-1 bg-[#0F172A] rounded-md px-2.5 py-1 text-[10px] text-[#64748B] font-mono flex items-center gap-1.5 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0D9488] shrink-0" />
          <span className="text-[#94A3B8] truncate">{url || "prolx.cloud/project"}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  "e-commerce":   { bg: "bg-amber-500/10",  text: "text-amber-600",  border: "border-amber-500/30" },
  "web app":      { bg: "bg-teal-500/10",   text: "text-teal-600",   border: "border-teal-500/30"  },
  "mobile":       { bg: "bg-indigo-500/10", text: "text-indigo-600", border: "border-indigo-500/30"},
  "saas":         { bg: "bg-violet-500/10", text: "text-violet-600", border: "border-violet-500/30"},
  "branding":     { bg: "bg-rose-500/10",   text: "text-rose-600",   border: "border-rose-500/30"  },
  "default":      { bg: "bg-teal-500/10",   text: "text-teal-600",   border: "border-teal-500/30"  },
};

function getCategoryStyle(category: string) {
  const key = category?.toLowerCase() ?? "default";
  return categoryColors[key] || categoryColors["default"];
}

function ProjectCard({ project }: { project: any }) {
  const title    = project.name;
  const category = project.category || "Project";
  const desc     = project.description || project.summary || "";
  const tags     = project.tech_stack
    ? project.tech_stack.split(",").map((t: string) => t.trim())
    : project.tags
    ? project.tags.split(",").map((t: string) => t.trim())
    : [];
  const img  = project.featured_image_url || project.thumbnail_url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80";
  const slug = project.slug;
  const style = getCategoryStyle(category);

  return (
    <StaggerItem>
      <div
        className="group relative rounded-2xl bg-white border border-[#E2E8F0] overflow-hidden transition-all duration-400 h-full hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(13,148,136,0.18),_0_4px_20px_rgba(0,0,0,0.08)]"
      >
        {/* Browser frame + image */}
        <div className="p-3 bg-[#F8FAFC]">
          <BrowserFrame url={`prolx.cloud/${slug}`}>
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
              <Image
                src={img}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Live preview overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-[#0D9488] text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                  <ExternalLink size={12} />
                  View Project
                </div>
              </div>
            </div>
          </BrowserFrame>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-3">
          {/* Category badge */}
          <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border mb-3 ${style.bg} ${style.text} ${style.border}`}>
            {category}
          </span>

          <h3
            className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#0D9488] transition-colors"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            {title}
          </h3>

          {desc && (
            <p className="text-sm text-[#64748B] mb-4 leading-relaxed line-clamp-2">{desc}</p>
          )}

          {/* Tech tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {tags.slice(0, 4).map((tag: string) => (
              <span
                key={tag}
                className="text-[10px] bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] px-2.5 py-1 rounded-md font-mono font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          <Link
            href={`/portfolio/${slug}`}
            className="inline-flex items-center gap-1.5 text-[#0D9488] text-sm font-bold group-hover:gap-2.5 transition-all duration-200"
          >
            View Case Study <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </StaggerItem>
  );
}

export default async function PortfolioPreview() {
  const { data: dbProjects } = await getPortfolioProjects();
  const displayProjects = dbProjects || [];

  if (displayProjects.length === 0) return null;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CCFBF1] to-transparent" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollReveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-2 rounded-full mb-5 font-mono">
                Featured Work
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold text-[#0F172A]"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Projects That{" "}
                <em
                  style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
                >
                  Speak for Themselves
                </em>
              </h2>
              <p className="text-[#64748B] text-base mt-3 max-w-lg leading-relaxed">
                A selection of real projects we&apos;ve delivered for startups and growing businesses.
              </p>
            </div>
            <Link
              href="/portfolio"
              id="portfolio-view-all"
              className="glow-btn shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-sm"
            >
              View All Projects
              <ArrowRight size={16} />
            </Link>
          </div>
        </ScrollReveal>

        {/* Cards */}
        <StaggerContainer className="grid md:grid-cols-2 gap-7" stagger={0.12}>
          {displayProjects.slice(0, 4).map((p: any) => (
            <ProjectCard key={p.name} project={p} />
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
