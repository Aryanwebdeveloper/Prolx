"use client";

import { useEffect, useRef, useState } from "react";

const logos = [
  "Google", "Microsoft", "Amazon", "Shopify", "Stripe",
  "HubSpot", "Salesforce", "Adobe", "Slack", "Atlassian",
];

const stats = [
  { num: 250, suffix: "+", label: "Projects Completed" },
  { num: 98, suffix: "%", label: "Client Satisfaction" },
  { num: 7, suffix: "+", label: "Years of Experience" },
  { num: 20, suffix: "+", label: "Countries Served" },
];

function CountUp({ end, suffix }: { end: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = end / 50;
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 30);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {count}
      {suffix}
    </span>
  );
}

export default function TrustBar() {
  return (
    <section className="py-16 bg-white border-y border-[#E2E8F0]">
      <div className="container mx-auto px-4">
        {/* Logo Marquee */}
        <p className="text-center text-sm text-[#64748B] font-medium mb-8 uppercase tracking-wider">
          Trusted by leading companies
        </p>
        <div className="overflow-hidden relative mb-12">
          <div className="flex gap-12 animate-marquee w-max">
            {[...logos, ...logos].map((logo, i) => (
              <div
                key={i}
                className="text-[#CBD5E1] hover:text-[#0D9488] transition-colors font-bold text-lg whitespace-nowrap cursor-default select-none"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                {logo}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ num, suffix, label }) => (
            <div key={label}>
              <div className="text-4xl font-bold text-[#0F172A] mb-1">
                <CountUp end={num} suffix={suffix} />
              </div>
              <div className="text-sm text-[#64748B]">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
