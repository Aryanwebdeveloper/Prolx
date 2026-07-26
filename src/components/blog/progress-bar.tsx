"use client";

import { useEffect, useState } from "react";

export default function ReadingProgressBar() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setWidth((window.scrollY / docHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] z-[70] transition-all duration-75"
      style={{ width: `${width}%` }}
    />
  );
}
