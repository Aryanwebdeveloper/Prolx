import Link from "next/link";
import {
  Twitter,
  Linkedin,
  Github,
  Instagram,
  Facebook,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function ProlxFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#0D9488] flex items-center justify-center">
                <span className="text-white font-bold text-sm font-mono">Px</span>
              </div>
              <span
                className="text-white font-bold text-xl"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Prolx
              </span>
            </Link>
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">
              Premium digital agency building exceptional web experiences, mobile
              apps, and digital products that grow businesses worldwide.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Twitter, href: "#" },
                { Icon: Linkedin, href: "#" },
                { Icon: Github, href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Facebook, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#0D9488] transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-semibold text-white mb-4"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "/about" },
                { label: "Portfolio", href: "/portfolio" },
                { label: "Blog", href: "/blog" },
                { label: "Careers", href: "/careers" },
                { label: "Testimonials", href: "/testimonials" },
                { label: "FAQs", href: "/faqs" },
                { label: "Support", href: "/support" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[#94A3B8] hover:text-[#2DD4BF] text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4
              className="font-semibold text-white mb-4"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Services
            </h4>
            <ul className="space-y-2.5">
              {[
                "Website Development",
                "Mobile App Development",
                "UI/UX Design",
                "E-commerce Development",
                "SEO Optimization",
                "Digital Marketing",
              ].map((s) => (
                <li key={s}>
                  <Link
                    href="/services"
                    className="text-[#94A3B8] hover:text-[#2DD4BF] text-sm transition-colors"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="font-semibold text-white mb-4"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Contact Info
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-[#94A3B8]">
                <Mail size={16} className="text-[#2DD4BF] mt-0.5 shrink-0" />
                hello@prolx.digital
              </li>
              <li className="flex items-start gap-3 text-sm text-[#94A3B8]">
                <Phone size={16} className="text-[#2DD4BF] mt-0.5 shrink-0" />
                +92 300 1234567
              </li>
              <li className="flex items-start gap-3 text-sm text-[#94A3B8]">
                <MapPin size={16} className="text-[#2DD4BF] mt-0.5 shrink-0" />
                Karachi, Pakistan
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm text-white font-medium mb-2">
                Subscribe to Newsletter
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#0D9488]"
                />
                <button className="px-3 py-2 bg-[#0D9488] hover:bg-[#0F766E] rounded-lg text-sm font-medium transition-colors">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#64748B] text-sm">
            © {currentYear} Prolx Digital Agency. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-[#64748B] hover:text-[#2DD4BF] text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-[#64748B] hover:text-[#2DD4BF] text-sm transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
