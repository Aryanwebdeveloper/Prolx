"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, User, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "../../supabase/client";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Academy", href: "/academy" },
  { label: "About", href: "/about" },
  { label: "Team", href: "/team" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
  { label: "Certificates", href: "/certificates" },
  { label: "Contact", href: "/contact" },
];

export default function ProlxNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${
          scrolled || mobileOpen
            ? "bg-white/95 backdrop-blur-xl border-b border-[#E2E8F0] shadow-sm"
            : "bg-white/80 backdrop-blur-md"
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#0D9488] via-[#0891B2] to-[#6366F1]" />

        <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{ scale: 1.04 }} transition={{ duration: 0.2 }}>
              <Image
                src="/ProLx_withoutBackground.png"
                alt="Prolx Logo"
                width={160}
                height={50}
                className="w-auto h-8"
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              >
                <Link
                  href={link.href}
                  className="text-[#475569] hover:text-[#0D9488] text-sm font-semibold transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-[#0D9488] to-[#0891B2] transition-all duration-300 group-hover:w-full rounded-full" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Desktop CTA */}
          <motion.div
            className="hidden md:flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-semibold text-[#0D9488] border border-[#CCFBF1] bg-[#F0FDFA] rounded-lg hover:bg-[#CCFBF1] transition-all flex items-center gap-2"
              >
                <User size={15} />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-semibold text-[#475569] hover:text-[#0D9488] transition-colors"
              >
                Sign In
              </Link>
            )}
            <Link
              href="/contact"
              className="glow-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0891B2] rounded-xl shadow-md shadow-teal-500/15 hover:shadow-lg hover:shadow-teal-500/25 transition-shadow"
            >
              Start a Project
              <ArrowRight size={14} />
            </Link>
          </motion.div>

          {/* Mobile hamburger */}
          <motion.button
            className="md:hidden p-2 text-[#475569] hover:text-[#0D9488] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu — Light */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden fixed inset-0 top-[64px] z-[50] flex flex-col px-6 py-8 gap-4 overflow-y-auto bg-white border-t border-[#E2E8F0]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl font-bold text-[#0F172A] hover:text-[#0D9488] transition-colors block py-1"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3 mt-4 pt-4 border-t border-[#E2E8F0]"
            >
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("show-pwa-install"));
                  setMobileOpen(false);
                }}
                className="px-6 py-3 text-center font-semibold text-[#0D9488] border border-[#CCFBF1] bg-[#F0FDFA] rounded-xl hover:bg-[#CCFBF1] transition-all"
              >
                Install Mobile App
              </button>
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="px-6 py-3 text-center font-semibold text-[#0D9488] border border-[#CCFBF1] bg-[#F0FDFA] rounded-xl hover:bg-[#CCFBF1] transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="px-6 py-3 text-center font-semibold text-[#475569] border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-all"
                >
                  Sign In
                </Link>
              )}
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="px-6 py-3 text-center font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0891B2] rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-teal-500/15"
              >
                Start a Project
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
