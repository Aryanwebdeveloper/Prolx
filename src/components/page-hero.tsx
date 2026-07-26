import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";

interface PageHeroProps {
  breadcrumb: string;
  badge?: string;
  badgeIcon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
  accentColor?: string;
}

/**
 * Shared light-mode page hero — white background with soft gradient orbs,
 * a 3px teal accent top-line, breadcrumb, optional badge, large title, and subtitle.
 */
export default function PageHero({
  breadcrumb,
  badge,
  badgeIcon,
  title,
  subtitle,
  children,
}: PageHeroProps) {
  return (
    <section className="relative pt-32 pb-20 bg-white overflow-hidden">
      {/* Soft gradient orbs */}
      <div className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full bg-[#0D9488]/6 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#6366F1]/5 blur-[100px] pointer-events-none" />
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0D9488] via-[#0891B2] to-[#6366F1]" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal direction="up">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#64748B] mb-6">
            <Link href="/" className="hover:text-[#0D9488] transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-[#CBD5E1]" />
            <span className="text-[#0D9488] font-semibold">{breadcrumb}</span>
          </div>

          {/* Badge */}
          {badge && (
            <div className="inline-flex items-center gap-2 bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-2 rounded-full mb-6">
              {badgeIcon}
              {badge}
            </div>
          )}

          {/* Title */}
          <h1
            className="text-5xl md:text-7xl font-extrabold text-[#0F172A] leading-[1.05] mb-5"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-[#64748B] text-xl max-w-2xl leading-relaxed mb-8">
              {subtitle}
            </p>
          )}

          {/* Extra content (rating badges, currency toggles, search bars, etc.) */}
          {children}
        </ScrollReveal>
      </div>
    </section>
  );
}
