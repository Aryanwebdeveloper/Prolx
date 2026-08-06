"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Clock, MessageSquare, ArrowRight, CheckCircle2, ShieldCheck,
  Smartphone, Zap, ChevronDown, Send, X, Layers, Star, PhoneCall,
  Check, Gift, Compass, ExternalLink, HelpCircle, MapPin, Award, UserCheck, Flame, Menu
} from "lucide-react";
import { DealCampaign, DealPackage, submitDealLead, recordCampaignAnalytics } from "@/app/deals-actions";
import ProlxFooter from "@/components/prolx-footer";

interface DealsLandingClientProps {
  campaign: DealCampaign;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
  };
}

const CATEGORIES = [
  { id: "all", label: "All Packages", icon: Sparkles },
  { id: "business", label: "Business Website", icon: Layers },
  { id: "ecommerce", label: "E-Commerce", icon: Flame },
  { id: "restaurant", label: "Restaurant & Café", icon: Compass },
  { id: "boutique", label: "Boutique & Fashion", icon: Gift },
  { id: "salon", label: "Salon & Beauty", icon: Star },
  { id: "realestate", label: "Real Estate", icon: MapPin },
];

const PROLX_WHATSAPP_NUMBER = "+923300356046";

export default function DealsLandingClient({ campaign, utmParams }: DealsLandingClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPackageForModal, setSelectedPackageForModal] = useState<DealPackage | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [showStickyMobile, setShowStickyMobile] = useState(false);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [formState, setFormState] = useState({
    name: "",
    whatsapp_number: "",
    email: "",
    business_type: "Restaurant / Café",
    website_type: "Business Website",
    preferred_package: "",
    message: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState("restaurant");

  useEffect(() => {
    recordCampaignAnalytics({
      campaign_id: campaign.id,
      event_type: "page_view",
      utm_source: utmParams?.source,
      utm_medium: utmParams?.medium,
      utm_campaign: utmParams?.campaign,
    });

    const handleScroll = () => {
      setShowStickyMobile(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [campaign.id, utmParams]);

  useEffect(() => {
    const targetDate = new Date(campaign.countdown_end_date || "2026-08-15T00:00:00.000Z").getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = Math.max(0, targetDate - now);
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [campaign.countdown_end_date]);

  const getWhatsAppLink = (pkgName?: string, price?: number) => {
    let msg = `Assalam-o-Alaikum Prolx Team! 🇵🇰\nI am interested in your *14 August Azadi Special Deal*`;
    if (pkgName && price) {
      msg += ` for *${pkgName}* (PKR ${price.toLocaleString()}).`;
    } else {
      msg += `. Please share details and available slots!`;
    }
    if (utmParams?.source) msg += `\n(Source: ${utmParams.source})`;
    return `https://wa.me/${PROLX_WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  const handlePackageClick = (pkg: DealPackage, action: "claim" | "whatsapp" | "demo") => {
    recordCampaignAnalytics({
      campaign_id: campaign.id,
      event_type: action === "whatsapp" ? "whatsapp_click" : "cta_click",
      selected_package: pkg.name,
      utm_source: utmParams?.source,
    });
    if (action === "whatsapp") {
      window.open(getWhatsAppLink(pkg.name, pkg.deal_price_pkr), "_blank");
    } else {
      setSelectedPackageForModal(pkg);
      setFormState((prev) => ({ ...prev, preferred_package: pkg.name, website_type: pkg.category_name }));
      setIsDemoModalOpen(true);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.whatsapp_number) return;
    setFormSubmitting(true);
    try {
      await submitDealLead({
        campaign_id: campaign.id,
        campaign_name: campaign.title,
        package_id: selectedPackageForModal?.id,
        package_name: formState.preferred_package || selectedPackageForModal?.name || "14 August Deal",
        deal_price: selectedPackageForModal ? `PKR ${selectedPackageForModal.deal_price_pkr.toLocaleString()}` : "PKR 9,999+",
        name: formState.name,
        whatsapp_number: formState.whatsapp_number,
        email: formState.email,
        business_type: formState.business_type,
        website_type: formState.website_type,
        message: formState.message,
        utm_source: utmParams?.source,
        utm_medium: utmParams?.medium,
        utm_campaign: utmParams?.campaign,
        utm_content: utmParams?.content,
        source_type: "demo_booking",
      });
      setFormSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredPackages = selectedCategory === "all"
    ? campaign.packages
    : campaign.packages.filter((p) => p.category_id === selectedCategory);

  const openDemoModal = () => {
    setSelectedPackageForModal(null);
    setIsDemoModalOpen(true);
  };

  const slotsUsedPct = ((campaign.total_slots - campaign.available_slots) / campaign.total_slots) * 100;

  return (
    <div className="min-h-screen bg-[#07130E] text-slate-100 font-sans selection:bg-[#10B981] selection:text-black overflow-x-hidden">

      {/* ── ANNOUNCEMENT BAR ── */}
      <div className="bg-gradient-to-r from-[#004B23] via-[#007236] to-[#004B23] border-b border-[#10B981]/30 sticky top-0 z-[70]">
        <div className="flex items-center justify-between px-3 py-1.5 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="shrink-0">🇵🇰</span>
            <span className="bg-white/20 text-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0">AZADI DEAL</span>
            <span className="text-white text-[11px] font-semibold truncate hidden xs:inline">Up to 50% OFF — Limited Slots!</span>
          </div>
          {/* Compact Countdown */}
          <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-full border border-emerald-400/30 shrink-0">
            <Clock size={11} className="text-[#10B981]" />
            <span className="font-mono font-bold text-emerald-300 text-[11px]">
              {String(timeLeft.days).padStart(2,"0")}d
              :{String(timeLeft.hours).padStart(2,"0")}h
              :{String(timeLeft.minutes).padStart(2,"0")}m
              :<span className="text-amber-400">{String(timeLeft.seconds).padStart(2,"0")}s</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── NAVBAR ── */}
      <nav className="bg-[#0B1E16]/95 backdrop-blur-md border-b border-[#10B981]/20 sticky top-[33px] z-[60]">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#006633] to-[#10B981] flex items-center justify-center shadow-lg shadow-emerald-900/50 shrink-0">
              <span className="text-white font-extrabold font-mono text-sm">Px</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-white text-base tracking-tight">Prolx <span className="text-[#10B981]">Digital</span></span>
              <span className="text-[9px] text-emerald-400/80 tracking-widest uppercase font-semibold">Pakistan Campaign</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-[#25D366] hover:bg-[#1EBE57] rounded-xl shadow-md transition-all"
            >
              <MessageSquare size={13} />
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="inline sm:hidden">Chat</span>
            </a>
            <button
              onClick={openDemoModal}
              className="px-3 py-1.5 text-[11px] font-bold text-[#10B981] border border-[#10B981]/40 hover:bg-[#10B981]/10 rounded-xl transition-all hidden sm:block"
            >
              Free Demo
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-8 pb-12 overflow-hidden bg-gradient-to-b from-[#0B1E16] via-[#07130E] to-[#07130E]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-emerald-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#006633]/15 rounded-full blur-[80px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            {/* Badges */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#006633]/60 text-emerald-300 border border-[#10B981]/40">
                <span>🇵🇰</span> 14 AUGUST AZADI OFFER
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Flame size={11} className="text-amber-400 animate-bounce" /> ONLY {campaign.available_slots} SLOTS LEFT
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[26px] sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
              IS AZADI PAR, APNE BUSINESS KO{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                ONLINE AZADI DO!
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Professional websites for Pakistani businesses starting from just{" "}
              <span className="text-emerald-400 font-extrabold underline decoration-amber-400 underline-offset-4">PKR 9,999</span>!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <a
                href="#packages"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-extrabold text-black bg-gradient-to-r from-[#10B981] via-emerald-300 to-[#10B981] hover:brightness-110 rounded-xl shadow-xl shadow-emerald-900/40 transition-all"
              >
                🔥 Claim My Deal <ArrowRight size={16} />
              </a>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-[#25D366] hover:bg-[#1EBE57] rounded-xl shadow-xl shadow-green-950/50 transition-all"
              >
                <MessageSquare size={16} /> 💬 WhatsApp Us
              </a>
            </div>

            <button onClick={openDemoModal} className="text-xs text-slate-400 hover:text-emerald-400 underline decoration-dotted transition-colors">
              Not ready? Request a FREE Demo / Consultation →
            </button>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-emerald-900/40 grid grid-cols-2 gap-3">
              {[
                { icon: Smartphone, title: "100% Mobile Ready", desc: "Designed for Pakistani mobile users" },
                { icon: Zap, title: "Fast Delivery", desc: "3-5 days delivery guarantee" },
                { icon: MessageSquare, title: "WhatsApp Direct", desc: "Leads direct to your phone" },
                { icon: ShieldCheck, title: "No Hidden Fees", desc: "Transparent pricing always" },
              ].map((item, idx) => (
                <div key={idx} className="bg-[#0D261C]/60 border border-[#10B981]/20 p-3 rounded-xl flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                    <item.icon size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY FILTER BAR (Sticky below nav) ── */}
      <section className="py-3 bg-[#091912]/95 backdrop-blur-sm border-y border-[#10B981]/20 sticky top-[47px] z-50 shadow-lg">
        <div className="px-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ WebkitOverflowScrolling: "touch" }}>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? "bg-gradient-to-r from-[#006633] to-[#10B981] text-white shadow-md"
                      : "bg-[#0F2D20]/80 text-slate-300 hover:bg-[#153D2C] border border-emerald-900/30"
                  }`}
                >
                  <Icon size={12} className={isActive ? "text-white" : "text-emerald-400"} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PACKAGES GRID ── */}
      <section id="packages" className="py-12 container mx-auto px-4">
        <div className="text-center space-y-2 mb-8">
          <span className="text-[11px] font-extrabold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            CHOOSE YOUR AZADI DEAL
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Limited-Time Special Packages
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Crossed-out prices show standard rates vs. our 14 August discount.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPackages.map((pkg) => {
            const savingsPct = Math.round((pkg.savings_pkr / pkg.regular_price_pkr) * 100);
            return (
              <motion.div
                key={pkg.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`relative rounded-2xl flex flex-col transition-all ${
                  pkg.is_popular
                    ? "bg-gradient-to-b from-[#0F3323] via-[#0C291D] to-[#07130E] border-2 border-[#10B981] shadow-2xl shadow-emerald-900/50"
                    : "bg-[#0D251B]/80 border border-emerald-900/40 hover:border-emerald-500/50 shadow-xl"
                }`}
              >
                {pkg.badge_text && (
                  <div className="absolute -top-3 left-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-md">
                    {pkg.badge_text}
                  </div>
                )}

                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  {/* Header */}
                  <div className="pt-1">
                    <span className="text-[10px] font-semibold text-emerald-400/90 uppercase tracking-wider">{pkg.category_name}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{pkg.name}</h3>
                  </div>

                  {/* Pricing */}
                  <div className="my-4 p-3 rounded-xl bg-black/40 border border-emerald-900/40 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Regular:</span>
                      <span className="line-through text-slate-500 font-semibold">PKR {pkg.regular_price_pkr.toLocaleString()}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-emerald-400">Azadi Deal:</span>
                      <span className="text-xl font-black text-white">PKR {pkg.deal_price_pkr.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-emerald-900/30 text-[10px]">
                      <span className="bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded">
                        SAVE {savingsPct}% OFF
                      </span>
                      <span className="text-slate-400">{pkg.delivery_estimate}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed mb-4">{pkg.description}</p>

                  {/* Features */}
                  <div className="space-y-1.5 mb-5 flex-1">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">What's Included:</p>
                    {pkg.features.slice(0, 6).map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-slate-200">
                        <CheckCircle2 size={13} className="text-[#10B981] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                    {pkg.features.length > 6 && (
                      <p className="text-[10px] text-emerald-400/70 pl-5">+{pkg.features.length - 6} more features...</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-3 border-t border-emerald-900/40">
                    <button
                      onClick={() => handlePackageClick(pkg, "claim")}
                      className={`w-full py-3 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
                        pkg.is_popular
                          ? "bg-gradient-to-r from-[#10B981] to-emerald-400 text-black hover:brightness-110 shadow-lg"
                          : "bg-[#10B981]/20 hover:bg-[#10B981]/30 text-emerald-300 border border-[#10B981]/40"
                      }`}
                    >
                      🔥 Claim This Deal <ArrowRight size={14} />
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handlePackageClick(pkg, "whatsapp")}
                        className="py-2.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-green-300 border border-[#25D366]/40 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <MessageSquare size={12} /> WhatsApp
                      </button>
                      <button
                        onClick={() => handlePackageClick(pkg, "demo")}
                        className="py-2.5 bg-black/40 hover:bg-black/60 text-slate-300 border border-slate-700 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1 transition-all"
                      >
                        Free Demo
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── WHICH WEBSITE FOR YOUR BUSINESS? ── */}
      <section className="py-10 bg-[#091B13] border-y border-emerald-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-2 mb-8">
            <span className="text-[11px] font-extrabold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              INDUSTRY MATCH
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
              Which Website Is Right For You?
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { title: "Restaurant & Café", desc: "Digital Menu + WhatsApp Ordering + Maps", targetCat: "restaurant", icon: "🍔" },
              { title: "Boutique & Fashion", desc: "Product Catalog + Lookbook + WhatsApp", targetCat: "boutique", icon: "👗" },
              { title: "Salon & Beauty", desc: "Services Menu + Booking + Gallery", targetCat: "salon", icon: "✂️" },
              { title: "Real Estate", desc: "Property Listings + Filters + WhatsApp", targetCat: "realestate", icon: "🏢" },
              { title: "E-Commerce Store", desc: "Products + Cart + Cash on Delivery", targetCat: "ecommerce", icon: "🛒" },
              { title: "Corporate Business", desc: "Showcase + Lead Forms + SEO", targetCat: "business", icon: "💼" },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedCategory(item.targetCat);
                  const el = document.getElementById("packages");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-[#0D271D] border border-emerald-900/40 hover:border-emerald-500/60 p-4 rounded-2xl cursor-pointer transition-all hover:bg-[#103024] group"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                <p className="text-[10px] sm:text-xs text-slate-300 mt-1 leading-relaxed">{item.desc}</p>
                <div className="mt-3 text-[10px] font-bold text-emerald-400 group-hover:underline">View Deal →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VISUAL SHOWCASE ── */}
      <section className="py-12 container mx-auto px-4">
        <div className="text-center space-y-2 mb-7">
          <span className="text-[11px] font-extrabold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            PREVIEW SHOWCASE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
            See What Your Business Could Look Like
          </h2>
        </div>

        {/* Showcase Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none" style={{ WebkitOverflowScrolling: "touch" }}>
          {[
            { id: "restaurant", label: "🍔 Restaurant" },
            { id: "fashion", label: "👗 Fashion" },
            { id: "business", label: "💼 Corporate" },
            { id: "realestate", label: "🏢 Real Estate" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveShowcaseTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap shrink-0 ${
                activeShowcaseTab === tab.id
                  ? "bg-[#10B981] text-black shadow-lg"
                  : "bg-[#0D251B] text-slate-300 hover:text-white border border-emerald-900/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Preview Frame */}
        <div className="bg-[#0C241B] rounded-2xl border-2 border-emerald-900/60 p-3 sm:p-5 shadow-2xl overflow-hidden">
          {/* Mock Browser Header */}
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-emerald-900/40">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex-1 bg-black/40 px-3 py-1 rounded-full border border-emerald-900/40 text-[10px] text-emerald-400 font-mono truncate">
              https://demo.prolx.cloud/{activeShowcaseTab}-preview
            </div>
          </div>

          <div className="min-h-[280px] rounded-xl bg-gradient-to-br from-[#06140E] to-[#0A2218] p-4 sm:p-6 border border-emerald-900/40 flex flex-col justify-between gap-4">
            {activeShowcaseTab === "restaurant" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                  <span className="font-extrabold text-base text-emerald-400">Lahore Spice Grill 🍔</span>
                  <span className="bg-[#25D366] text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full">WhatsApp Order</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { name: "Mutton Karahi Deal", desc: "Mutton Karahi, Garlic Naan & Drink", price: "PKR 1,850" },
                    { name: "Family Fast Food Combo", desc: "Zinger Burgers + Fries + Drinks", price: "PKR 2,400" },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#0D2A1F] p-3 rounded-xl border border-emerald-900/40">
                      <div className="font-bold text-white text-xs">{item.name}</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-emerald-400 text-xs">{item.price}</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">Order</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeShowcaseTab === "fashion" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                  <span className="font-extrabold text-base text-amber-300">Silk & Velvet Apparel 👗</span>
                  <span className="bg-amber-400 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full">Azadi Collection</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Embroidered 3-Piece", "Pret Kurti", "Bridal Velvet"].map((item, i) => (
                    <div key={i} className="bg-[#0D2A1F] p-2.5 rounded-xl border border-emerald-900/40 text-center">
                      <div className="h-14 bg-emerald-950/60 rounded-lg flex items-center justify-center text-[10px] text-slate-400 mb-1.5">📷 Photo</div>
                      <div className="text-[10px] font-bold text-white">{item}</div>
                      <div className="text-[10px] text-emerald-400 font-bold">PKR 4,999</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeShowcaseTab === "business" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                  <span className="font-extrabold text-base text-white">Apex Logistics 💼</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Verified</span>
                </div>
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-slate-200">B2B Services + Instant Quote Form</div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    {["Fast Speed", "Lead Forms", "SEO Ready"].map((f, i) => (
                      <div key={i} className="p-2.5 bg-[#0D2A1F] rounded-xl border border-emerald-900/30 text-emerald-300 font-bold">{f}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === "realestate" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                  <span className="font-extrabold text-base text-[#10B981]">Zam Zam Real Estate 🏢</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">DHA Listings</span>
                </div>
                <div className="bg-[#0D2A1F] p-3 rounded-xl border border-emerald-900/40">
                  <div className="font-bold text-white text-xs">10 Marla Modern Villa</div>
                  <div className="text-[10px] text-slate-300 mt-0.5">DHA Phase 6, Lahore | 5 Beds | Pool</div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-black text-amber-300 text-sm">PKR 4.25 Crore</span>
                    <button className="px-3 py-1 bg-[#25D366] text-black text-[10px] font-bold rounded-lg">WhatsApp Agent</button>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-emerald-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">Want a website like this for your business?</span>
              <button
                onClick={openDemoModal}
                className="px-4 py-2 bg-[#10B981] hover:bg-emerald-400 text-black text-[11px] font-bold rounded-xl transition-all whitespace-nowrap"
              >
                Request Similar Website →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY PROLX TRUST SECTION ── */}
      <section className="py-10 bg-[#081B13] border-y border-emerald-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-2 mb-7">
            <span className="text-[11px] font-extrabold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              WHY CHOOSE PROLX?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
              Built for Pakistani Businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              { title: "WhatsApp-First Conversion", desc: "Pakistani customers love WhatsApp. Every website includes seamless direct WhatsApp lead routing." },
              { title: "100% Mobile Optimized", desc: "Over 85% of Pakistan traffic is mobile. Fast loading on 3G, 4G, and Wi-Fi." },
              { title: "Transparent Pakistani Pricing", desc: "No hidden fees. JazzCash, EasyPaisa, and bank transfer supported." },
              { title: "Post-Launch Support", desc: "Our team provides training and technical assistance after launch." },
            ].map((point, idx) => (
              <div key={idx} className="bg-[#0C271C] p-4 rounded-2xl border border-emerald-900/40 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-sm">✓</div>
                <div>
                  <h3 className="text-sm font-bold text-white">{point.title}</h3>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{point.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-12 container mx-auto px-4 text-center space-y-8">
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            SIMPLE 4-STEP PROCESS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">How To Get Started</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Choose Your Deal", desc: "Pick your Azadi website package." },
            { step: "02", title: "Contact Prolx", desc: "WhatsApp us or submit the demo form." },
            { step: "03", title: "Share Requirements", desc: "Send your business details & logo." },
            { step: "04", title: "Launch & Grow", desc: "We build and launch your website!" },
          ].map((item, idx) => (
            <div key={idx} className="bg-[#0C271C] border border-emerald-900/40 p-4 rounded-2xl space-y-2">
              <span className="text-2xl font-black text-emerald-500/30 font-mono">{item.step}</span>
              <h3 className="text-xs sm:text-sm font-bold text-white">{item.title}</h3>
              <p className="text-[10px] sm:text-xs text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="inline-block bg-emerald-500/10 border border-emerald-500/30 px-5 py-2 rounded-full text-[11px] font-extrabold text-emerald-300">
          ⚡ FREE DEMO → NO OBLIGATION TO BUY
        </div>
      </section>

      {/* ── URGENCY SECTION ── */}
      <section className="py-10 bg-gradient-to-r from-[#003B1C] via-[#005C2B] to-[#003B1C] border-y border-emerald-400/30">
        <div className="container mx-auto px-4 text-center max-w-2xl space-y-5">
          <span className="bg-amber-400 text-black text-[11px] font-black px-4 py-1.5 rounded-full tracking-wider uppercase animate-pulse">
            LIMITED AVAILABILITY
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            14 AUGUST SPECIAL — LIMITED SLOTS!
          </h2>
          <p className="text-emerald-100 text-sm leading-relaxed">
            Only <span className="font-extrabold underline">{campaign.total_slots} projects</span> under this deal to ensure 3-5 day delivery for every client.
          </p>

          {/* Slots Progress */}
          <div className="bg-black/40 p-4 rounded-2xl border border-emerald-300/30 space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-white">Slots Remaining:</span>
              <span className="text-amber-300">{campaign.available_slots} / {campaign.total_slots}</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${slotsUsedPct}%` }}
              />
            </div>
          </div>

          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#25D366] hover:bg-[#1EBE57] text-white font-extrabold rounded-xl shadow-xl transition-all"
          >
            <MessageSquare size={18} /> Reserve My Slot on WhatsApp
          </a>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="py-12 container mx-auto px-4 max-w-2xl">
        <div className="text-center space-y-2 mb-8">
          <span className="text-[11px] font-extrabold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            FAQS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">Questions Business Owners Ask</h2>
        </div>

        <div className="space-y-3">
          {[
            { q: "What's included in the PKR 9,999 deal?", a: "A complete mobile-responsive business website, WhatsApp chat, contact form, Google Maps, social media links, speed optimization, and basic security — no hidden charges!" },
            { q: "Is the price final with no hidden charges?", a: "Yes! All prices are final for the specified features. 100% transparent pricing for Pakistani clients." },
            { q: "How long does development take?", a: "Starter websites are completed in 3–5 business days once you provide your business details, photos, and logo." },
            { q: "Can I request online payment integration?", a: "Yes! Our E-Commerce deals include JazzCash, EasyPaisa, and card payment gateways with full shopping cart." },
            { q: "Can I see a demo before paying?", a: "Absolutely! Click 'Book a FREE Demo' to review demo layouts for your business category — no payment needed." },
            { q: "What payment methods do you accept?", a: "JazzCash, EasyPaisa, Direct Bank Transfer (Meezan, HBL, UBL, Alfalah), and international transfers." },
          ].map((item, idx) => (
            <div key={idx} className="bg-[#0C271C] border border-emerald-900/40 rounded-2xl overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 font-bold text-white text-sm hover:text-emerald-400"
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-emerald-400 shrink-0 transition-transform duration-200 ${activeFaq === idx ? "rotate-180" : ""}`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-emerald-900/20 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-12 bg-gradient-to-b from-[#07130E] via-[#0B2319] to-[#07130E] border-t border-emerald-900/30 text-center">
        <div className="container mx-auto px-4 max-w-2xl space-y-5">
          <span className="text-3xl">🇵🇰</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            YOUR BUSINESS DESERVES AN ONLINE PRESENCE
          </h2>
          <p className="text-slate-300 text-sm max-w-md mx-auto">
            Claim the 14 August Azadi Special Deal before it ends!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="#packages"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#10B981] hover:bg-emerald-400 text-black font-extrabold rounded-xl shadow-xl transition-all text-center"
            >
              🔥 Claim My Deal Now
            </a>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#25D366] hover:bg-[#1EBE57] text-white font-extrabold rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} /> WhatsApp Prolx
            </a>
            <button
              onClick={openDemoModal}
              className="w-full sm:w-auto px-7 py-3.5 bg-black/40 hover:bg-black/60 text-slate-200 border border-slate-700 font-bold rounded-xl transition-all"
            >
              Book Free Demo
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <ProlxFooter />

      {/* ── FLOATING WHATSAPP BUTTON ── */}
      <a
        href={getWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-6 z-50 bg-[#25D366] hover:bg-[#1EBE57] text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
        aria-label="WhatsApp Prolx"
      >
        <MessageSquare size={22} />
      </a>

      {/* ── STICKY MOBILE BOTTOM BAR ── */}
      <AnimatePresence>
        {showStickyMobile && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B1E16]/98 backdrop-blur-md border-t border-[#10B981]/30 p-2.5 flex items-center gap-2 shadow-2xl"
          >
            <a
              href="#packages"
              className="flex-1 py-3 bg-[#10B981] hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl text-center shadow-lg"
            >
              🔥 Claim Deal (PKR 9,999+)
            </a>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-[#25D366] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shrink-0"
            >
              <MessageSquare size={14} /> Chat
            </a>
            <button
              onClick={openDemoModal}
              className="px-3 py-3 bg-[#10B981]/20 text-emerald-300 border border-[#10B981]/30 font-bold text-xs rounded-xl shrink-0"
            >
              Demo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DEMO / BOOKING MODAL ── */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="bg-[#0C251B] border border-emerald-500/40 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-7 text-white relative shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
            >
              {/* Drag Handle for Mobile */}
              <div className="w-10 h-1 bg-emerald-700/60 rounded-full mx-auto mb-4 sm:hidden" />

              <button
                onClick={() => { setIsDemoModalOpen(false); setFormSuccess(false); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full bg-black/30"
              >
                <X size={18} />
              </button>

              {!formSuccess ? (
                <div>
                  <div className="space-y-1 mb-5">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">14 AUGUST SPECIAL</span>
                    <h3 className="text-xl font-extrabold tracking-tight">Book Your FREE Website Demo</h3>
                    <p className="text-xs text-slate-300">Discuss your requirements with our Pakistani experts and preview live layouts.</p>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        placeholder="e.g. Muhammad Ali"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-emerald-900/50 text-white placeholder-slate-500 focus:outline-none focus:border-[#10B981] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        value={formState.whatsapp_number}
                        onChange={(e) => setFormState({ ...formState, whatsapp_number: e.target.value })}
                        placeholder="e.g. 0300 1234567"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-emerald-900/50 text-white placeholder-slate-500 focus:outline-none focus:border-[#10B981] text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">Business Type</label>
                        <select
                          value={formState.business_type}
                          onChange={(e) => setFormState({ ...formState, business_type: e.target.value })}
                          className="w-full px-3 py-3 rounded-xl bg-black/40 border border-emerald-900/50 text-white focus:outline-none focus:border-[#10B981] text-sm"
                        >
                          <option>Restaurant / Café</option>
                          <option>Boutique / Clothing</option>
                          <option>Salon / Beauty</option>
                          <option>Real Estate</option>
                          <option>Services / Corporate</option>
                          <option>E-Commerce Store</option>
                          <option>Other Business</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">Preferred Package</label>
                        <input
                          type="text"
                          value={formState.preferred_package || "Azadi Starter (9,999)"}
                          onChange={(e) => setFormState({ ...formState, preferred_package: e.target.value })}
                          className="w-full px-3 py-3 rounded-xl bg-black/40 border border-emerald-900/50 text-white focus:outline-none focus:border-[#10B981] text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Message / Requirements</label>
                      <textarea
                        rows={2}
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        placeholder="Tell us about your website requirements..."
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-emerald-900/50 text-white placeholder-slate-500 focus:outline-none focus:border-[#10B981] resize-none text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-[#10B981] to-emerald-400 text-black font-extrabold text-sm rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                    >
                      {formSubmitting ? (
                        <span className="animate-pulse">Submitting...</span>
                      ) : (
                        <><Send size={15} /> Book My Free Demo</>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl">✓</div>
                  <h3 className="text-xl font-extrabold text-white">Demo Request Received! 🎉</h3>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto">
                    Thank you, <span className="text-emerald-400 font-bold">{formState.name}</span>! Our Prolx team will contact you on WhatsApp (<span className="font-mono">{formState.whatsapp_number}</span>) shortly.
                  </p>
                  <div className="pt-3 border-t border-emerald-900/40">
                    <a
                      href={getWhatsAppLink(formState.preferred_package, selectedPackageForModal?.deal_price_pkr)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 bg-[#25D366] hover:bg-[#1EBE57] text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={16} /> Chat Immediately on WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
