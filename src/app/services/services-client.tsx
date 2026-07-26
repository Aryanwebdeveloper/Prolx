"use client";

import Link from "next/link";
import {
  ArrowRight, Zap, Globe, Code2, Smartphone, Palette, PenTool, Layers,
  ShoppingBag, Box, BarChart2, Cloud, Settings, Monitor, Briefcase,
  Store, CheckCircle2, MessageCircle, Phone
} from "lucide-react";
import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/scroll-reveal";
import PageHero from "@/components/page-hero";

const services = [
  {
    icon: Globe,
    title: "Website Development",
    desc: "Blazing-fast, SEO-ready websites that convert visitors into customers. Next.js, React, performance-first.",
    color: "from-teal-500 to-cyan-500",
    bg: "bg-teal-50",
    border: "border-teal-100",
    badge: "Most Popular",
  },
  {
    icon: Code2,
    title: "Custom Web Apps",
    desc: "Scalable web applications tailored to your exact business needs — from internal tools to complex SaaS platforms.",
    color: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    desc: "iOS & Android apps with React Native and Flutter — polished, performant, and native-quality.",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    desc: "User-research-backed interfaces that feel intuitive, look stunning, and drive conversions.",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
    border: "border-pink-100",
  },
  {
    icon: PenTool,
    title: "Graphic Design",
    desc: "Social media assets, marketing materials, and print-ready files — consistently on-brand.",
    color: "from-orange-400 to-amber-500",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  {
    icon: Layers,
    title: "Branding",
    desc: "Full brand identity systems — logo, color palette, typography, guidelines — premium and memorable.",
    color: "from-fuchsia-500 to-pink-500",
    bg: "bg-fuchsia-50",
    border: "border-fuchsia-100",
  },
  {
    icon: ShoppingBag,
    title: "E-commerce Development",
    desc: "High-converting online stores on Shopify, WooCommerce or custom platforms with optimized checkout.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    icon: Box,
    title: "SaaS Development",
    desc: "From MVP to enterprise — auth, billing, multi-tenancy, analytics, and scalable infrastructure.",
    color: "from-cyan-500 to-blue-500",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
  },
  {
    icon: BarChart2,
    title: "SEO & Digital Marketing",
    desc: "Rank higher, get found, and grow organically. Technical SEO, content strategy, and paid campaigns.",
    color: "from-lime-500 to-green-500",
    bg: "bg-lime-50",
    border: "border-lime-100",
  },
  {
    icon: Cloud,
    title: "Cloud & Infrastructure",
    desc: "AWS, Vercel, Cloudflare — we architect, deploy, and manage reliable cloud infrastructure for your product.",
    color: "from-sky-500 to-blue-600",
    bg: "bg-sky-50",
    border: "border-sky-100",
  },
  {
    icon: Monitor,
    title: "WordPress Development",
    desc: "Custom themes, plugins, and high-performance WordPress sites — fast, secure, and easy to manage.",
    color: "from-blue-600 to-indigo-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: Store,
    title: "Shopify Development",
    desc: "Pixel-perfect Shopify stores with custom apps, theme customization, and conversion optimization.",
    color: "from-green-500 to-emerald-600",
    bg: "bg-green-50",
    border: "border-green-100",
  },
  {
    icon: Settings,
    title: "Website Maintenance",
    desc: "Monthly maintenance plans — updates, security patches, performance monitoring, and priority support.",
    color: "from-slate-500 to-gray-600",
    bg: "bg-slate-50",
    border: "border-slate-100",
  },
  {
    icon: Briefcase,
    title: "Business Software",
    desc: "Custom POS, CRM, ERP, and management systems tailored to how your business actually operates.",
    color: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
];

const whyUs = [
  { label: "Free initial consultation", desc: "We discuss your project scope before any commitment." },
  { label: "Fixed-price quotes", desc: "No surprise invoices. You know the cost upfront." },
  { label: "2–4 week delivery", desc: "Fast turnaround without sacrificing quality." },
  { label: "Post-launch support", desc: "We stay with you after handover for ongoing improvements." },
  { label: "100% ownership", desc: "All code and assets belong to you, forever." },
  { label: "Global team, local care", desc: "Worldwide reach with dedicated account management." },
];

export default function ServicesClient() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ProlxNavbar />

      {/* ── Hero ── */}
      <PageHero
        breadcrumb="Services"
        badge="What We Offer"
        badgeIcon={<Zap size={13} />}
        title={
          <>
            Expert Services,{" "}
            <span className="bg-gradient-to-r from-[#0D9488] to-[#0891B2] bg-clip-text text-transparent">
              Real Results
            </span>
          </>
        }
        subtitle="From idea to launch and beyond — we deliver digital products that grow your business. Browse our full range of services below."
      />

      {/* ── Services Grid ── */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" stagger={0.07}>
            {services.map(({ icon: Icon, title, desc, color, bg, border, badge }) => (
              <StaggerItem key={title}>
                <div className={`relative group h-full bg-white rounded-2xl border ${border} p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col`}>
                  {badge && (
                    <span className="absolute -top-3 right-4 bg-gradient-to-r from-[#F97316] to-[#EF4444] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
                      ⭐ {badge}
                    </span>
                  )}
                  {/* Icon */}
                  <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                    <div className={`bg-gradient-to-br ${color} rounded-lg w-10 h-10 flex items-center justify-center shadow-sm`}>
                      <Icon size={18} className="text-white" />
                    </div>
                  </div>

                  <h3
                    className="text-[#0F172A] font-bold text-base mb-2 leading-snug"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    {title}
                  </h3>
                  <p className="text-[#64748B] text-sm leading-relaxed flex-1">{desc}</p>

                  {/* CTA */}
                  <Link
                    href={`/contact?service=${encodeURIComponent(title)}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-[#0D9488] text-sm font-semibold hover:gap-3 transition-all duration-200 group-hover:text-[#0891B2]"
                  >
                    Get a Quote <ArrowRight size={14} />
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Why Choose Prolx ── */}
      <section className="py-20 bg-white border-y border-[#E2E8F0]">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-2 rounded-full mb-4">
                <CheckCircle2 size={14} />
                Why Prolx
              </div>
              <h2
                className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-4"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                The Prolx{" "}
                <span className="bg-gradient-to-r from-[#0D9488] to-[#0891B2] bg-clip-text text-transparent">
                  Difference
                </span>
              </h2>
              <p className="text-[#64748B] text-lg max-w-xl mx-auto">
                We don't just build — we partner. Here's what you can always expect when working with us.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.08}>
            {whyUs.map(({ label, desc }) => (
              <StaggerItem key={label}>
                <div className="flex items-start gap-4 p-5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] hover:border-[#CCFBF1] hover:bg-[#F0FDFA] transition-all duration-300">
                  <div className="w-9 h-9 rounded-xl bg-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[#0F172A] text-sm mb-1">{label}</p>
                    <p className="text-[#64748B] text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Get a Quote CTA Banner ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="scale">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0D9488] via-[#0891B2] to-[#6366F1] p-[2px] shadow-2xl shadow-teal-500/20">
              <div className="bg-white rounded-[22px] p-10 md:p-16 text-center relative overflow-hidden">
                {/* Soft orbs */}
                <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-teal-50 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-indigo-50 blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-2 rounded-full mb-6">
                    <MessageCircle size={14} />
                    Free Consultation — No Commitment
                  </div>

                  <h2
                    className="text-4xl md:text-6xl font-extrabold text-[#0F172A] mb-5 max-w-3xl mx-auto leading-[1.05]"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Ready to Start Your{" "}
                    <span className="bg-gradient-to-r from-[#0D9488] to-[#0891B2] bg-clip-text text-transparent">
                      Project?
                    </span>
                  </h2>

                  <p className="text-[#64748B] text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                    Tell us about your idea and get a detailed quote within 24 hours. No pressure — just an honest conversation about your goals.
                  </p>

                  <div className="flex flex-wrap gap-4 justify-center">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2.5 px-9 py-4 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-base shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <MessageCircle size={18} />
                      Get a Free Quote
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      href="/book-consultation"
                      className="inline-flex items-center gap-2.5 px-9 py-4 bg-white border-2 border-[#E2E8F0] text-[#0F172A] font-bold rounded-xl text-base hover:border-[#0D9488] hover:text-[#0D9488] transition-all duration-200 shadow-sm"
                    >
                      <Phone size={18} />
                      Book a Call
                    </Link>
                  </div>

                  <p className="mt-6 text-[#94A3B8] text-xs">
                    ✓ Response within 24 hours &nbsp;·&nbsp; ✓ No credit card required &nbsp;·&nbsp; ✓ Free consultation
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
