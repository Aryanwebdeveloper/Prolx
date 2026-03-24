"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

const categories = ["All", "Web Development", "Mobile Apps", "UI/UX Design", "Digital Marketing"];

const projects = [
  {
    title: "FinEdge Banking App",
    client: "FinEdge Technologies",
    category: "Mobile Apps",
    tags: ["React Native", "Node.js", "PostgreSQL"],
    img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
    desc: "A comprehensive mobile banking platform with real-time transactions, biometric auth, and investment tracking.",
    slug: "finedge-banking-app",
  },
  {
    title: "Bloom E-commerce Store",
    client: "Bloom Retail",
    category: "Web Development",
    tags: ["Next.js", "Shopify", "Stripe"],
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    desc: "High-converting fashion e-commerce platform with 3x faster checkout and 240% traffic growth.",
    slug: "bloom-ecommerce",
  },
  {
    title: "MedCare Patient Portal",
    client: "MedCare Solutions",
    category: "Web Development",
    tags: ["React", "Supabase", "TypeScript"],
    img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
    desc: "Secure patient portal with appointment scheduling, medical records, and telemedicine integration.",
    slug: "medcare-patient-portal",
  },
  {
    title: "TechHub SaaS Dashboard",
    client: "TechHub Inc.",
    category: "Web Development",
    tags: ["Next.js", "Prisma", "AWS"],
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    desc: "Enterprise SaaS analytics dashboard with real-time metrics, team collaboration, and custom reporting.",
    slug: "techhub-saas-dashboard",
  },
  {
    title: "EduLearn Mobile Platform",
    client: "EduLearn Academy",
    category: "Mobile Apps",
    tags: ["Flutter", "Firebase", "Dart"],
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    desc: "Gamified learning platform for K-12 students with offline mode and parent progress tracking.",
    slug: "edulearn-mobile-platform",
  },
  {
    title: "LuxHomes Brand Identity",
    client: "LuxHomes Real Estate",
    category: "UI/UX Design",
    tags: ["Figma", "Brand Design", "Motion"],
    img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    desc: "Complete brand identity system with logo, design system, and marketing collateral for luxury real estate.",
    slug: "luxhomes-brand-identity",
  },
  {
    title: "FoodHub Delivery App",
    client: "FoodHub",
    category: "Mobile Apps",
    tags: ["React Native", "Google Maps", "Stripe"],
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    desc: "On-demand food delivery app with real-time order tracking and multi-restaurant marketplace.",
    slug: "foodhub-delivery-app",
  },
  {
    title: "GreenEnergy Marketing Campaign",
    client: "GreenEnergy Co.",
    category: "Digital Marketing",
    tags: ["Google Ads", "Meta", "SEO"],
    img: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=80",
    desc: "360° digital marketing campaign achieving 180% ROI increase and 50K+ qualified leads.",
    slug: "greenenergy-marketing",
  },
];

export default function PortfolioPage() {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-[#F0FDFA]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
            <Link href="/" className="hover:text-[#0D9488]">Home</Link>
            <ChevronRight size={14} />
            <span className="text-[#0D9488]">Portfolio</span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Our{" "}
            <em
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
            >
              Work
            </em>
          </h1>
          <p className="text-[#64748B] text-lg max-w-2xl">
            Real projects. Real results. Explore how we&apos;ve helped clients across industries 
            achieve their digital goals.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 border-b border-[#E2E8F0]">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  active === cat
                    ? "bg-[#0D9488] text-white shadow-md"
                    : "bg-[#F0FDFA] text-[#64748B] hover:bg-[#CCFBF1] hover:text-[#0D9488]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(({ title, client, category, tags, img, desc, slug }) => (
              <div
                key={title}
                className="group bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative overflow-hidden aspect-[4/3]">
                  <Image
                    src={img}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                    <Link
                      href={`/portfolio/${slug}`}
                      className="inline-flex items-center gap-1.5 text-[#F97316] font-semibold text-sm hover:underline"
                    >
                      View Case Study →
                    </Link>
                  </div>
                </div>

                <div className="p-5">
                  <span className="text-xs font-mono text-[#0D9488] bg-[#F0FDFA] px-2 py-0.5 rounded mb-2 inline-block">
                    {category}
                  </span>
                  <h3
                    className="text-lg font-bold text-[#0F172A] mb-1"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    {title}
                  </h3>
                  <p className="text-xs text-[#64748B] mb-3">{client}</p>
                  <p className="text-sm text-[#64748B] mb-4 leading-relaxed">{desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-mono bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] px-2 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-[#64748B]">
              No projects found in this category.
            </div>
          )}
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
