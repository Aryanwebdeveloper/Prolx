import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import {
  Globe, Code2, Smartphone, Palette, PenTool, Layers,
  ShoppingBag, Box, Search, BarChart2, Cloud, Settings, ChevronRight,
  Monitor, Briefcase, Cpu, Layout, Store
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services | Web & App Development, SEO, Design | Prolx",
  description: "Explore our premium digital services including website development, mobile apps, UI/UX design, SEO, SaaS development, and more.",
};

const services = [
  {
    icon: Globe,
    title: "Website Development",
    category: "Development",
    desc: "We craft blazing-fast, SEO-ready websites that convert visitors into loyal customers. Built with Next.js, React, and performance-first principles — your site will score high on Core Web Vitals and look stunning across every device.",
    benefits: ["SEO-optimized from day one", "Mobile-first responsive design", "PageSpeed 90+ guaranteed", "CMS integration available"],
    techs: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase"],
  },
  {
    icon: Code2,
    title: "Custom Web Apps",
    category: "Development",
    desc: "Need a unique digital product? We architect and build scalable web applications tailored to your exact business requirements — from internal tools to complex SaaS platforms with sophisticated workflows.",
    benefits: ["Custom business logic", "Role-based access control", "API integrations", "Real-time features"],
    techs: ["Next.js", "Node.js", "PostgreSQL", "Redis", "Docker"],
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    category: "Mobile",
    desc: "Reach your audience on iOS and Android with polished, performant mobile applications. We specialize in cross-platform development with React Native and Flutter, delivering native-quality experiences efficiently.",
    benefits: ["iOS & Android coverage", "Offline functionality", "Push notifications", "App Store optimization"],
    techs: ["React Native", "Flutter", "Firebase", "Supabase", "Expo"],
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    category: "Design",
    desc: "Great products start with great design. Our UX process blends user research, information architecture, and pixel-perfect visual design to create interfaces that feel intuitive, beautiful, and conversion-optimized.",
    benefits: ["User research & testing", "Figma prototypes", "Design system creation", "Accessibility compliant"],
    techs: ["Figma", "Framer", "Principle", "Adobe XD", "Maze"],
  },
  {
    icon: PenTool,
    title: "Graphic Design",
    category: "Design",
    desc: "From social media assets to print-ready marketing materials — our graphic design team creates compelling visuals that capture attention and communicate your brand story with clarity and impact.",
    benefits: ["Social media kits", "Print-ready files", "Consistent brand voice", "Multiple format delivery"],
    techs: ["Illustrator", "Photoshop", "After Effects", "InDesign", "Canva Pro"],
  },
  {
    icon: Layers,
    title: "Branding",
    category: "Design",
    desc: "A strong brand is your most valuable business asset. We create comprehensive brand identity systems — from logo and color palette to typography and brand guidelines — that position you as a premium player in your market.",
    benefits: ["Logo & identity design", "Brand guidelines book", "Color & typography system", "Brand voice development"],
    techs: ["Illustrator", "Figma", "Photoshop", "Fontlab", "Adobe CC"],
  },
  {
    icon: ShoppingBag,
    title: "E-commerce Development",
    category: "Development",
    desc: "Launch a high-converting online store that drives sales at scale. We build custom e-commerce experiences on Shopify, WooCommerce, or fully bespoke platforms with checkout optimization and inventory management built in.",
    benefits: ["Conversion-optimized checkout", "Inventory management", "Multi-currency support", "Analytics integration"],
    techs: ["Shopify", "WooCommerce", "Next.js", "Stripe", "Klaviyo"],
  },
  {
    icon: Box,
    title: "SaaS Development",
    category: "Development",
    desc: "Turn your idea into a revenue-generating SaaS product. We handle everything from MVP to enterprise scale — authentication, subscription billing, multi-tenancy, analytics dashboards, and scalable infrastructure.",
    benefits: ["Multi-tenant architecture", "Subscription billing", "Admin dashboards", "Scalable infrastructure"],
    techs: ["Next.js", "Prisma", "Stripe", "AWS", "Supabase"],
  },
  {
    icon: Search,
    title: "SEO Optimization",
    category: "Marketing",
    desc: "Climb to page one and stay there. Our technical and content SEO strategies cover everything from site audits and Core Web Vitals to keyword strategy, link building, and schema markup — driving sustainable organic growth.",
    benefits: ["Technical SEO audits", "Keyword strategy", "Content optimization", "Link building campaigns"],
    techs: ["Ahrefs", "SEMrush", "Google Search Console", "Screaming Frog", "Schema.org"],
  },
  {
    icon: BarChart2,
    title: "Digital Marketing",
    category: "Marketing",
    desc: "Data-driven campaigns that deliver measurable ROI. From Google Ads and Meta to email marketing and social media management — we plan, execute, and optimize campaigns that turn spend into revenue.",
    benefits: ["Paid search & social", "Email marketing automation", "Conversion rate optimization", "Monthly performance reports"],
    techs: ["Google Ads", "Meta Ads", "Klaviyo", "HubSpot", "GA4"],
  },
  {
    icon: Cloud,
    title: "Cloud Solutions",
    category: "Infrastructure",
    desc: "Future-proof your infrastructure with cloud-native architecture. We design, deploy, and manage scalable cloud environments on AWS, GCP, and Azure — with CI/CD pipelines, monitoring, and DevOps best practices built in.",
    benefits: ["AWS / GCP / Azure", "CI/CD pipeline setup", "Infrastructure as code", "24/7 monitoring"],
    techs: ["AWS", "GCP", "Docker", "Kubernetes", "Terraform"],
  },
  {
    icon: Settings,
    title: "Website Maintenance",
    category: "Support",
    desc: "Keep your website fast, secure, and up-to-date without lifting a finger. Our maintenance plans cover security monitoring, plugin updates, performance optimization, content updates, and monthly health reports.",
    benefits: ["Security monitoring", "Regular backups", "Performance optimization", "Content updates"],
    techs: ["WordPress", "Next.js", "Cloudflare", "Sentry", "UptimeRobot"],
  },
  {
    icon: Monitor,
    title: "Desktop Applications",
    category: "Development",
    desc: "We build powerful, native desktop software for Windows, macOS, and Linux. Whether you need a high-performance utility or a complex offline application, we deliver deep system integration and seamless user experiences.",
    benefits: ["Native performance", "Offline capabilities", "System-level integration", "Cross-platform support"],
    techs: ["Electron", "Tauri", "C# / .NET", "Java", "Python"],
  },
  {
    icon: Briefcase,
    title: "Business Management (POS)",
    category: "Software",
    desc: "Digitalize your business operations with custom Point of Sale (POS) systems, ERPs, and CRM tools. We build solutions that track inventory, manage sales, and generate detailed reports tailored to your industry.",
    benefits: ["Inventory automation", "Real-time reporting", "Multi-branch support", "Cloud synchronization"],
    techs: ["Next.js", "PostgreSQL", "Supabase", "Redis", "Node.js"],
  },
  {
    icon: Cpu,
    title: "Custom Software",
    category: "Development",
    desc: "Have a unique challenge? We develop bespoke software solutions that don't fit into a standard box. From custom algorithms and automation scripts to complex enterprise systems, we build what you need.",
    benefits: ["Bespoke architecture", "Automation of workflows", "Legacy system integration", "Scalable solutions"],
    techs: ["Python", "Go", "Rust", "C++", "Docker"],
  },
  {
    icon: Layout,
    title: "WordPress Development",
    category: "CMS",
    desc: "Get a professional, easy-to-manage website with the world's most popular CMS. We create custom WordPress themes and plugins, ensuring your site is fast, secure, and perfectly aligned with your brand identity.",
    benefits: ["Custom theme design", "Plugin development", "Easy content management", "SEO & Speed optimization"],
    techs: ["PHP", "WordPress", "JavaScript", "Elementor", "WP Engine"],
  },
  {
    icon: Store,
    title: "Shopify Development",
    category: "E-commerce",
    desc: "Scale your e-commerce business with a high-converting Shopify store. We specialize in custom Liquid themes, private app development, and third-party integrations to provide a premium shopping experience.",
    benefits: ["Custom Liquid themes", "App integrations", "Checkout optimization", "Performance tuning"],
    techs: ["Shopify Liquid", "Remix", "Hydrogen", "Polaris", "JavaScript"],
  },
];

