import { getTestimonials } from "@/app/testimonials-actions";
import TestimonialsCarousel from "./testimonials-carousel";

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
    <section className="py-20 bg-[#F0FDFA]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 font-mono">
            Client Stories
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold text-[#0F172A] tracking-tight"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            What Our{" "}
            <em
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
            >
              Clients Say
            </em>
          </h2>
          <p className="text-[#64748B] text-base mt-3 max-w-md mx-auto">
            Real feedback from real clients we&apos;ve worked with.
          </p>
        </div>

        <TestimonialsCarousel testimonials={displayTestimonials} />
      </div>
    </section>
  );
}
