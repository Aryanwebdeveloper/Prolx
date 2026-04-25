"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Search } from "lucide-react";

const faqCategories = [
  {
    category: "General",
    faqs: [
      { q: "What services does Prolx offer?", a: "Prolx offers a comprehensive range of digital services including website development, custom web applications, mobile app development, UI/UX design, graphic design, branding, e-commerce development, SaaS development, SEO optimization, digital marketing, cloud solutions, and website maintenance." },
      { q: "Where is Prolx based?", a: "Prolx is headquartered in Karachi, Pakistan, but we serve clients globally — including the US, UK, UAE, Saudi Arabia, and beyond. We operate fully remote with timezone flexibility." },
      { q: "How do I start a project with Prolx?", a: "Simply fill out our contact form or book a free 30-minute consultation call. We'll discuss your goals, recommend the right approach, and provide a detailed proposal within 48 hours." },
    ],
  },
  {
    category: "Pricing & Payments",
    faqs: [
      { q: "How much does a website cost?", a: "Our website packages start at $499 for a Starter Website, $1,299 for a Business Website, and $2,499 for E-commerce. Custom enterprise projects are quoted individually based on scope." },
      { q: "Do you offer payment plans?", a: "Yes! We offer 50% upfront / 50% on delivery for standard projects. For larger projects, we also offer milestone-based payments (30% / 40% / 30%). Custom payment terms are available for Enterprise clients." },
      { q: "Do you offer refunds?", a: "We offer a revision policy rather than refunds. Before starting, we provide a detailed scope document. If we fail to deliver what was agreed, we'll make it right. See our Terms of Service for full details." },
    ],
  },
  {
    category: "Development Process",
    faqs: [
      { q: "What is your typical project timeline?", a: "Timelines depend on complexity: Landing pages (1–2 weeks), Business websites (3–4 weeks), E-commerce stores (4–8 weeks), Custom apps (8–20 weeks). We provide exact timelines in our project proposals." },
      { q: "Do you follow an agile process?", a: "Yes! We use a sprint-based agile approach with weekly check-ins, regular demos, and transparent progress tracking via Notion or Trello. You're involved at every key milestone." },
      { q: "Will I own the code and designs after completion?", a: "Absolutely. Upon final payment, you receive full ownership of all code, design files, assets, and documentation. We also provide a handover session and documentation." },
    ],
  },
  {
    category: "Technical",
    faqs: [
      { q: "What technologies do you use?", a: "We work with modern, battle-tested technologies: React, Next.js, TypeScript, Node.js, Python, Flutter, React Native, PostgreSQL, Supabase, AWS, and more. We recommend the best tech stack for your specific project." },
      { q: "Can you work with our existing codebase?", a: "Yes. We regularly take over existing projects, perform code audits, refactor legacy code, and add new features. We'll do a free technical assessment before committing to a maintenance or enhancement project." },
      { q: "Do you provide hosting?", a: "We don't sell hosting directly, but we set up and configure hosting on your preferred provider (Vercel, AWS, Cloudflare, DigitalOcean, etc.) and recommend the optimal setup for your project's needs." },
    ],
  },
];

export function FAQsClient() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const filtered = faqCategories.map((cat) => ({
    ...cat,
    faqs: cat.faqs.filter(
      (f) =>
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.faqs.length > 0);

  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      <section className="pt-28 pb-16 bg-[#F0FDFA]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
            <Link href="/" className="hover:text-[#0D9488]">Home</Link>
            <ChevronRight size={14} />
            <span className="text-[#0D9488]">FAQs</span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Frequently Asked{" "}
            <em style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}>
              Questions
            </em>
          </h1>
          <p className="text-[#64748B] text-lg max-w-xl mb-8">
            Find answers to the most common questions about working with Prolx.
          </p>
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search questions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-sm focus:outline-none focus:border-[#0D9488]"
            />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-[#64748B]">
              No matching questions found. Try a different search.
            </div>
          ) : (
            <div className="space-y-10">
              {filtered.map(({ category, faqs }) => (
                <div key={category}>
                  <h2
                    className="text-2xl font-bold text-[#0F172A] mb-5 pb-3 border-b border-[#E2E8F0]"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    {category}
                  </h2>
                  <div className="space-y-3">
                    {faqs.map(({ q, a }) => {
                      const key = `${category}-${q}`;
                      return (
                        <div key={key} className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                          <button
                            onClick={() => setOpenFaq(openFaq === key ? null : key)}
                            className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F0FDFA] transition-colors"
                          >
                            <span className="font-semibold text-[#0F172A] text-sm pr-4">{q}</span>
                            <ChevronRight
                              size={18}
                              className={`text-[#0D9488] shrink-0 transition-transform ${openFaq === key ? "rotate-90" : ""}`}
                            />
                          </button>
                          {openFaq === key && (
                            <div className="px-5 pb-5 text-sm text-[#64748B] leading-relaxed border-t border-[#E2E8F0] pt-4">
                              {a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 bg-[#F0FDFA] rounded-2xl p-8 text-center border border-[#CCFBF1]">
            <h3
              className="text-2xl font-bold text-[#0F172A] mb-2"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Still have questions?
            </h3>
            <p className="text-[#64748B] text-sm mb-5">
              Our team is happy to help. Reach out and we&apos;ll get back to you within 24 hours.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#0D9488] text-white font-semibold rounded-xl hover:bg-[#0F766E] transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
