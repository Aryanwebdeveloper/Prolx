import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Prolx Digital Agency",
  description: "Learn how we collect, use, and safeguard your information at Prolx Digital Agency.",
};

const sections = [
  {
    id: "info-collect",
    title: "1. Information We Collect",
    content: `We collect information you provide directly to us, including when you fill out a contact form, subscribe to our newsletter, request a consultation, or apply for a position. This may include your name, email address, phone number, company name, project details, and any other information you choose to provide.

We also automatically collect certain technical information when you visit our website, such as your IP address, browser type, device information, pages visited, and time spent on our site. This data is collected through cookies and similar technologies.`,
  },
  {
    id: "info-use",
    title: "2. How We Use Your Information",
    content: `We use the information we collect to:
• Respond to your inquiries and fulfill your requests
• Provide project estimates and proposals
• Send you marketing communications (with your consent)
• Improve our website and services
• Analyze website usage and trends
• Comply with legal obligations
• Protect against fraudulent or unauthorized activity

We will not sell, rent, or share your personal information with third parties for their marketing purposes without your explicit consent.`,
  },
  {
    id: "cookies",
    title: "3. Cookies & Tracking Technologies",
    content: `Our website uses cookies and similar tracking technologies to enhance your browsing experience. These include:

• Essential Cookies: Required for the website to function properly.
• Analytics Cookies: Help us understand how visitors interact with our website (e.g., Google Analytics).
• Marketing Cookies: Used to deliver relevant advertisements (only if you opt in).

You can control cookie preferences through your browser settings. Disabling certain cookies may affect your experience on our website.`,
  },
  {
    id: "data-security",
    title: "4. Data Security",
    content: `We implement industry-standard security measures to protect your personal information, including encryption (SSL/TLS), secure data storage, access controls, and regular security audits. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    id: "third-party",
    title: "5. Third-Party Services",
    content: `Our website may contain links to third-party websites or services that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.

We use the following third-party services:
• Google Analytics (website analytics)
• Supabase (backend services and database)
• Vercel (hosting and deployment)
• Google Fonts (typography)`,
  },
  {
    id: "data-retention",
    title: "6. Data Retention",
    content: `We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Contact form submissions are retained for up to 2 years. Newsletter subscription data is kept until you unsubscribe. Job applications are retained for 1 year after the position is filled.`,
  },
  {
    id: "your-rights",
    title: "7. Your Rights",
    content: `Depending on your location, you may have the right to:
• Access the personal information we hold about you
• Request correction of inaccurate data
• Request deletion of your personal information
• Object to processing of your personal information
• Request data portability
• Withdraw consent at any time

To exercise any of these rights, please contact us at privacy@prolx.digital.`,
  },
  {
    id: "children",
    title: "8. Children's Privacy",
    content: `Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to remove that information.`,
  },
  {
    id: "changes",
    title: "9. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically for any changes.`,
  },
  {
    id: "contact",
    title: "10. Contact Us",
    content: `If you have any questions about this Privacy Policy, please contact us at:

• Email: privacy@prolx.digital
• Phone: +92 300 1234567
• Address: Prolx Digital Agency, Karachi, Pakistan`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      {/* Hero */}
      <section className="pt-28 pb-12 bg-[#F0FDFA]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
            <Link href="/" className="hover:text-[#0D9488]">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="text-[#0D9488]">Privacy Policy</span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Privacy{" "}
            <em
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: "italic",
                color: "#0D9488",
              }}
            >
              Policy
            </em>
          </h1>
          <p className="text-[#64748B] text-sm">
            Last updated: <strong>December 15, 2024</strong>
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-10">
            {/* Table of Contents */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <h3
                  className="text-sm font-bold text-[#0F172A] mb-4 uppercase tracking-wider"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Contents
                </h3>
                <nav className="space-y-2">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="block text-sm text-[#64748B] hover:text-[#0D9488] transition-colors leading-relaxed"
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-12">
              <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-2xl p-6">
                <p className="text-sm text-[#64748B] leading-relaxed">
                  At Prolx Digital Agency, we take your privacy seriously. This
                  Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you visit our website or use
                  our services. Please read this policy carefully.
                </p>
              </div>

              {sections.map((s) => (
                <div key={s.id} id={s.id} className="scroll-mt-24">
                  <h2
                    className="text-2xl font-bold text-[#0F172A] mb-4"
                    style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                    }}
                  >
                    {s.title}
                  </h2>
                  <div className="text-[#64748B] text-sm leading-relaxed whitespace-pre-line">
                    {s.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
