"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

const pricingPlans = [
  {
    name: "Starter Website",
    priceUSD: 499,
    pricePKR: 140000,
    desc: "Perfect for small businesses and personal brands needing a professional online presence.",
    features: [
      "Up to 5 pages",
      "Mobile responsive design",
      "Basic SEO setup",
      "Contact form",
      "Social media integration",
      "1 month free support",
      "SSL certificate",
      "Google Analytics setup",
    ],
    notIncluded: ["Custom web app features", "E-commerce functionality", "Monthly maintenance"],
    recommended: false,
    cta: "Get Started",
  },
  {
    name: "Business Website",
    priceUSD: 1299,
    pricePKR: 365000,
    desc: "For growing businesses needing a powerful, conversion-optimized digital presence.",
    features: [
      "Up to 15 pages",
      "Advanced UI/UX design",
      "Full SEO optimization",
      "Blog / CMS integration",
      "Lead capture forms",
      "Google Analytics + Search Console",
      "3 months free support",
      "Performance optimization",
      "WhatsApp chat integration",
    ],
    notIncluded: ["Mobile app development", "Custom backend features"],
    recommended: false,
    cta: "Get Started",
  },
  {
    name: "E-commerce",
    priceUSD: 2499,
    pricePKR: 700000,
    desc: "A complete, high-converting online store built to drive sales and scale with your business.",
    features: [
      "Full product catalog",
      "Secure payment integration",
      "Inventory management",
      "Order tracking system",
      "Customer accounts",
      "Multi-currency support",
      "Advanced SEO",
      "Email marketing setup",
      "6 months free support",
    ],
    notIncluded: [],
    recommended: true,
    cta: "Get Started",
  },
  {
    name: "Custom Enterprise",
    priceUSD: null,
    pricePKR: null,
    desc: "Tailored solutions for enterprises with complex requirements, custom integrations, and ongoing needs.",
    features: [
      "Custom web / mobile app",
      "Dedicated project team",
      "API integrations",
      "Advanced security",
      "Scalable cloud infrastructure",
      "24/7 support & monitoring",
      "SLA guarantees",
      "Custom analytics dashboard",
      "Priority delivery",
    ],
    notIncluded: [],
    recommended: false,
    cta: "Contact Us",
  },
];

const comparisonFeatures = [
  { feature: "Mobile Responsive", starter: true, business: true, ecommerce: true, enterprise: true },
  { feature: "SEO Setup", starter: "Basic", business: "Advanced", ecommerce: "Advanced", enterprise: "Full" },
  { feature: "CMS / Blog", starter: false, business: true, ecommerce: true, enterprise: true },
  { feature: "E-commerce Store", starter: false, business: false, ecommerce: true, enterprise: true },
  { feature: "Custom Features", starter: false, business: false, ecommerce: false, enterprise: true },
  { feature: "Support Duration", starter: "1 month", business: "3 months", ecommerce: "6 months", enterprise: "12 months" },
  { feature: "Revisions", starter: "2", business: "5", ecommerce: "10", enterprise: "Unlimited" },
];

const faqs = [
  { q: "How long does it take to build a website?", a: "Timelines vary by complexity. A Starter Website typically takes 1–2 weeks, Business Websites 3–4 weeks, E-commerce stores 4–6 weeks, and Enterprise projects are scoped individually." },
  { q: "Do you offer payment plans?", a: "Yes! We offer flexible payment plans: 50% upfront and 50% on delivery for standard projects. Custom installment plans are available for Enterprise clients." },
  { q: "Will I own my website after delivery?", a: "Absolutely. Upon final payment, you receive full ownership of all code, design files, and digital assets. No lock-in." },
  { q: "Can I upgrade my plan later?", a: "Yes, all our plans are designed to be scalable. You can upgrade at any time and we'll apply a credit for what you've already paid." },
  { q: "Do you provide hosting?", a: "We can set up and configure hosting on your preferred provider (Vercel, AWS, Cloudflare, etc.) or recommend the best option for your project." },
];

