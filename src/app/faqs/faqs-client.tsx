"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, ChevronDown, Search, ArrowRight, HelpCircle } from "lucide-react";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/scroll-reveal";
import PageHero from "@/components/page-hero";

const faqCategories = [
  {
    category: "General",
    icon: "🌐",
    faqs: [
      { q: "What services does Prolx offer?", a: "Prolx offers a comprehensive range of digital services including website development, custom web applications, mobile app development, UI/UX design, graphic design, branding, e-commerce development, SaaS development, SEO optimization, digital marketing, cloud solutions, and website maintenance." },
      { q: "Where is Prolx based?", a: "Prolx is headquartered in Karachi, Pakistan, but we serve clients globally — including the US, UK, UAE, Saudi Arabia, and beyond. We operate fully remote with timezone flexibility." },
      { q: "How do I start a project with Prolx?", a: "Simply fill out our contact form or book a free 30-minute consultation call. We'll discuss your goals, recommend the right approach, and provide a detailed proposal within 48 hours." },
    ],
  },
  {
    category: "Pricing & Payments",
    icon: "💳",
    faqs: [
      { q: "How much does a website cost?", a: "Our website packages start at $499 for a Starter Website, $1,299 for a Business Website, and $2,499 for E-commerce. Custom enterprise projects are quoted individually based on scope." },
      { q: "Do you offer payment plans?", a: "Yes! We offer 50% upfront / 50% on delivery for standard projects. For larger projects, we also offer milestone-based payments (30% / 40% / 30%). Custom payment terms are available for Enterprise clients." },
      { q: "Do you offer refunds?", a: "We offer a revision policy rather than refunds. Before starting, we provide a detailed scope document. If we fail to deliver what was agreed, we'll make it right. See our Terms of Service for full details." },
    ],
  },
  {
    category: "Development Process",
    icon: "⚙️",
    faqs: [
      { q: "What is your typical project timeline?", a: "Timelines depend on complexity: Landing pages (1–2 weeks), Business websites (3–4 weeks), E-commerce stores (4–8 weeks), Custom apps (8–20 weeks). We provide exact timelines in our project proposals." },
      { q: "Do you follow an agile process?", a: "Yes! We use a sprint-based agile approach with weekly check-ins, regular demos, and transparent progress tracking via Notion or Trello. You're involved at every key milestone." },
      { q: "Will I own the code and designs after completion?", a: "Absolutely. Upon final payment, you receive full ownership of all code, design files, assets, and documentation. We also provide a handover session and documentation." },
    ],
  },
  {
    category: "Technical",
    icon: "🛠️",
    faqs: [
      { q: "What technologies do you use?", a: "We work with modern, battle-tested technologies: React, Next.js, TypeScript, Node.js, Python, Flutter, React Native, PostgreSQL, Supabase, AWS, and more. We recommend the best tech stack for your specific project." },
      { q: "Can you work with our existing codebase?", a: "Yes. We regularly take over existing projects, perform code audits, refactor legacy code, and add new features. We'll do a free technical assessment before committing to a maintenance or enhancement project." },
      { q: "Do you provide hosting?", a: "We don't sell hosting directly, but we set up and configure hosting on your preferred provider (Vercel, AWS, Cloudflare, DigitalOcean, etc.) and recommend the optimal setup for your project's needs." },
    ],
  },
];

const categoryColors: Record<string, string> = {
  "General":             "bg-teal-50 text-teal-600 border-teal-100",
  "Pricing & Payments":  "bg-violet-50 text-violet-600 border-violet-100",
  "Development Process": "bg-amber-50 text-amber-600 border-amber-100",
  "Technical":           "bg-blue-50 text-blue-600 border-blue-100",
};

