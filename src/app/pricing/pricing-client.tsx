"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, ChevronDown, Check, Minus, ArrowRight, Zap } from "lucide-react";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/scroll-reveal";
import PageHero from "@/components/page-hero";

const comparisonFeatures = [
  { feature: "Mobile Responsive",  starter: true,       business: true,       ecommerce: true,       enterprise: true },
  { feature: "SEO Setup",          starter: "Basic",    business: "Advanced", ecommerce: "Advanced", enterprise: "Full" },
  { feature: "CMS / Blog",         starter: false,      business: true,       ecommerce: true,       enterprise: true },
  { feature: "E-commerce Store",   starter: false,      business: false,      ecommerce: true,       enterprise: true },
  { feature: "Custom Features",    starter: false,      business: false,      ecommerce: false,      enterprise: true },
  { feature: "Support Duration",   starter: "1 month",  business: "3 months", ecommerce: "6 months", enterprise: "12 months" },
  { feature: "Revisions",          starter: "2",        business: "5",        ecommerce: "10",       enterprise: "Unlimited" },
];

const faqs = [
  { q: "How long does it take to build a website?", a: "Timelines vary by complexity. A Starter Website typically takes 1–2 weeks, Business Websites 3–4 weeks, E-commerce stores 4–6 weeks, and Enterprise projects are scoped individually." },
  { q: "Do you offer payment plans?",               a: "Yes! We offer flexible payment plans: 50% upfront and 50% on delivery for standard projects. Custom installment plans are available for Enterprise clients." },
  { q: "Will I own my website after delivery?",     a: "Absolutely. Upon final payment, you receive full ownership of all code, design files, and digital assets. No lock-in." },
  { q: "Can I upgrade my plan later?",              a: "Yes, all our plans are designed to be scalable. You can upgrade at any time and we'll apply a credit for what you've already paid." },
  { q: "Do you provide hosting?",                   a: "We can set up and configure hosting on your preferred provider (Vercel, AWS, Cloudflare, etc.) or recommend the best option for your project." },
];

// Gradient accent per plan index
const planAccents = [
  "from-slate-700 to-slate-900",
  "from-teal-500 to-cyan-600",
  "from-violet-600 to-purple-700",
  "from-orange-500 to-rose-600",
];

const planGlows = [
  "shadow-slate-900/10",
  "shadow-teal-500/20",
  "shadow-violet-500/20",
  "shadow-orange-500/20",
];