const categories = ["All", "Development", "Software", "CMS", "Design", "Marketing", "Infrastructure", "Support"];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-[#F0FDFA]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
            <Link href="/" className="hover:text-[#0D9488]">Home</Link>
            <ChevronRight size={14} />
            <span className="text-[#0D9488]">Services</span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Our{" "}
            <em
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
            >
              Services
            </em>
          </h1>
          <p className="text-[#64748B] text-lg max-w-2xl">
            End-to-end digital services crafted to help startups, SMBs, and enterprises build, 
            grow, and scale their digital presence.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map(({ icon: Icon, title, category, desc, benefits, techs }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#2DD4BF] hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#F0FDFA] flex items-center justify-center group-hover:bg-[#CCFBF1] transition-colors">
                      <Icon size={26} className="text-[#0D9488]" />
                    </div>
                    <span className="text-xs font-mono bg-[#F0FDFA] text-[#0D9488] px-3 py-1 rounded-full">
                      {category}
                    </span>
                  </div>

                  <h3
                    className="text-2xl font-bold text-[#0F172A] mb-3"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {title}
                  </h3>
                  <p className="text-[#64748B] text-sm leading-relaxed mb-5">{desc}</p>

                  {/* Benefits */}
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-3">
                      Key Benefits
                    </p>
                    <ul className="grid grid-cols-2 gap-1.5">
                      {benefits.map((b) => (
                        <li key={b} className="flex items-center gap-1.5 text-xs text-[#64748B]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {techs.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-mono bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] px-2.5 py-1 rounded-lg"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-lg transition-all"
                  >
                    Get a Quote
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#F0FDFA]">
        <div className="container mx-auto px-4 text-center">
          <h2
            className="text-4xl font-bold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Not sure which service fits your needs?
          </h2>
          <p className="text-[#64748B] text-lg mb-8">
            Book a free 30-minute consultation and we&apos;ll map out the perfect solution.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-xl transition-all text-lg"
          >
            Book Free Consultation
          </Link>
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
