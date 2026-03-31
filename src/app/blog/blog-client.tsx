"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronRight, Search, Clock } from "lucide-react";

export default function BlogClient({ posts, categories }: { posts: any[]; categories: string[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  if (!posts || posts.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <ProlxNavbar />
        <section className="pt-28 pb-16 bg-[#F0FDFA]">
          <div className="container mx-auto px-4 text-center py-20">
            <h1 className="text-4xl font-bold text-[#0F172A] mb-4">No Posts Found</h1>
            <p className="text-[#64748B]">There are currently no published blog posts.</p>
          </div>
        </section>
        <ProlxFooter />
      </div>
    );
  }

  const featured = posts.find(p => p.featured) || posts[0];
  const restPosts = posts.filter(p => p.id !== featured.id);

  const filtered = restPosts.filter(
    (p) =>
      (activeCategory === "All" || p.category === activeCategory) &&
      (p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-[#F0FDFA]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
            <Link href="/" className="hover:text-[#0D9488]">Home</Link>
            <ChevronRight size={14} />
            <span className="text-[#0D9488]">Blog</span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Insights &{" "}
            <em style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}>
              Resources
            </em>
          </h1>
          <p className="text-[#64748B] text-lg max-w-xl">
            Practical guides, deep dives, and industry insights from the Prolx team.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {featured && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 bg-[#F0FDFA] rounded-3xl overflow-hidden border border-[#CCFBF1]">
              <div className="relative h-72 lg:h-auto">
                <Image src={featured.featured_image_url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80"} alt={featured.title} fill className="object-cover" />
              </div>
              <div className="p-8 lg:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                   {featured.category && (
                     <span className="text-xs font-mono bg-[#CCFBF1] text-[#0D9488] px-3 py-1 rounded-full">
                       {featured.category}
                     </span>
                   )}
                  <span className="text-xs text-[#64748B] bg-[#F97316]/10 text-[#F97316] px-2 py-0.5 rounded-full font-semibold">
                    Featured
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-[#0F172A] mb-3" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  {featured.title}
                </h2>
                <p className="text-[#64748B] text-sm leading-relaxed mb-5">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-[#64748B] mb-6">
                  {featured.author_name && <span>{featured.author_name}</span>}
                  {featured.author_name && <span>•</span>}
                  <span>{new Date(featured.created_at).toLocaleDateString()}</span>
                  {featured.read_time && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock size={12} />{featured.read_time}</span>
                    </>
                  )}
                </div>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0D9488] text-white font-semibold rounded-xl hover:bg-[#0F766E] transition-all text-sm w-fit"
                >
                  Read Article
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters + Search */}
      <section className="py-6 border-b border-[#E2E8F0]">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-[#0D9488] text-white"
                    : "bg-[#F0FDFA] text-[#64748B] hover:bg-[#CCFBF1] hover:text-[#0D9488]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
            />
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={post.featured_image_url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col h-[220px]">
                  {post.category && (
                    <span className="text-xs font-mono bg-[#F0FDFA] text-[#0D9488] px-2.5 py-0.5 rounded-full w-fit">
                      {post.category}
                    </span>
                  )}
                  <Link href={`/blog/${post.slug}`} className="block mt-2 flex-grow">
                    <h3 className="text-lg font-bold text-[#0F172A] mb-2 line-clamp-2 group-hover:text-[#0D9488] transition-colors" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      {post.title}
                    </h3>
                    <p className="text-[#64748B] text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                  </Link>
                  <div className="flex items-center justify-between text-xs text-[#64748B] mt-auto pt-4 border-t border-[#E2E8F0] border-dashed">
                    <span>{post.author_name} · {new Date(post.created_at).toLocaleDateString()}</span>
                    {post.read_time && <span className="flex items-center gap-1"><Clock size={11} />{post.read_time}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-[#64748B]">
              No articles found. Try a different search term.
            </div>
          )}
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
