import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getPortfolioProjects } from "@/app/portfolio-actions";

export default async function PortfolioPreview() {
  const { data: dbProjects } = await getPortfolioProjects();

  const displayProjects = dbProjects || [];

  if (displayProjects.length === 0) {
    return null; // Don't show the section if there are no projects in the database
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 font-mono">
              Featured Work
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold text-[#0F172A]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Projects That{" "}
              <em
                style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
              >
                Speak for Themselves
              </em>
            </h2>
            <p className="text-[#64748B] text-sm mt-3 max-w-md">
              A selection of real projects we&apos;ve delivered for startups and growing businesses.
            </p>
          </div>
          <Link
            href="/portfolio"
            id="portfolio-view-all"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 border-2 border-[#0D9488] text-[#0D9488] font-semibold rounded-xl hover:bg-[#0D9488] hover:text-white transition-all"
          >
            View All Projects
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {displayProjects.slice(0, 4).map((p: any) => {
            const title = p.name;
            const category = p.category;
            const description = p.description || p.summary || "";
            const tags = p.tech_stack ? p.tech_stack.split(",").map((t: string) => t.trim()) : (p.tags ? p.tags.split(",").map((t: string) => t.trim()) : []);
            const img = p.featured_image_url || p.thumbnail_url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80"; 
            const slug = p.slug;

            return (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2DD4BF] hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                  <Image
                    src={img}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/60 to-transparent" />
                  <span className="absolute top-4 left-4 text-[10px] bg-white/90 backdrop-blur-sm text-[#0D9488] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {category || "Project"}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3
                    className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#0D9488] transition-colors"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    {title}
                  </h3>
                  {description && (
                    <p className="text-sm text-[#64748B] mb-4 leading-relaxed line-clamp-2">
                      {description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-4">
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
                    className="inline-flex items-center gap-1.5 text-[#0D9488] text-sm font-bold hover:gap-2.5 transition-all"
                  >
                    View Case Study <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

