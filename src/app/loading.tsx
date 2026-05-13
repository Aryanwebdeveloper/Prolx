"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-[#0D9488]/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-[#0D9488] font-bold animate-pulse text-sm uppercase tracking-widest">
          Loading...
        </p>
      </div>
    </div>
  );
}
