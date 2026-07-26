"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronRight, Star, Quote, ArrowRight, MessageSquare } from "lucide-react";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/scroll-reveal";
import PageHero from "@/components/page-hero";

// Rating badge colors
const ratingColors: Record<number, string> = {
  5: "bg-emerald-50 text-emerald-600 border-emerald-200",
  4: "bg-teal-50 text-teal-600 border-teal-200",
  3: "bg-amber-50 text-amber-600 border-amber-200",
  2: "bg-orange-50 text-orange-600 border-orange-200",
  1: "bg-rose-50 text-rose-600 border-rose-200",
};

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= rating ? "fill-[#F97316] text-[#F97316]" : "text-[#E2E8F0] fill-[#E2E8F0]"}
        />
      ))}
    </div>
  );
}

export default function TestimonialsClient({ testimonials }: { testimonials: any[] }) {
  const [activeRating, setActiveRating] = useState<number | null>(null);

  const avgRating =
    testimonials.length > 0
      ? testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / testimonials.length
      : 0;

  const filtered =
    activeRating === null
      ? testimonials
      : testimonials.filter((t) => (t.rating || 5) === activeRating);

  const ratingCounts: Record<number, number> = {};
  testimonials.forEach((t) => {
    const r = t.rating || 5;
    ratingCounts[r] = (ratingCounts[r] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ProlxNavbar />

      <PageHero
        breadcrumb="Testimonials"
        badge="Client Stories"
        badgeIcon={<MessageSquare size={13} />}
        title={
          <>
            What Our Clients{" "}
            <span className="bg-gradient-to-r from-[#0D9488] to-[#0891B2] bg-clip-text text-transparent">
              Say
            </span>
          </>
        }
        subtitle="Don't just take our word for it — hear from the businesses we've helped grow and transform through technology."
      >
        {/* Aggregate Rating */}
        {testimonials.length > 0 && (
          <div className="inline-flex items-center gap-5 bg-white border border-[#E2E8F0] shadow-sm rounded-2xl px-7 py-4">
            <div>
              <div
                className="text-4xl font-extrabold text-[#0F172A]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {avgRating.toFixed(1)}
              </div>
              <StarRow rating={Math.round(avgRating)} size={16} />
            </div>
            <div className="w-px h-10 bg-[#E2E8F0]" />
            <div>
              <p className="text-2xl font-bold text-[#0F172A]">{testimonials.length}</p>
              <p className="text-xs text-[#64748B]">verified reviews</p>
            </div>
          </div>
        )}
      </PageHero>

      {/* ── Rating Filter Bar ────────────────────────────────── */}
      {testimonials.length > 0 && (
        <div className="py-5 bg-white border-b border-[#E2E8F0] sticky top-[64px] md:top-[80px] z-40 shadow-sm">
          <div className="container mx-auto px-4 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] font-mono mr-2">
              Filter:
            </span>
            <button
              onClick={() => setActiveRating(null)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeRating === null
                  ? "bg-[#0D9488] text-white shadow"
                  : "bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1] hover:bg-[#CCFBF1]"
              }`}
            >
              All ({testimonials.length})
            </button>
            {[5, 4, 3, 2, 1]
              .filter((r) => ratingCounts[r])
              .map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRating(activeRating === r ? null : r)}
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                    activeRating === r
                      ? "bg-[#0D9488] text-white shadow"
                      : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:border-[#0D9488]"
                  }`}
                >
                  <Star size={10} className={activeRating === r ? "fill-white text-white" : "fill-[#F97316] text-[#F97316]"} />
                  {r} ({ratingCounts[r]})
                </button>
              ))}
          </div>
        </div>
      )}

      {/* ── Testimonials Grid ────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          {!testimonials || testimonials.length === 0 ? (
            <ScrollReveal direction="scale">
              <div className="text-center py-24 bg-white border border-dashed border-[#E2E8F0] rounded-3xl">
                <h2
                  className="text-2xl font-bold text-[#0F172A] mb-2"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  No Testimonials Yet
                </h2>
                <p className="text-[#64748B] text-sm">Check back soon — we&apos;re collecting more success stories.</p>
              </div>
            </ScrollReveal>
          ) : (
            <StaggerContainer
              key={String(activeRating)}
              className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
              stagger={0.08}
            >
              {filtered.map((t) => {
                const rating = t.rating || 5;
                return (
                  <StaggerItem
                    key={t.id}
                    className="break-inside-avoid bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#0D9488]/40 hover:shadow-xl hover:shadow-teal-50 transition-all duration-300 group"
                  >
                    {/* Video placeholder */}
                    {t.video_url && (
                      <div className="bg-[#F0FDFA] rounded-xl flex items-center justify-center h-40 mb-5 border border-[#CCFBF1] overflow-hidden">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-[#0D9488] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                              <polygon points="5,3 19,12 5,21" />
                            </svg>
                          </div>
                          <p className="text-xs text-[#64748B]">Video Testimonial</p>
                        </div>
                      </div>
                    )}

                    {/* Rating & badge */}
                    <div className="flex items-center justify-between mb-4">
                      <StarRow rating={rating} />
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider font-mono ${
                          ratingColors[rating] || ratingColors[5]
                        }`}
                      >
                        {rating}/5
                      </span>
                    </div>

                    {/* Quote */}
                    <div className="relative mb-5">
                      <Quote size={24} className="text-[#0D9488]/20 mb-2" />
                      <p className="text-[#475569] text-sm leading-relaxed italic">
                        {t.quote}
                      </p>
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-4 border-t border-[#F1F5F9]">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#CCFBF1] shrink-0">
                        <Image
                          src={
                            t.photo_url ||
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
                          }
                          alt={t.client_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F172A]">{t.client_name}</p>
                        <p className="text-xs text-[#64748B]">
                          {t.role}{t.company ? `, ${t.company}` : ""}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}

          {filtered.length === 0 && testimonials.length > 0 && (
            <div className="text-center py-16 text-[#64748B]">
              <p className="text-lg font-bold text-[#0F172A] mb-2">No reviews for this rating.</p>
              <button
                onClick={() => setActiveRating(null)}
                className="text-sm text-[#0D9488] font-bold hover:underline"
              >
                Show all reviews
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Dark CTA ─────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0F1E] text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#0D9488]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-15 pointer-events-none" />
        <ScrollReveal direction="up">
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Ready to Join Our Success Stories?
            </h2>
            <p className="text-[#94A3B8] mb-8 max-w-xl mx-auto">
              Let&apos;s build something extraordinary together. Start with a free consultation.
            </p>
            <Link
              href="/contact"
              className="glow-btn inline-flex items-center gap-2.5 px-9 py-4 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl"
            >
              Start Your Project
              <ArrowRight size={16} />
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <ProlxFooter />
    </div>
  );
}
