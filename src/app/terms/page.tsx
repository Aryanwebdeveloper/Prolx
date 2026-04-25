import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Prolx Digital Agency",
  description: "Read our terms of service and project engagement policies.",
};

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By accessing and using the Prolx Digital Agency website (prolx.digital) and our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our website or services.

These terms apply to all visitors, users, and others who access or use our services. We reserve the right to update or modify these terms at any time without prior notice.`,
  },
  {
    id: "services",
    title: "2. Services",
    content: `Prolx Digital Agency provides digital technology services including but not limited to: website development, custom web applications, mobile app development, UI/UX design, graphic design, branding, e-commerce development, SaaS development, SEO optimization, digital marketing, cloud solutions, and website maintenance.

All services are provided based on individual project agreements, proposals, or contracts. Specific deliverables, timelines, and pricing are outlined in the project-specific documentation provided to each client.`,
  },
  {
    id: "project-agreements",
    title: "3. Project Agreements & Scope",
    content: `Each project engagement will be governed by a separate project agreement or proposal that outlines:
• Scope of work and deliverables
• Timeline and milestones
• Pricing and payment schedule
• Revision policy and change request process
• Intellectual property transfer terms

Changes to the agreed scope of work may result in additional charges and timeline adjustments. All change requests must be submitted in writing and agreed upon by both parties before implementation.`,
  },
  {
    id: "payment",
    title: "4. Payment Terms",
    content: `Standard payment terms are as follows:
• Starter/Standard projects: 50% upfront, 50% upon completion
• Custom/Enterprise projects: 30% upfront, 40% at midpoint, 30% upon completion
• Monthly maintenance plans: Billed monthly in advance

All invoices are due within 14 days of issue. Late payments may incur a 2% monthly service charge. We reserve the right to suspend or terminate services for accounts with outstanding balances exceeding 30 days.

We accept payments via bank transfer, credit card, and PayPal. All prices are quoted in the currency specified in the project proposal (PKR or USD).`,
  },
  {
    id: "intellectual-property",
    title: "5. Intellectual Property",
    content: `Upon full and final payment, all custom-developed code, design files, and assets created specifically for your project are transferred to you. This includes source code, design files (Figma, PSD, etc.), and any custom graphics or illustrations.

The following are excluded from the IP transfer:
• Pre-existing frameworks, libraries, and tools used in development
• Open-source components (governed by their respective licenses)
• Prolx proprietary tools, methodologies, and internal systems
• Generic components or templates that may be reused across projects

We retain the right to showcase completed projects in our portfolio unless otherwise agreed in writing.`,
  },
  {
    id: "client-responsibilities",
    title: "6. Client Responsibilities",
    content: `Clients are responsible for:
• Providing accurate and complete project requirements
• Timely feedback on deliverables (within 5 business days unless otherwise agreed)
• Providing necessary content, assets, and access credentials
• Reviewing and approving work at each milestone
• Ensuring all provided content does not infringe on third-party rights

Delays caused by the client in providing required materials or feedback may result in project timeline extensions and are not the responsibility of Prolx.`,
  },
  {
    id: "warranties",
    title: "7. Warranties & Disclaimers",
    content: `We warrant that our services will be performed in a professional and workmanlike manner consistent with industry standards. We provide a 30-day warranty period after project launch during which we will fix any bugs or defects in our deliverables at no additional cost.

EXCEPT AS EXPRESSLY SET FORTH HEREIN, OUR SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. We do not guarantee specific results, rankings, or business outcomes from our services.`,
  },
  {
    id: "limitation-liability",
    title: "8. Limitation of Liability",
    content: `To the maximum extent permitted by law, Prolx Digital Agency shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising from or related to our services.

Our total liability for any claim arising from our services shall not exceed the total amount paid by the client for the specific project giving rise to such claim.`,
  },
  {
    id: "confidentiality",
    title: "9. Confidentiality",
    content: `Both parties agree to keep confidential all non-public information shared during the course of the engagement. This includes business strategies, technical specifications, pricing, and any proprietary information.

Confidentiality obligations survive the termination of the business relationship for a period of 2 years.`,
  },
  {
    id: "termination",
    title: "10. Termination",
    content: `Either party may terminate a project engagement with 14 days' written notice. Upon termination:
• Client pays for all work completed up to the termination date
• Prolx delivers all completed work and materials
• Any non-refundable deposits are retained
• Ongoing maintenance agreements terminate at the end of the current billing cycle

For cause termination (material breach): the non-breaching party may terminate immediately upon written notice if the breach is not cured within 7 days of notification.`,
  },
  {
    id: "governing-law",
    title: "11. Governing Law",
    content: `These Terms of Service shall be governed by and construed in accordance with the laws of Pakistan. Any disputes arising from or related to these terms shall be resolved through arbitration in Karachi, Pakistan, in accordance with the Arbitration Act, 1940.`,
  },
  {
    id: "contact",
    title: "12. Contact Information",
    content: `For any questions regarding these Terms of Service, please contact us at:

• Email: legal@prolx.digital
• Phone: +92 300 1234567
• Address: Prolx Digital Agency, Karachi, Pakistan`,
  },
];

export default function TermsPage() {
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
            <span className="text-[#0D9488]">Terms of Service</span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Terms of{" "}
            <em
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: "italic",
                color: "#0D9488",
              }}
            >
              Service
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
                  Welcome to Prolx Digital Agency. These Terms of Service
                  (&quot;Terms&quot;) govern your use of our website and
                  services. By engaging with Prolx, you agree to these terms.
                  Please read them carefully before using our services.
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
