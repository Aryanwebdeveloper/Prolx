import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, User, Clock } from "lucide-react";
import { getBlogPosts } from "@/app/blog-actions";
import ScrollReveal from "@/components/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/scroll-reveal";

const categoryColors: Record<string, string> = {
  "Strategy": "bg-violet-50 text-violet-600 border-violet-200",
  "Tech":     "bg-blue-50   text-blue-600   border-blue-200",
  "Design":   "bg-rose-50   text-rose-600   border-rose-200",
  "General":  "bg-teal-50   text-teal-600   border-teal-200",
};

const dummyPosts = [
  {
    id: "dummy-1",
    title: "How to Scale Your Business with a Modern Digital Product",
    excerpt: "In 2026, the digital landscape is more competitive than ever. Here's a comprehensive guide to scaling your brand effectively.",
    featured_image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
    created_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    author_name: "Zain Ahmad",
    slug: "scale-your-business-2026",
    category: "Strategy",
    read_time: "5 min",
  },
  {
    id: "dummy-2",
    title: "The Future of Mobile App Development in the PWA Era",
    excerpt: "Progressive Web Apps are changing the game for small and medium businesses. Find out if a PWA is right for your next project.",
    featured_image_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80",
    created_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    author_name: "Sara Malik",
    slug: "future-of-pwas",
    category: "Tech",
    read_time: "4 min",
  },
  {
    id: "dummy-3",
    title: "Why UX Design is the Highest ROI Activity for Startups",
    excerpt: "A beautiful UI gets people through the door, but a seamless UX keeps them coming back. Learn why design is a strategic investment.",
    featured_image_url: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=600&q=80",
    created_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    author_name: "Fatima Shah",
    slug: "ux-design-roi",
    category: "Design",
    read_time: "6 min",
  },
];

export default async function BlogPreview() {
  const { data: posts } = await getBlogPosts({ publishedOnly: true });
  const latestPosts = (posts || []).slice(0, 3);
  const displayPosts = latestPosts.length > 0 ? latestPosts : dummyPosts;

  return (
    <section className="py-24 bg-[#F8FAFC] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CCFBF1] to-transparent" />
      <div className="absolute -top-10 left-1/3 w-64 h-64 rounded-full bg-[#0D9488]/5 blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <ScrollReveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-2 rounded-full mb-5 font-mono">
                Insights &amp; News
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold text-[#0F172A]"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                From Our{" "}
                <em style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}>
                  Journal
                </em>
              </h2>
            </div>
            <Link
              href="/blog"
              className="glow-btn shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-sm"
            >
              Read All Articles
              <ArrowRight size={16} />
            </Link>
          </div>
        </ScrollReveal>

        {/* Cards */}
        <StaggerContainer className="grid md:grid-cols-3 gap-7" stagger={0.1}>
          {displayPosts.map((post) => {
            const catStyle = categoryColors[post.category || "General"] || categoryColors["General"];
            return (
              <StaggerItem key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col h-full bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:-translate-y-2 transition-all duration-350"
                  style={{ transition: "transform 0.35s ease, box-shadow 0.35s ease" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(13,148,136,0.15), 0 4px 20px rgba(0,0,0,0.06)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <Image
                      src={post.featured_image_url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80"}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Category badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${catStyle}`}>
                        {post.category || "General"}
                      </span>
                    </div>
                    {/* Read time */}
                    {post.read_time && (
                      <div className="absolute top-4 right-4">
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                          <Clock size={10} />
                          {post.read_time} read
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-[10px] text-[#94A3B8] font-semibold uppercase tracking-widest mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-[#0D9488]" />
                        {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User size={11} className="text-[#0D9488]" />
                        {post.author_name || "Prolx Team"}
                      </span>
                    </div>

                    <h3
                      className="text-lg font-bold text-[#0F172A] mb-3 group-hover:text-[#0D9488] transition-colors line-clamp-2 flex-1"
                      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                      {post.title}
                    </h3>

                    <p className="text-sm text-[#64748B] line-clamp-2 mb-5">
                      {post.excerpt}
                    </p>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0D9488] flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-200">
                        Read More <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
