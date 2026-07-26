import Link from "next/link";
import Image from "next/image";
import {
  Twitter,
  Linkedin,
  Github,
  Instagram,
  Facebook,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";

export default function ProlxFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#060D18] text-white relative overflow-hidden">
      {/* Ambient top glow */}
      <div className="absolute top-0 left-1/4 w-96 h-64 bg-[#0D9488]/6 blur-[80px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-64 bg-[#7C3AED]/4 blur-[80px] pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0D9488]/50 to-transparent" />

      <div className="container mx-auto px-4 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-5 group">
              <Image
                src="/ProLx_withoutBackground.png"
                alt="Prolx Logo"
                width={160}
                height={50}
                className="w-auto h-8 group-hover:opacity-90 transition-opacity"
              />
            </Link>
            <p className="text-[#64748B] text-sm leading-relaxed mb-7">
              Premium digital agency building exceptional web experiences, mobile
              apps, and digital products that grow businesses worldwide.
            </p>
            <div className="flex gap-2.5">
              {[
                { Icon: Twitter,   href: "#", label: "Twitter"   },
                { Icon: Linkedin,  href: "#", label: "LinkedIn"  },
                { Icon: Github,    href: "#", label: "GitHub"    },
                { Icon: Instagram, href: "#", label: "Instagram" },
                { Icon: Facebook,  href: "#", label: "Facebook"  },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg glass-card flex items-center justify-center hover:bg-[#0D9488] hover:border-[#0D9488] transition-all duration-200 group"
                >
                  <Icon size={15} className="text-[#64748B] group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-bold text-white mb-5 relative inline-block"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Quick Links
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-[#0D9488] to-transparent rounded-full" />
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Home",         href: "/"             },
                { label: "About Us",     href: "/about"        },
                { label: "Portfolio",    href: "/portfolio"    },
                { label: "Blog",         href: "/blog"         },
                { label: "Careers",      href: "/careers"      },
                { label: "Testimonials", href: "/testimonials" },
                { label: "FAQs",         href: "/faqs"         },
                { label: "Support",      href: "/support"      },
                { label: "Sign In",      href: "/sign-in"      },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[#64748B] hover:text-[#2DD4BF] text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-[#2DD4BF] transition-all duration-200 rounded-full" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4
              className="font-bold text-white mb-5 relative inline-block"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Services
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-[#0D9488] to-transparent rounded-full" />
            </h4>
            <ul className="space-y-3">
              {[
                "Website Development",
                "Mobile App Development",
                "Desktop App Development",
                "Business Management (POS)",
                "UI/UX Design",
                "E-commerce Development",
                "Software Development",
                "WordPress & Shopify",
                "SEO Optimization",
              ].map((s) => (
                <li key={s}>
                  <Link
                    href="/services"
                    className="text-[#64748B] hover:text-[#2DD4BF] text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-[#2DD4BF] transition-all duration-200 rounded-full" />
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Prolx Academy */}
          <div>
            <h4
              className="font-bold text-white mb-5 relative inline-block"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Prolx Academy
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-[#7C3AED] to-transparent rounded-full" />
            </h4>
            <ul className="space-y-3">
              {[
                { label: "All Courses",           href: "/academy/courses"            },
                { label: "Upcoming Batches",       href: "/academy/batches"            },
                { label: "Free Workshops",         href: "/academy/events"             },
                { label: "Internship Programs",    href: "/academy/internships"        },
                { label: "Corporate Training",     href: "/academy#corporate"          },
                { label: "Career Bootcamps",       href: "/academy/events"             },
                { label: "Success Stories",        href: "/academy#success-stories"    },
                { label: "Learning Paths",         href: "/academy#learning-paths"     },
                { label: "Course Certificates",    href: "/academy/certificates/verify"},
                { label: "Become an Instructor",   href: "/academy/become-instructor"  },
                { label: "Book Free Demo",         href: "/academy/demo"              },
                { label: "Contact Academy",        href: "/contact"                    },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[#64748B] hover:text-[#A78BFA] text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-[#A78BFA] transition-all duration-200 rounded-full" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          <div>
            <h4
              className="font-bold text-white mb-5 relative inline-block"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Contact Info
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-[#0D9488] to-transparent rounded-full" />
            </h4>
            <ul className="space-y-4 mb-7">
              <li className="flex items-start gap-3 text-sm text-[#64748B]">
                <div className="w-7 h-7 rounded-lg bg-[#0D9488]/15 border border-[#0D9488]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail size={13} className="text-[#2DD4BF]" />
                </div>
                hello@prolx.digital
              </li>
              <li className="flex items-start gap-3 text-sm text-[#64748B]">
                <div className="w-7 h-7 rounded-lg bg-[#0D9488]/15 border border-[#0D9488]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone size={13} className="text-[#2DD4BF]" />
                </div>
                03300356046
              </li>
              <li className="flex items-start gap-3 text-sm text-[#64748B]">
                <div className="w-7 h-7 rounded-lg bg-[#0D9488]/15 border border-[#0D9488]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={13} className="text-[#2DD4BF]" />
                </div>
                Havelian Main Bazar, Abbottabad, Pakistan
              </li>
            </ul>

            {/* Newsletter */}
            <div>
              <p className="text-sm text-white font-semibold mb-3">
                Subscribe to Newsletter
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 glass-card rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#0D9488] transition-colors"
                />
                <button className="px-3 py-2.5 bg-gradient-to-r from-[#0D9488] to-[#0891B2] hover:opacity-90 rounded-lg transition-opacity">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#475569] text-sm">
            © {currentYear} Prolx Digital Agency. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-[#475569] hover:text-[#2DD4BF] text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-[#475569] hover:text-[#2DD4BF] text-sm transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