export function FAQsClient() {
  const [search, setSearch]     = useState("");
  const [openFaq, setOpenFaq]   = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All");

  const allTabs = ["All", ...faqCategories.map((c) => c.category)];

  const filtered = faqCategories
    .filter((cat) => activeTab === "All" || cat.category === activeTab)
    .map((cat) => ({
      ...cat,
      faqs: cat.faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(search.toLowerCase()) ||
          f.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.faqs.length > 0);

  const totalFaqs = faqCategories.reduce((sum, c) => sum + c.faqs.length, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ProlxNavbar />

      <PageHero
        breadcrumb="FAQs"
        badge={`${totalFaqs} Questions Answered`}
        badgeIcon={<HelpCircle size={13} />}
        title={
          <>
            Frequently{" "}
            <span className="bg-gradient-to-r from-[#0D9488] to-[#0891B2] bg-clip-text text-transparent">
              Asked
            </span>{" "}
            Questions
          </>
        }
        subtitle="Find answers to the most common questions about working with Prolx."
      >
        {/* Search */}
        <div className="relative max-w-lg">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search questions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] pl-11 pr-4 py-3.5 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] transition-colors shadow-sm"
          />
        </div>
      </PageHero>

      {/* ── Category Tabs ────────────────────────────────────── */}
      <div className="py-4 bg-white border-b border-[#E2E8F0] sticky top-[64px] md:top-[80px] z-40 shadow-sm">
        <div className="container mx-auto px-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {allTabs.map((tab) => {
            const cat = faqCategories.find((c) => c.category === tab);
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? "bg-[#0D9488] text-white shadow"
                    : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:border-[#0D9488] hover:text-[#0D9488]"
                }`}
              >
                {cat?.icon && <span>{cat.icon}</span>}
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FAQ Accordion ────────────────────────────────────── */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {filtered.length === 0 ? (
            <ScrollReveal direction="scale">
              <div className="text-center py-20 bg-white border border-dashed border-[#E2E8F0] rounded-3xl">
                <p className="text-lg font-bold text-[#0F172A] mb-2">No matching questions.</p>
                <button
                  onClick={() => { setSearch(""); setActiveTab("All"); }}
                  className="text-sm text-[#0D9488] font-bold hover:underline"
                >
                  Clear search
                </button>
              </div>
            </ScrollReveal>
          ) : (
            <div className="space-y-12">
              {filtered.map(({ category, icon, faqs }) => {
                const colorClass = categoryColors[category] || categoryColors["General"];
                return (
                  <ScrollReveal key={category} direction="up">
                    <div>
                      {/* Category header */}
                      <div className="flex items-center gap-3 mb-6">
                        <span
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border font-mono uppercase tracking-wider ${colorClass}`}
                        >
                          {icon} {category}
                        </span>
                        <div className="h-px flex-1 bg-[#E2E8F0]" />
                      </div>

                      <StaggerContainer key={activeTab + search} stagger={0.06}>
                        {faqs.map(({ q, a }) => {
                          const key = `${category}-${q}`;
                          const isOpen = openFaq === key;
                          return (
                            <StaggerItem key={key} className="mb-3">
                              <div
                                className={`border rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-200 ${
                                  isOpen ? "border-[#0D9488]/40 shadow-teal-50 shadow-md" : "border-[#E2E8F0]"
                                }`}
                              >
                                <button
                                  onClick={() => setOpenFaq(isOpen ? null : key)}
                                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F8FFFE] transition-colors"
                                >
                                  <span className="font-semibold text-[#0F172A] text-sm pr-4 leading-relaxed">
                                    {q}
                                  </span>
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                                      isOpen
                                        ? "bg-[#0D9488] text-white"
                                        : "bg-[#F1F5F9] text-[#64748B]"
                                    }`}
                                  >
                                    <ChevronDown
                                      size={15}
                                      className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                                    />
                                  </div>
                                </button>
                                {isOpen && (
                                  <div className="px-5 pb-5 text-sm text-[#64748B] leading-relaxed border-t border-[#F1F5F9] pt-4">
                                    {a}
                                  </div>
                                )}
                              </div>
                            </StaggerItem>
                          );
                        })}
                      </StaggerContainer>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}

          {/* Still have questions */}
          <ScrollReveal direction="up" delay={0.1} className="mt-16">
            <div className="rounded-3xl bg-[#0A0F1E] text-white p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 dot-grid opacity-15 pointer-events-none" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#0D9488]/10 rounded-full blur-[60px] pointer-events-none" />
              <div className="relative z-10">
                <h3
                  className="text-3xl font-bold mb-3"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Still have questions?
                </h3>
                <p className="text-[#94A3B8] text-sm mb-7 max-w-md mx-auto">
                  Our team is happy to help. Reach out and we&apos;ll get back to you within 24 hours.
                </p>
                <Link
                  href="/contact"
                  className="glow-btn inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-sm"
                >
                  Contact Us
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
