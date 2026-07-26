"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { ChevronRight, Search, Clock, Calendar, User, ArrowRight, Sparkles } from "lucide-react";
import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/scroll-reveal";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  featured_image_url?: string;
  created_at: string;
  published_at?: string;
  author_name?: string;
  slug: string;
  category?: string;
  read_time?: string;
  featured?: boolean;
}

const categoryColors: Record<string, string> = {
  Strategy: "bg-violet-500/10 text-violet-400 border-violet-500/25",
  Tech: "bg-blue-500/10 text-blue-400 border-blue-500/25",
  Design: "bg-rose-500/10 text-rose-400 border-rose-500/25",
  General: "bg-teal-500/10 text-teal-400 border-teal-500/25",
  default: "bg-teal-500/10 text-teal-400 border-teal-500/25",
};

export default function BlogClient({ posts, categories }: { posts: BlogPost[]; categories: string[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const featured = useMemo(() => {
    return posts.find((p) => p.featured) || posts[0];
  }, [posts]);

  const restPosts = useMemo(() => {
    if (!featured) return posts;
    return posts.filter((p) => p.id !== featured.id);
  }, [posts, featured]);

  const filtered = useMemo(() => {
    return restPosts.filter(
      (p) =>
        (activeCategory === "All" || p.category === activeCategory) &&
        ((p.title || "").toLowerCase().includes(search.toLowerCase()) ||
          (p.excerpt || "").toLowerCase().includes(search.toLowerCase()))
    );
  }, [restPosts, activeCategory, search]);

  if (!posts || posts.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <ProlxNavbar />
        <section className="relative pt-32 pb-20 bg-[#0A0F1E] overflow-hidden text-white">
          <div className="container mx-auto px-4 text-center py-20">
            <h1 className="text-4xl font-bold mb-4">No Posts Found</h1>
            <p className="text-[#94A3B8]">There are currently no published blog posts.</p>
          </div>
        </section>
        <ProlxFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ProlxNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-[#0A0F1E] overflow-hidden text-white">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#0D9488]/10 blur-[120px] animate-glow-pulse pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="up">
            <div className="flex items-center gap-2 text-sm text-[#94A3B8] mb-5 font-mono">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={14} className="text-[#0D9488]" />
              <span className="text-[#2DD4BF]">Blog</span>
            </div>
            <h1
              className="text-5xl md:text-6xl font-extrabold mb-5"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Insights &amp;{" "}
              <em className="text-shimmer" style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
                Resources
              </em>
            </h1>
            <p className="text-[#94A3B8] text-lg max-w-xl leading-relaxed">
              Practical guides, technical deep dives, and digital product strategy from the Prolx creative team.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Article Section */}
      {featured && (
        <section className="py-12 bg-white relative">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up">
              <div className="grid lg:grid-cols-2 gap-8 bg-[#0D1B2A]/40 border border-[#0D9488]/30 rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Image */}
                <div className="relative h-72 lg:h-auto min-h-[340px] overflow-hidden">
                  <Image
                    src={featured.featured_image_url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80"}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover hover:scale-103 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent opacity-60" />
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-[#0D1B2A]/90 to-[#0A0F1E]/95 text-white">
                  <div className="flex items-center gap-3 mb-5">
                    {featured.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-[#2DD4BF] px-3 py-1 rounded-full font-mono">
                        {featured.category}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#F97316]/10 border border-[#F97316]/20 text-[#F97316] px-2.5 py-1 rounded-full">
                      <Sparkles size={10} />
                      Featured Post
                    </span>
                  </div>

                  <h2
                    className="text-3xl lg:text-4xl font-bold mb-4 leading-tight"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    {featured.title}
                  </h2>
                  <p className="text-[#94A3B8] text-sm leading-relaxed mb-6 line-clamp-3">{featured.excerpt}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] mb-8 font-mono">
                    {featured.author_name && (
                      <span className="flex items-center gap-1.5 text-white/70">
                        <User size={13} className="text-[#0D9488]" />
                        {featured.author_name}
                      </span>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1.5 text-[#94A3B8]">
                      <Calendar size={13} className="text-[#0D9488]" />
                      {new Date(featured.published_at || featured.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    {featured.read_time && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1.5 text-[#94A3B8]">
                          <Clock size={13} className="text-[#0D9488]" />
                          {featured.read_time} read
                        </span>
                      </>
                    )}
                  </div>

                  <Link
                    href={`/blog/${featured.slug}`}
                    className="glow-btn inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-sm w-fit"
                  >
                    Read Article
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Filter and Search Bar */}
      <section className="py-6 border-b border-[#E2E8F0] bg-white sticky top-[64px] md:top-[80px] z-40 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-[#0D9488] text-white shadow shadow-teal-900/10"
                    : "bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1] hover:bg-[#CCFBF1]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-full pl-9 pr-4 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0D9488] transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Blog Cards Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {filtered.length === 0 ? (
            <ScrollReveal direction="scale" className="text-center py-24 bg-white border border-[#E2E8F0] rounded-2xl max-w-lg mx-auto shadow-sm">
              <div className="w-14 h-14 rounded-full bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center mx-auto mb-4">
                <Search size={22} className="text-[#0D9488]" />
              </div>
              <h3
                className="text-lg font-bold text-[#0F172A] mb-1.5"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                No Articles Found
              </h3>
              <p className="text-[#64748B] text-sm px-6">
                No matching articles fit your search filters. Try a different keyword query.
              </p>
            </ScrollReveal>
          ) : (
            <StaggerContainer key={activeCategory + search} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" stagger={0.1}>
              {filtered.map((post) => {
                const catStyle = categoryColors[post.category || "General"] || categoryColors["default"];
                return (
                  <StaggerItem key={post.id}>
                    <article
                      className="group flex flex-col h-full bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:-translate-y-1.5 transition-all duration-350"
                      style={{
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        transition: "transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 40px rgba(13,148,136,0.12), 0 0 0 1px rgba(13,148,136,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                      }}
                    >
                      {/* Image */}
                      <div className="relative h-52 overflow-hidden bg-slate-50 shrink-0">
                        <Image
                          src={post.featured_image_url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80"}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Category badge overlay */}
                        {post.category && (
                          <div className="absolute top-4 left-4">
                            <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${catStyle} bg-white/95 backdrop-blur-sm`}>
                              {post.category}
                            </span>
                          </div>
                        )}
                        
                        {/* Read time overlay */}
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
                      <div className="p-6 flex flex-col flex-1 justify-between">
                        <div>
                          <div className="flex items-center gap-3 text-[10px] text-[#94A3B8] font-semibold uppercase tracking-widest mb-3 font-mono">
                            <span className="flex items-center gap-1">
                              <Calendar size={11} className="text-[#0D9488]" />
                              {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>

                          <Link href={`/blog/${post.slug}`} className="block">
                            <h3
                              className="text-lg font-bold text-[#0F172A] mb-2.5 group-hover:text-[#0D9488] transition-colors line-clamp-2 leading-snug"
                              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                            >
                              {post.title}
                            </h3>
                          </Link>
                          <p className="text-[#64748B] text-sm leading-relaxed mb-5 line-clamp-2">{post.excerpt}</p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                          <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                            {post.author_name || "Prolx Staff"}
                          </span>
                          <Link
                            href={`/blog/${post.slug}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D9488] group-hover:gap-2.5 transition-all duration-200"
                          >
                            Read More <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
