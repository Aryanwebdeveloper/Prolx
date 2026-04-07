const techs = [
  "React", "Next.js", "TypeScript", "Node.js", "React Native",
  "Supabase", "PostgreSQL", "Figma", "Tailwind CSS", "Shopify", "Docker", "Python",
];

const industries = [
  "🛒 E-commerce", "⚡ SaaS & Startups", "📚 Education", "🏠 Real Estate",
  "🏥 Healthcare", "💳 Fintech", "🌿 Non-Profit", "🏨 Hospitality",
];

export default function IndustriesTechSection() {
  return (
    <section className="py-16 bg-white border-t border-[#E2E8F0]">
      <div className="container mx-auto px-4">

        {/* Tech Stack */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 font-mono">
            Tech Stack
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold text-[#0F172A]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Built With{" "}
            <em
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
            >
              Modern Tools
            </em>
          </h2>
        </div>

        <div className="overflow-hidden relative mb-14">
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="flex gap-4 animate-marquee w-max">
            {[...techs, ...techs].map((tech, i) => (
              <div
                key={i}
                className="px-5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-mono text-[#64748B] hover:bg-[#CCFBF1] hover:text-[#0D9488] hover:border-[#14B8A6] transition-all cursor-default whitespace-nowrap"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>

        {/* Industries */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 font-mono">
            Industries
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold text-[#0F172A]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Industries We{" "}
            <em
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
            >
              Serve
            </em>
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {industries.map((ind) => (
            <span
              key={ind}
              className="px-4 py-2 bg-[#F0FDFA] border border-[#CCFBF1] text-[#0F172A] text-sm font-medium rounded-full hover:bg-[#CCFBF1] hover:border-[#14B8A6] transition-colors cursor-default"
            >
              {ind}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
