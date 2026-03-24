import { XCircle, CheckCircle } from "lucide-react";

const problems = [
  "Slow, outdated website losing visitors",
  "Poor brand identity and visual consistency",
  "Low search engine visibility",
  "No mobile-friendly user experience",
  "Manual processes eating your time",
  "Low conversion rates and engagement",
];

const solutions = [
  "Lightning-fast, modern websites built to convert",
  "Cohesive brand systems that command authority",
  "Technical SEO and content strategies that rank",
  "Responsive, intuitive mobile-first designs",
  "Custom automation and workflow optimization",
  "Data-driven UX that maximizes conversions",
];

export default function ProblemSolutionSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Diagonal grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #0D9488 0, #0D9488 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 font-mono">
            The Problem & Solution
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Why Businesses Choose{" "}
            <em
              className="not-italic"
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
            >
              Prolx
            </em>
          </h2>
          <p className="text-[#64748B] text-lg max-w-xl mx-auto">
            We identify the exact bottlenecks holding your business back and deliver targeted digital solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Pain Points */}
          <div className="bg-[#FFF5F5] rounded-2xl p-8 border border-red-100">
            <h3
              className="text-xl font-bold text-[#0F172A] mb-6"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Common Pain Points
            </h3>
            <ul className="space-y-4">
              {problems.map((problem) => (
                <li key={problem} className="flex items-start gap-3">
                  <XCircle size={20} className="text-[#EF4444] mt-0.5 shrink-0" />
                  <span className="text-[#64748B] text-sm leading-relaxed">{problem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prolx Solutions */}
          <div className="bg-[#F0FDFA] rounded-2xl p-8 border border-[#CCFBF1]">
            <h3
              className="text-xl font-bold text-[#0F172A] mb-6"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Prolx Solutions
            </h3>
            <ul className="space-y-4">
              {solutions.map((solution) => (
                <li key={solution} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-[#0D9488] mt-0.5 shrink-0" />
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
