const industries = [
  "🏥 Healthcare",
  "💳 Fintech",
  "🛒 E-commerce",
  "📚 Education",
  "🏠 Real Estate",
  "⚡ SaaS",
  "🚛 Logistics",
  "🏨 Hospitality",
  "🏭 Manufacturing",
  "🎮 Entertainment",
  "🌿 Non-Profit",
  "🔬 BioTech",
];

const techs = [
  "React", "Next.js", "TypeScript", "Node.js", "Flutter", "React Native",
  "Supabase", "PostgreSQL", "Figma", "AWS", "Docker", "GraphQL",
  "Tailwind CSS", "Python", "FastAPI", "Redis",
];

export default function IndustriesTechSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Industries */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 font-mono">
            Industries
          </div>
          <h2
            className="text-4xl font-bold text-[#0F172A] mb-4"
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

        <div className="flex flex-wrap justify-center gap-3 mb-20">
          {industries.map((ind) => (
            <span
              key={ind}
              className="px-5 py-2.5 bg-[#F0FDFA] border border-[#CCFBF1] text-[#0F172A] text-sm font-medium rounded-full hover:bg-[#CCFBF1] hover:border-[#14B8A6] transition-colors cursor-default"
            >
              {ind}
            </span>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 font-mono">
            Tech Stack
          </div>
          <h2
            className="text-4xl font-bold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Our Technology{" "}
            <em
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
            >
              Arsenal
            </em>
          </h2>
        </div>

        <div className="overflow-hidden relative">
          <div className="flex gap-4 animate-marquee w-max">
            {[...techs, ...techs].map((tech, i) => (
              <div
                key={i}
                className="px-5 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-mono text-[#64748B] hover:bg-[#CCFBF1] hover:text-[#0D9488] hover:border-[#14B8A6] transition-all cursor-default whitespace-nowrap"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
