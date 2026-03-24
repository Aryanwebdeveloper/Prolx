"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    company: "FinEdge Technologies",
    role: "CEO",
    rating: 5,
    quote:
      "Prolx transformed our outdated banking platform into a sleek, modern web application. Our customer engagement increased by 240% within three months of launch. They didn't just build software — they understood our business.",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    video: false,
  },
  {
    name: "James Okonkwo",
    company: "MedCare Health",
    role: "CTO",
    rating: 5,
    quote:
      "The patient portal Prolx built is the best investment we've made in years. Patients love it, staff adoption was seamless, and their ongoing support has been exceptional. True technology partners.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    video: false,
  },
  {
    name: "Priya Sharma",
    company: "Bloom Retail",
    role: "Founder",
    rating: 5,
    quote:
      "Our e-commerce revenue doubled after Prolx redesigned our store. The performance improvements, better UX, and SEO strategy they implemented were game-changers. I recommend them to every entrepreneur I know.",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
    video: false,
  },
  {
    name: "Ahmed Hassan",
    company: "EduLearn Platform",
    role: "Product Director",
    rating: 5,
    quote:
      "Prolx delivered our entire learning management system — web and mobile — in just 10 weeks. The quality, attention to detail, and communication throughout the project exceeded all expectations.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
    video: false,
  },
  {
    name: "Lisa Chen",
    company: "CloudStack SaaS",
    role: "VP Engineering",
    rating: 5,
    quote:
      "We hired Prolx to build our real-time analytics dashboard. The architecture is solid, the UI is beautiful, and it handles millions of events without breaking a sweat. Their engineering team is world-class.",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    video: true,
  },
  {
    name: "Omar Al-Rashid",
    company: "Gulf Logistics",
    role: "Managing Director",
    rating: 4,
    quote:
      "Prolx built our fleet tracking system from scratch. Real-time GPS, driver management, and customer notifications — all in one platform. Our operational efficiency improved by 60%. Outstanding work.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    video: false,
  },
  {
    name: "Fatima Al-Zahra",
    company: "Luxe Interiors",
    role: "Creative Director",
    rating: 5,
    quote:
      "The branding and website Prolx created for us perfectly captured our premium aesthetic. Every detail — from typography to animations — feels intentional and sophisticated. Our brand perception has never been stronger.",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    video: false,
  },
  {
    name: "David Park",
    company: "NexGen Fintech",
    role: "Co-Founder",
    rating: 5,
    quote:
      "Prolx helped us go from napkin sketch to funded startup. Their UI/UX design for our investor deck and MVP was instrumental in closing our seed round. They're more than a vendor — they're a growth partner.",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80",
    video: true,
  },
  {
    name: "Rachel Fernandez",
    company: "TravelWise App",
    role: "Head of Product",
    rating: 5,
    quote:
      "Our React Native travel app reached #12 in the App Store within its first month, thanks to Prolx's engineering and UX expertise. The performance is silky smooth and users love the interface.",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    video: false,
  },
];

const avgRating =
  testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-[#F0FDFA]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
            <Link href="/" className="hover:text-[#0D9488]">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="text-[#0D9488]">Testimonials</span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            What Our Clients{" "}
            <em
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: "italic",
                color: "#0D9488",
              }}
            >
              Say
            </em>
          </h1>
          <p className="text-[#64748B] text-lg max-w-xl mb-8">
            Don&apos;t just take our word for it — hear from the businesses
            we&apos;ve helped grow and transform through technology.
          </p>

          {/* Aggregate Rating */}
          <div className="inline-flex items-center gap-3 bg-white border border-[#CCFBF1] rounded-2xl px-6 py-4">
            <span
              className="text-4xl font-bold text-[#0F172A]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {avgRating.toFixed(1)}
            </span>
            <div>
              <div className="flex gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={18}
                    className={
                      s <= Math.round(avgRating)
                        ? "fill-[#F97316] text-[#F97316]"
                        : "text-[#E2E8F0]"
                    }
                  />
                ))}
              </div>
              <p className="text-xs text-[#64748B]">
                Based on {testimonials.length} reviews
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="break-inside-avoid bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#2DD4BF] hover:shadow-lg transition-all"
              >
                {t.video && (
                  <div className="bg-[#F0FDFA] rounded-xl flex items-center justify-center h-40 mb-4 border border-[#CCFBF1]">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-[#0D9488] flex items-center justify-center mx-auto mb-2">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="white"
                        >
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                      <p className="text-xs text-[#64748B]">
                        Video Testimonial
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className={
                        s <= t.rating
                          ? "fill-[#F97316] text-[#F97316]"
                          : "text-[#E2E8F0]"
                      }
                    />
                  ))}
                </div>

                <p className="text-[#64748B] text-sm leading-relaxed mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={t.img}
                      alt={t.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {t.name}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {t.role}, {t.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#0D9488]">
        <div className="container mx-auto px-4 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Ready to Join Our Success Stories?
          </h2>
          <p className="text-teal-100 mb-8 max-w-xl mx-auto">
            Let&apos;s build something extraordinary together. Start with a free
            consultation.
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
