"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import { useParams } from "next/navigation";

const caseStudies = [
  {
    slug: "finedge-banking-app",
    title: "FinEdge Banking App",
    client: "FinEdge Technologies",
    industry: "Fintech",
    heroImg: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80",
    background:
      "FinEdge Technologies is a fast-growing fintech startup aiming to modernize personal banking for the South Asian market. With legacy systems slowing them down and customer churn rising, they needed a complete digital transformation — starting with a modern mobile banking platform.",
    challenges: [
      "Legacy banking infrastructure with 10+ year old codebase",
      "Customer churn rate of 35% due to poor mobile experience",
      "Regulatory compliance requirements across multiple jurisdictions",
      "Real-time transaction processing with zero downtime tolerance",
      "Biometric authentication integration for enhanced security",
    ],
    strategy:
      "We conducted a comprehensive 2-week discovery phase including stakeholder interviews, competitor analysis, and user research with 200+ existing customers. Our strategy centered on building a modular, microservices architecture that could integrate with existing backend systems while providing a dramatically improved frontend experience.",
    designProcess:
      "Our UX team created detailed user journey maps for 12 critical banking flows including account opening, fund transfers, bill payments, and investment tracking. We designed a clean, trust-inducing interface with the bank's brand colors, focusing on accessibility and ease of use for a broad demographic range. The design system included 80+ components with light and dark mode variants.",
    development:
      "Built using React Native for cross-platform mobile delivery with a Node.js/PostgreSQL backend. We implemented real-time WebSocket connections for live transaction updates, integrated biometric authentication (Face ID / fingerprint), and built a custom notification system. The architecture supports 50,000+ concurrent users with sub-200ms response times.",
    techs: ["React Native", "Node.js", "PostgreSQL", "Redis", "AWS", "Docker", "Stripe"],
    metrics: [
      { label: "User Growth", value: "+300%", desc: "in 6 months" },
      { label: "App Rating", value: "4.8★", desc: "on App Store" },
      { label: "Load Time", value: "1.2s", desc: "average" },
      { label: "Churn Rate", value: "-60%", desc: "reduction" },
    ],
    screenshots: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&q=80",
    ],
  },
  {
    slug: "bloom-ecommerce",
    title: "Bloom E-commerce Store",
    client: "Bloom Retail",
    industry: "E-commerce",
    heroImg: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
    background:
      "Bloom Retail is a fast-fashion brand targeting young professionals across the Middle East. Their existing Magento store was slow, difficult to manage, and underperforming in search results. They needed a modern, conversion-optimized e-commerce platform that could handle flash sales and rapid inventory changes.",
    challenges: [
      "Magento store with 8+ second load times killing conversions",
      "No mobile optimization — 70% of traffic was mobile",
      "Complex inventory management across 3 warehouses",
      "Poor SEO — organic traffic was declining 15% quarterly",
      "No email marketing or customer retention strategy",
    ],
    strategy:
      "We proposed a complete platform migration from Magento to a headless commerce architecture using Next.js for the frontend and Shopify Plus for inventory and order management. This allowed us to build a blazing-fast, SEO-optimized storefront while retaining powerful backend capabilities.",
    designProcess:
      "We analyzed heatmaps and session recordings from 10,000+ user sessions to identify UX bottlenecks. The redesign focused on reducing checkout friction from 7 steps to 3, implementing quick-view product cards, and creating a visually stunning lookbook-style category browsing experience.",
    development:
      "The frontend was built with Next.js using ISR for product pages, achieving sub-1-second page loads. We implemented Algolia-powered instant search, Stripe payment processing with local payment methods, and a custom recommendation engine. The checkout flow was optimized with address autocomplete and one-tap payments.",
    techs: ["Next.js", "Shopify Plus", "Stripe", "Algolia", "Cloudflare", "Klaviyo"],
    metrics: [
      { label: "Traffic Growth", value: "+240%", desc: "organic traffic" },
      { label: "Page Speed", value: "98", desc: "PageSpeed score" },
      { label: "Conversion Rate", value: "+180%", desc: "improvement" },
      { label: "Revenue Growth", value: "2x", desc: "in 3 months" },
    ],
    screenshots: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80",
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80",
    ],
  },
  {
    slug: "medcare-patient-portal",
    title: "MedCare Patient Portal",
    client: "MedCare Solutions",
    industry: "Healthcare",
    heroImg: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
    background:
      "MedCare Solutions operates a network of 25 clinics across Pakistan. They needed a unified patient portal that would allow patients to book appointments, access medical records, and communicate with doctors — all while maintaining HIPAA-equivalent data security.",
    challenges: [
      "No digital patient management — everything was paper-based",
      "Patient no-show rate of 30% costing millions annually",
      "Doctors overwhelmed by administrative tasks",
      "No secure communication channel between patients and providers",
      "Integration needed with 3 different EMR systems",
    ],
    strategy:
      "We designed a phased rollout strategy — starting with appointment scheduling, then adding medical records access, telemedicine, and finally a patient health tracking module. This allowed the clinics to adopt the system gradually without disrupting operations.",
    designProcess:
      "Accessibility was our north star. We designed for patients aged 18–80 with varying levels of tech literacy. Large touch targets, high-contrast text, multi-language support (English, Urdu), and a simplified navigation structure ensured universal usability. Extensive user testing with actual patients refined the experience.",
    development:
      "Built with React and Supabase for real-time data synchronization. We implemented end-to-end encryption for medical records, video conferencing via WebRTC for telemedicine consultations, and a custom notification system for appointment reminders. The portal integrates with three different EMR systems via HL7 FHIR APIs.",
    techs: ["React", "Supabase", "TypeScript", "WebRTC", "HL7 FHIR", "AWS"],
    metrics: [
      { label: "No-Show Rate", value: "-65%", desc: "reduction" },
      { label: "Patient Satisfaction", value: "96%", desc: "approval" },
      { label: "Admin Time Saved", value: "40hrs", desc: "per week" },
      { label: "Active Users", value: "15K+", desc: "patients" },
    ],
    screenshots: [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
      "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&q=80",
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80",
    ],
  },
];

