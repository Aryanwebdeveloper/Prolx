import Link from "next/link";
import Image from "next/image";

const projects = [
  {
    title: "FinEdge Banking App",
    category: "Mobile App Development",
    tags: ["React Native", "Node.js", "PostgreSQL"],
    img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
    slug: "finedge-banking-app",
    size: "lg",
  },
  {
    title: "Bloom E-commerce Platform",
    category: "E-commerce Development",
    tags: ["Next.js", "Shopify", "Tailwind"],
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
    slug: "bloom-ecommerce",
    size: "sm",
  },
  {
    title: "MedCare Patient Portal",
    category: "Custom Web Application",
    tags: ["React", "Supabase", "TypeScript"],
    img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    slug: "medcare-patient-portal",
    size: "sm",
  },
  {
    title: "TechHub SaaS Dashboard",
    category: "SaaS Development",
    tags: ["Next.js", "Prisma", "AWS"],
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    slug: "techhub-saas-dashboard",
    size: "lg",
  },
];

export default function PortfolioPreview() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 font-mono">
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
          </div>
          <Link
            href="/portfolio"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 border-2 border-[#0D9488] text-[#0D9488] font-semibold rounded-xl hover:bg-[#0D9488] hover:text-white transition-all"
          >
            View All Projects
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {projects.map(({ title, category, tags, img, slug }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer"
            >
              <Image
                src={img}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-[#2DD4BF] text-xs font-mono mb-1">{category}</p>
                <h3
                  className="text-white text-xl font-bold mb-2"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {title}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-white/20 text-white px-2 py-0.5 rounded font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/portfolio/${slug}`}
                  className="inline-flex items-center gap-1 text-[#F97316] text-sm font-semibold hover:underline"
                >
                  View Case Study →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
