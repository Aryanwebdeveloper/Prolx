"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, X } from "lucide-react";
import { generateFakeEnrollments, type FakeEnrollment } from "@/lib/marketing-stats";

/**
 * LiveEnrollmentToast
 * Shows a rotating popup in the bottom-left corner of the screen with
 * realistic-looking fake enrollment notifications for social proof.
 * Admin Dashboard does NOT render this component.
 */
export default function LiveEnrollmentToast() {
  const [enrollments, setEnrollments] = useState<FakeEnrollment[]>([]);
  const [current, setCurrent] = useState<FakeEnrollment | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Generate stable-per-day fake enrollments
    const fakeList = generateFakeEnrollments(10);
    setEnrollments(fakeList);

    // Wait 4 seconds before first popup
    const firstTimer = setTimeout(() => {
      setCurrent(fakeList[0]);
      setVisible(true);
    }, 4000);

    return () => clearTimeout(firstTimer);
  }, []);

  useEffect(() => {
    if (!visible || dismissed || enrollments.length === 0) return;

    // Hide after 5 seconds, then show next after 8 seconds
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    const nextTimer = setTimeout(() => {
      const nextIndex = (index + 1) % enrollments.length;
      setIndex(nextIndex);
      setCurrent(enrollments[nextIndex]);
      setVisible(true);
    }, 12000); // 5s visible + 7s gap

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [visible, index, enrollments, dismissed]);

  if (dismissed || !current) return null;

  // Gradient colours cycling through a few tones
  const gradients = [
    "from-[#0D9488] to-[#0891B2]",
    "from-[#7C3AED] to-[#A78BFA]",
    "from-[#F97316] to-[#FBBF24]",
    "from-[#EC4899] to-[#F472B6]",
    "from-[#10B981] to-[#34D399]",
  ];
  const grad = gradients[index % gradients.length];

  return (
    <div className="fixed bottom-6 left-6 z-[9999] pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: -60, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="pointer-events-auto bg-white border border-slate-200 shadow-2xl shadow-slate-200 rounded-2xl p-4 w-[300px] relative overflow-hidden"
          >
            {/* Accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${grad} rounded-t-2xl`} />

            {/* Dismiss button */}
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-3 right-3 text-slate-300 hover:text-slate-500 transition-colors"
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>

            <div className="flex items-center gap-3 pt-1">
              {/* Avatar */}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md`}>
                {current.avatar}
              </div>

              {/* Content */}
              <div className="min-w-0">
                <p className="text-xs text-[#64748B] font-medium leading-tight">
                  <span className="font-bold text-[#0F172A]">{current.name}</span>{" "}
                  from <span className="font-semibold text-[#0D9488]">{current.location}</span> enrolled in
                </p>
                <p className="text-xs font-bold text-[#0F172A] leading-tight mt-0.5 truncate">{current.course}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] text-[#64748B]">{current.time}</p>
                </div>
              </div>
            </div>

            {/* Live badge */}
            <div className="mt-3 flex items-center gap-1.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-lg px-3 py-1.5">
              <Users size={10} className="text-[#0D9488]" />
              <span className="text-[10px] font-bold text-[#0D9488]">Prolx Academy — Live Enrollment</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