export default function PricingPage() {
  const [currency, setCurrency] = useState<"USD" | "PKR">("USD");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-[#F0FDFA]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
            <Link href="/" className="hover:text-[#0D9488]">Home</Link>
            <ChevronRight size={14} />
            <span className="text-[#0D9488]">Pricing</span>
          </div>
          <div className="text-center">
            <h1
              className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-4"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Simple, Transparent{" "}
              <em
                style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
              >
                Pricing
              </em>
            </h1>
            <p className="text-[#64748B] text-lg max-w-xl mx-auto mb-8">
              No hidden fees. No surprises. Choose the plan that fits your business and budget.
            </p>

            {/* Currency Toggle */}
            <div className="inline-flex items-center bg-[#E2E8F0] rounded-full p-1 gap-1">
              {(["USD", "PKR"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                    currency === c
                      ? "bg-[#0D9488] text-white shadow"
                      : "text-[#64748B] hover:text-[#0D9488]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map(({ name, priceUSD, pricePKR, desc, features, recommended, cta }) => (
              <div
                key={name}
                className={`rounded-2xl border-2 p-8 flex flex-col relative ${
                  recommended
                    ? "border-[#0D9488] bg-[#F0FDFA] shadow-xl shadow-teal-100"
                    : "border-[#E2E8F0] bg-white hover:border-[#2DD4BF] hover:shadow-lg"
                } transition-all`}
              >
                {recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#F97316] text-white text-xs font-bold px-4 py-1 rounded-full">
                      Recommended
                    </span>
                  </div>
                )}
                <h3
                  className="text-xl font-bold text-[#0F172A] mb-2"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {name}
                </h3>
                <p className="text-[#64748B] text-xs mb-5">{desc}</p>

                <div className="mb-6">
                  {priceUSD ? (
                    <div className="flex items-end gap-1">
                      <span
                        className="text-3xl font-bold text-[#0F172A]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {currency === "USD" ? `$${priceUSD.toLocaleString()}` : `₨${pricePKR?.toLocaleString()}`}
                      </span>
                      <span className="text-[#64748B] text-sm mb-1">one-time</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-[#0D9488]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      Custom Quote
                    </div>
                  )}
                </div>

                <ul className="space-y-2 mb-8 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#64748B]">
                      <span className="text-[#0D9488] mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className={`w-full py-3 rounded-xl font-semibold text-sm text-center transition-all ${
                    recommended
                      ? "bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-md"
                      : "bg-[#F0FDFA] border border-[#0D9488] text-[#0D9488] hover:bg-[#CCFBF1]"
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="container mx-auto px-4">
          <h2
            className="text-3xl font-bold text-[#0F172A] text-center mb-10"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Feature Comparison
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="text-left p-4 text-[#0F172A] font-semibold">Feature</th>
                  {["Starter", "Business", "E-commerce", "Enterprise"].map((h) => (
                    <th key={h} className="p-4 text-center text-[#0D9488] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map(({ feature, starter, business, ecommerce, enterprise }, i) => (
                  <tr key={feature} className={i % 2 === 0 ? "bg-[#F8FAFC]" : "bg-white"}>
                    <td className="p-4 text-[#64748B]">{feature}</td>
                    {[starter, business, ecommerce, enterprise].map((v, j) => (
                      <td key={j} className="p-4 text-center">
                        {v === true ? (
                          <span className="text-[#0D9488]">✓</span>
                        ) : v === false ? (
                          <span className="text-[#CBD5E1]">—</span>
                        ) : (
                          <span className="text-[#64748B] text-xs">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2
            className="text-3xl font-bold text-[#0F172A] text-center mb-10"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <div key={i} className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F0FDFA] transition-colors"
                >
                  <span className="font-semibold text-[#0F172A] text-sm">{q}</span>
                  <ChevronRight
                    size={18}
                    className={`text-[#0D9488] transition-transform shrink-0 ${openFaq === i ? "rotate-90" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-[#64748B] leading-relaxed border-t border-[#E2E8F0] pt-4">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
