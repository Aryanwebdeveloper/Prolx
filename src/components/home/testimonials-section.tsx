import { getTestimonials } from "@/app/testimonials-actions";
import TestimonialsCarousel from "./testimonials-carousel";
import ScrollReveal from "@/components/scroll-reveal";

const fallbackTestimonials = [
  {
    quote: "Prolx delivered our website faster than expected and the quality was outstanding. They were responsive, easy to work with, and genuinely cared about getting things right.",
    name: "Arif Rahman",
    company: "Founder, Spectrum Marketer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
    rating: 5,
  },
  {
    quote: "Working with Prolx was a great experience. They understood our vision quickly and built exactly what we needed — clean, fast, and on budget.",
    name: "Sarah Ahmed",
    company: "Co-Founder, BIC AUST",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
    rating: 5,
  },
  {
    quote: "The team at Prolx made the whole process simple and stress-free. Our new website looks professional and we've already seen more inquiries coming in.",
    name: "James Okafor",
    company: "Owner, Local Business",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80",
    rating: 5,
  },
];

export default async function TestimonialsSection() {
  const { data: dbTestimonials } = await getTestimonials(true);

  const displayTestimonials =
    dbTestimonials && dbTestimonials.length > 0
      ? dbTestimonials.map((t) => ({
          quote: t.content,
          name: t.author_name,
          company: t.author_role,
          avatar: t.author_avatar_url,
          rating: t.rating || 5,
        }))
      : fallbackTestimonials;

  return (
    <section className="py-24 bg-[#F0FDFA] relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0D9488]/40 to-transparent" />

      {/* Background orbs */}
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-[#0D9488]/8 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-[#0891B2]/6 blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <ScrollReveal direction="up" className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-2 rounded-full mb-5 font-mono">
            Client Stories
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-[#0F172A] tracking-tight"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            What Our{" "}
            <em
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
            >
              Clients Say
            </em>
          </h2>
          <p className="text-[#64748B] text-lg mt-4 max-w-md mx-auto">
            Real feedback from real clients we&apos;ve worked with.
          </p>
        </ScrollReveal>

        <TestimonialsCarousel testimonials={displayTestimonials} />
      </div>
    </section>
  );
}
