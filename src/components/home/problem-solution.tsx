import { XCircle, CheckCircle } from "lucide-react";

const problems = [
  "Outdated website that doesn't reflect your brand",
  "Low search engine visibility and organic traffic",
  "No mobile-friendly or fast-loading experience",
  "Struggling to convert visitors into customers",
  "Unclear or inconsistent brand identity",
  "No time to manage or update your site yourself",
];

const solutions = [
  "Modern, fast websites built to impress and convert",
  "SEO-optimized pages that help you get discovered",
  "Mobile-first designs that load fast on any device",
  "Clear user journeys designed to drive action",
  "Cohesive branding that builds recognition and trust",
  "Easy-to-manage or fully maintained by our team",
];

export default function ProblemSolutionSection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Subtle diagonal pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #0D9488 0, #0D9488 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 font-mono">
            The Problem &amp; Solution
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Sound Familiar?{" "}
            <em
              className="not-italic"
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
            >
              We Can Help.
            </em>
          </h2>
          <p className="text-[#64748B] text-base max-w-md mx-auto">
            We help startups and local businesses overcome these exact challenges with
            focused digital solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Pain Points */}
          <div className="bg-[#FFF5F5] rounded-2xl p-7 border border-red-100">
            <h3
              className="text-base font-bold text-[#0F172A] mb-5"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Common Challenges
            </h3>
            <ul className="space-y-3">
              {problems.map((problem) => (
                <li key={problem} className="flex items-start gap-3">
                  <XCircle size={17} className="text-[#EF4444] mt-0.5 shrink-0" />
                  <span className="text-[#64748B] text-sm leading-relaxed">{problem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prolx Solutions */}
          <div className="bg-[#F0FDFA] rounded-2xl p-7 border border-[#CCFBF1]">
            <h3
              className="text-base font-bold text-[#0F172A] mb-5"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              The Prolx Approach
            </h3>
            <ul className="space-y-3">
              {solutions.map((solution) => (
                <li key={solution} className="flex items-start gap-3">
                  <CheckCircle size={17} className="text-[#0D9488] mt-0.5 shrink-0" />
                  <span className="text-[#64748B] text-sm leading-relaxed">{solution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