export default function CaseStudyPage() {
  const params = useParams();
  const slug = params.slug as string;
  const study = caseStudies.find((s) => s.slug === slug);
  const currentIndex = caseStudies.findIndex((s) => s.slug === slug);

  if (!study) {
    return (
      <div className="min-h-screen bg-white">
        <ProlxNavbar />
        <div className="pt-28 pb-20 text-center container mx-auto px-4">
          <h1
            className="text-4xl font-bold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Case Study Not Found
          </h1>
          <p className="text-[#64748B] mb-6">
            The case study you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0D9488] text-white rounded-lg font-semibold hover:bg-[#0F766E] transition-colors"
          >
            Back to Portfolio
          </Link>
        </div>
        <ProlxFooter />
      </div>
    );
  }

  const prev = currentIndex > 0 ? caseStudies[currentIndex - 1] : null;
  const next = currentIndex < caseStudies.length - 1 ? caseStudies[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      {/* Hero */}
      <section className="relative pt-20">
        <div className="relative h-[50vh] md:h-[60vh]">
          <Image
            src={study.heroImg}
            alt={study.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="container mx-auto">
              <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
                <ChevronRight size={14} />
                <Link href="/portfolio" className="hover:text-white">
                  Portfolio
                </Link>
                <ChevronRight size={14} />
                <span className="text-white">{study.title}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-xs font-mono bg-[#0D9488] text-white px-3 py-1 rounded-full">
                  {study.industry}
                </span>
                <span className="text-white/60 text-sm">{study.client}</span>
              </div>
              <h1
                className="text-4xl md:text-6xl font-extrabold text-white"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                {study.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Background */}
        <section className="mb-16">
          <h2
            className="text-3xl font-bold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Project{" "}
            <em
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: "italic",
                color: "#0D9488",
              }}
            >
              Background
            </em>
          </h2>
          <p className="text-[#64748B] leading-relaxed text-lg">
            {study.background}
          </p>
        </section>

        {/* Challenges */}
        <section className="mb-16">
          <h2
            className="text-3xl font-bold text-[#0F172A] mb-6"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Client Challenges
          </h2>
          <div className="space-y-3">
            {study.challenges.map((c, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 bg-red-50/50 rounded-xl border border-red-100"
              >
                <span className="w-2 h-2 rounded-full bg-[#EF4444] mt-2 shrink-0" />
                <p className="text-[#64748B]">{c}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Strategy */}
        <section className="mb-16">
          <h2
            className="text-3xl font-bold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Research &{" "}
            <em
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: "italic",
                color: "#0D9488",
              }}
            >
              Strategy
            </em>
          </h2>
          <p className="text-[#64748B] leading-relaxed text-lg">
            {study.strategy}
          </p>
        </section>

        {/* Design Process */}
        <section className="mb-16">
          <h2
            className="text-3xl font-bold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Design Process
          </h2>
          <p className="text-[#64748B] leading-relaxed text-lg">
            {study.designProcess}
          </p>
        </section>

        {/* Development */}
        <section className="mb-16">
          <h2
            className="text-3xl font-bold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Development Approach
          </h2>
          <p className="text-[#64748B] leading-relaxed text-lg mb-6">
            {study.development}
          </p>
          <div className="flex flex-wrap gap-2">
            {study.techs.map((t) => (
              <span
                key={t}
                className="text-sm font-mono bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] px-4 py-2 rounded-xl"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Metrics */}
        <section className="mb-16">
          <h2
            className="text-3xl font-bold text-[#0F172A] mb-8"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Results &{" "}
            <em
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: "italic",
                color: "#0D9488",
              }}
            >
              Metrics
            </em>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {study.metrics.map((m) => (
              <div
                key={m.label}
                className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-2xl p-6 text-center"
              >
                <div
                  className="text-3xl md:text-4xl font-bold text-[#0D9488] mb-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {m.value}
                </div>
                <div className="text-sm font-semibold text-[#0F172A]">
                  {m.label}
                </div>
                <div className="text-xs text-[#64748B]">{m.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Screenshots */}
        <section className="mb-16">
          <h2
            className="text-3xl font-bold text-[#0F172A] mb-8"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Visual Screenshots
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {study.screenshots.map((src, i) => (
              <div
                key={i}
                className="relative h-52 rounded-2xl overflow-hidden border border-[#E2E8F0]"
              >
                <Image
                  src={src}
                  alt={`${study.title} screenshot ${i + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-[#E2E8F0]">
          {prev ? (
            <Link
              href={`/portfolio/${prev.slug}`}
              className="flex items-center gap-2 text-[#64748B] hover:text-[#0D9488] transition-colors group"
            >
              <ChevronLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <div>
                <div className="text-xs text-[#94A3B8]">Previous</div>
                <div className="font-semibold text-sm text-[#0F172A] group-hover:text-[#0D9488]">
                  {prev.title}
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/portfolio/${next.slug}`}
              className="flex items-center gap-2 text-[#64748B] hover:text-[#0D9488] transition-colors group text-right"
            >
              <div>
                <div className="text-xs text-[#94A3B8]">Next</div>
                <div className="font-semibold text-sm text-[#0F172A] group-hover:text-[#0D9488]">
                  {next.title}
                </div>
              </div>
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* CTA */}
      <section className="py-16 bg-[#0D9488]">
        <div className="container mx-auto px-4 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Want Similar Results?
          </h2>
          <p className="text-teal-100 mb-8 max-w-xl mx-auto">
            Let&apos;s discuss how we can help your business achieve transformative digital growth.
          </p>
          <Link
            href="/contact"
            className="inline-flex px-8 py-4 bg-[#F97316] text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
          >
            Start Your Project
          </Link>
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