export default function PricingClient({ plans }: { plans: any[] }) {
  const [currency, setCurrency] = useState<"USD" | "PKR">("USD");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatPrice = (priceStr: string | null | undefined) => {
    if (!priceStr) return "";
    const cleanStr = priceStr.replace(/,/g, "");
    const num = parseFloat(cleanStr);
    if (isNaN(num) || cleanStr.includes("+")) return priceStr;
    return num.toLocaleString();
  };

  const getFeatures = (features: any): string[] => {
    if (Array.isArray(features)) return features;
    if (typeof features === "string")
      return features.split("\n").map((f) => f.trim()).filter(Boolean);
    return [];
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ProlxNavbar />

      <PageHero
        breadcrumb="Pricing"
        badge="Transparent Pricing"
        badgeIcon={<Zap size={13} />}
        title={
          <>
            Simple,{" "}
            <span className="bg-gradient-to-r from-[#0D9488] to-[#0891B2] bg-clip-text text-transparent">
              Transparent
            </span>{" "}
            Pricing
          </>
        }
        subtitle="No hidden fees. No surprises. Choose the plan that fits your business and budget."
      >
        {/* Currency Toggle */}
        <div className="inline-flex items-center bg-[#F1F5F9] border border-[#E2E8F0] rounded-full p-1 gap-1">
          {(["USD", "PKR"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-7 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                currency === c
                  ? "bg-[#0D9488] text-white shadow shadow-teal-900/20"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {c === "USD" ? "🇺🇸 USD" : "🇵🇰 PKR"}
            </button>
          ))}
        </div>
      </PageHero>

      {/* ── Pricing Cards ────────────────────────────────────── */}
      <section className="py-24 -mt-12 relative z-10">
        <div className="container mx-auto px-4">
          {!plans || plans.length === 0 ? (
            <ScrollReveal direction="scale">
              <div className="text-center py-20 bg-white border border-[#E2E8F0] rounded-3xl">
                <h2 className="text-xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  No Pricing Plans Available
                </h2>
                <p className="text-[#64748B] text-sm">Check back soon or contact us for a custom quote.</p>
              </div>
            </ScrollReveal>
          ) : (
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" stagger={0.1}>
              {plans.map((plan, idx) => {
                const accentGrad = planAccents[idx % planAccents.length];
                const glow      = planGlows[idx % planGlows.length];
                const features  = getFeatures(plan.features);
                const isRec     = plan.is_recommended;

                return (
                  <StaggerItem key={plan.id} className="relative">
                    {isRec && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <span className="bg-gradient-to-r from-[#F97316] to-[#EF4444] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                          ⭐ Recommended
                        </span>
                      </div>
                    )}
                    <div
                      className={`h-full flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 shadow-xl ${glow} ${
                        isRec
                          ? "border-[#0D9488] bg-white"
                          : "border-[#E2E8F0] bg-white hover:border-[#2DD4BF]"
                      }`}
                    >
                      {/* Plan header */}
                      <div className={`bg-gradient-to-br ${accentGrad} p-6 text-white`}>
                        <h3
                          className="text-lg font-extrabold mb-1"
                          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                        >
                          {plan.name}
                        </h3>
                        <p className="text-white/70 text-xs leading-relaxed line-clamp-2">
                          {plan.description}
                        </p>
                        <div className="mt-5">
                          {plan.price_usd !== null && plan.price_usd !== undefined ? (
                            <div className="flex items-end gap-1">
                              <span
                                className="text-4xl font-extrabold"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                              >
                                {currency === "USD"
                                  ? `$${formatPrice(plan.price_usd)}`
                                  : `₨${formatPrice(plan.price_pkr)}`}
                              </span>
                              <span className="text-white/60 text-xs mb-1.5">one-time</span>
                            </div>
                          ) : (
                            <div
                              className="text-2xl font-bold"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              Custom Quote
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex-1 p-6">
                        <ul className="space-y-3 mb-8">
                          {features.map((f: string, i: number) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-[#475569]">
                              <Check size={15} className="text-[#0D9488] shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA */}
                      <div className="px-6 pb-6">
                        <Link
                          href="/contact"
                          className={`w-full py-3.5 rounded-xl font-bold text-sm text-center block transition-all ${
                            isRec
                              ? "bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white hover:shadow-lg hover:shadow-teal-200"
                              : "bg-[#F0FDFA] border border-[#0D9488] text-[#0D9488] hover:bg-[#CCFBF1]"
                          }`}
                        >
                          {plan.cta_text || "Get Started"}
                        </Link>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* ── Feature Comparison Table ─────────────────────────── */}
      <section className="py-16 bg-white border-t border-[#E2E8F0]">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" className="text-center mb-12">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0D9488] font-mono mb-3 block">
              Compare Plans
            </span>
            <h2
              className="text-4xl font-bold text-[#0F172A]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Feature Comparison
            </h2>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.1}>
            <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0] shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0A0F1E] text-white">
                    <th className="text-left p-5 font-semibold rounded-tl-2xl">Feature</th>
                    {["Starter", "Business", "E-commerce", "Enterprise"].map((h, i) => (
                      <th key={h} className={`p-5 text-center font-semibold ${i === 3 ? "rounded-tr-2xl" : ""}`}>
                        <span className={i === 1 ? "text-[#2DD4BF]" : ""}>{h}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map(({ feature, starter, business, ecommerce, enterprise }, i) => (
                    <tr key={feature} className={i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}>
                      <td className="p-4 text-[#0F172A] font-medium">{feature}</td>
                      {[starter, business, ecommerce, enterprise].map((v, j) => (
                        <td key={j} className="p-4 text-center">
                          {v === true  ? <Check size={16} className="text-[#0D9488] mx-auto" /> :
                           v === false ? <Minus size={16} className="text-[#CBD5E1] mx-auto" /> :
                           <span className="text-[#64748B] text-xs font-mono">{v}</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="py-20 bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <div className="container mx-auto px-4 max-w-3xl">
          <ScrollReveal direction="up" className="text-center mb-12">
            <h2
              className="text-4xl font-bold text-[#0F172A]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Pricing Questions
            </h2>
          </ScrollReveal>

          <StaggerContainer stagger={0.07}>
            {faqs.map(({ q, a }, i) => (
              <StaggerItem key={i}>
                <div className="mb-3 border border-[#E2E8F0] rounded-2xl overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F0FDFA] transition-colors"
                  >
                    <span className="font-semibold text-[#0F172A] text-sm pr-4">{q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-[#0D9488] shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sm text-[#64748B] leading-relaxed border-t border-[#F1F5F9] pt-4">
                      {a}
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Dark CTA ─────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0F1E] text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0D9488]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-15 pointer-events-none" />
        <ScrollReveal direction="up">
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Need a custom solution?
            </h2>
            <p className="text-[#94A3B8] mb-8 max-w-xl mx-auto">
              Enterprise-grade projects get a dedicated proposal with tailored timeline, team, and investment.
            </p>
            <Link
              href="/contact"
              className="glow-btn inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl"
            >
              Get a Custom Quote
              <ArrowRight size={16} />
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <ProlxFooter />
    </div>
  );
}
