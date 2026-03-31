"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Star } from "lucide-react";

export default function TestimonialsClient({ testimonials }: { testimonials: any[] }) {
  const avgRating = testimonials.length > 0 
    ? testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / testimonials.length 
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-[#F0FDFA]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
            <Link href="/" className="hover:text-[#0D9488]">Home</Link>
            <ChevronRight size={14} />
            <span className="text-[#0D9488]">Testimonials</span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            What Our Clients{" "}
            <em style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}>
              Say
            </em>
          </h1>
          <p className="text-[#64748B] text-lg max-w-xl mb-8">
            Don&apos;t just take our word for it — hear from the businesses
            we&apos;ve helped grow and transform through technology.
          </p>

          {/* Aggregate Rating */}
          {testimonials.length > 0 && (
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
          )}
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {!testimonials || testimonials.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#E2E8F0] rounded-2xl">
               <h2 className="text-xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>No Testimonials Found</h2>
               <p className="text-[#64748B] text-sm text-center">We haven't added any client testimonials yet.</p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="break-inside-avoid bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#2DD4BF] hover:shadow-lg transition-all"
                >
                  {t.video_url && (
                    <div className="bg-[#F0FDFA] rounded-xl flex items-center justify-center h-40 mb-4 border border-[#CCFBF1]">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-[#0D9488] flex items-center justify-center mx-auto mb-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <polygon points="5,3 19,12 5,21" />
                          </svg>
                        </div>
                        <p className="text-xs text-[#64748B]">Video Testimonial</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={
                          s <= (t.rating || 5)
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
                        src={t.photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"}
                        alt={t.client_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">
                        {t.client_name}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {t.role}, {t.company}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            Let&apos;s build something extraordinary together. Start with a free consultation.
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
