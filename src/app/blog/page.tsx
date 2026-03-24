"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronRight, Search, Clock } from "lucide-react";

const categories = ["All", "Web Dev", "Design", "Marketing", "Case Studies", "Tutorials"];

const posts = [
  {
    id: 1,
    category: "Web Dev",
    title: "Next.js 15 Performance Optimization: A Complete Guide",
    excerpt: "Learn how to squeeze every millisecond of performance out of your Next.js applications with server components, caching strategies, and Core Web Vitals optimization.",
    author: "Ahmed Raza",
    date: "Dec 15, 2024",
    readTime: "8 min read",
    img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
    featured: true,
  },
  {
    id: 2,
    category: "Design",
    title: "The Ultimate Guide to Design Systems in 2024",
    excerpt: "How to build and maintain a scalable design system that keeps your product visually consistent across every touchpoint.",
    author: "Fatima Shah",
    date: "Dec 10, 2024",
    readTime: "6 min read",
    img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
    featured: false,
  },
  {
    id: 3,
    category: "Marketing",
    title: "SEO in 2025: What's Changed and How to Adapt",
    excerpt: "Google's AI Overviews, zero-click searches, and the rise of GEO — here's your complete guide to organic growth in the AI era.",
    author: "Omar Siddiqui",
    date: "Dec 5, 2024",
    readTime: "10 min read",
    img: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=600&q=80",
    featured: false,
  },
  {
    id: 4,
    category: "Case Studies",
    title: "How We Grew FinEdge's User Base by 300% in 6 Months",
    excerpt: "A deep dive into the growth strategy, UX improvements, and performance optimizations that 3x'd user acquisition for a fintech startup.",
    author: "Prolx Team",
    date: "Nov 28, 2024",
    readTime: "12 min read",
    img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80",
    featured: false,
  },
  {
    id: 5,
    category: "Tutorials",
    title: "Build a Real-Time Dashboard with Next.js and Supabase",
    excerpt: "Step-by-step tutorial to create a live analytics dashboard with WebSocket subscriptions, real-time charts, and role-based access.",
    author: "Hassan Ali",
    date: "Nov 20, 2024",
    readTime: "15 min read",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
    featured: false,
  },
  {
    id: 6,
    category: "Design",
    title: "Micro-interactions That Delight: 15 Patterns to Steal",
    excerpt: "The best UX is invisible. These 15 micro-interaction patterns make your product feel premium without users even realizing why.",
    author: "Fatima Shah",
    date: "Nov 12, 2024",
    readTime: "5 min read",
    img: "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=600&q=80",
    featured: false,
  },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const featured = posts[0];
  const filtered = posts.slice(1).filter(
    (p) =>
      (activeCategory === "All" || p.category === activeCategory) &&
      (p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase()))
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
            <em
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
            >
              Resources
            </em>
          </h1>
          <p className="text-[#64748B] text-lg max-w-xl">
            Practical guides, deep dives, and industry insights from the Prolx team.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 bg-[#F0FDFA] rounded-3xl overflow-hidden border border-[#CCFBF1]">
            <div className="relative h-72 lg:h-auto">
              <Image src={featured.img} alt={featured.title} fill className="object-cover" />
            </div>
            <div className="p-8 lg:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono bg-[#CCFBF1] text-[#0D9488] px-3 py-1 rounded-full">
                  {featured.category}
                </span>
                <span className="text-xs text-[#64748B] bg-[#F97316]/10 text-[#F97316] px-2 py-0.5 rounded-full font-semibold">
                  Featured
                </span>
              </div>
              <h2
                className="text-3xl font-bold text-[#0F172A] mb-3"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                {featured.title}
              </h2>
              <p className="text-[#64748B] text-sm leading-relaxed mb-5">{featured.excerpt}</p>
              <div className="flex items-center gap-4 text-xs text-[#64748B] mb-6">
                <span>{featured.author}</span>
                <span>•</span>
                <span>{featured.date}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock size={12} />{featured.readTime}</span>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0D9488] text-white font-semibold rounded-xl hover:bg-[#0F766E] transition-all text-sm w-fit"
              >
                Read Article
              </Link>
            </div>
          </div>
        </div>
      </section>

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
            {filtered.map(({ id, category, title, excerpt, author, date, readTime, img }) => (
              <article
                key={id}
                className="group bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={img}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <span className="text-xs font-mono bg-[#F0FDFA] text-[#0D9488] px-2.5 py-0.5 rounded-full">
                    {category}
                  </span>
                  <h3
                    className="text-lg font-bold text-[#0F172A] mt-2 mb-2 line-clamp-2 group-hover:text-[#0D9488] transition-colors"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    {title}
                  </h3>
                  <p className="text-[#64748B] text-sm leading-relaxed mb-4 line-clamp-2">{excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>{author} · {date}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{readTime}</span>
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
