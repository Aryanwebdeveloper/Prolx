"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { submitContact } from "@/app/contact-actions";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/scroll-reveal";

const services = [
  "Website Development", "Custom Web App", "Mobile App", "UI/UX Design",
  "E-commerce", "SaaS Development", "SEO & Marketing", "Branding", "Other",
];

const budgets = ["Under $500", "$500 – $2,000", "$2,000 – $5,000", "$5,000 – $15,000", "$15,000+", "Not Sure"];

export function ContactClient() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", service: "", message: "", budget: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";
    if (!form.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setErrors({});
    setIsSubmitting(true);
    
    const { error } = await submitContact(form);
    setIsSubmitting(false);
    
    if (error) {
      setErrors({ ...errors, api: error.message });
      return;
    }
    
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ProlxNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-[#0A0F1E] overflow-hidden text-white">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#0D9488]/10 blur-[120px] animate-glow-pulse pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="up">
            <div className="flex items-center gap-2 text-sm text-[#94A3B8] mb-5 font-mono">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={14} className="text-[#0D9488]" />
              <span className="text-[#2DD4BF]">Contact Us</span>
            </div>
            <h1
              className="text-5xl md:text-6xl font-extrabold mb-5"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Let&apos;s{" "}
              <em className="text-shimmer" style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
                Work Together
              </em>
            </h1>
            <p className="text-[#94A3B8] text-lg max-w-xl leading-relaxed">
              Have a project in mind? We&apos;d love to hear about it. Send us a message
              and our executive team will get back to you within 24 business hours.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Form Column */}
            <div className="lg:col-span-2">
              {submitted ? (
                <ScrollReveal direction="scale">
                  <div className="bg-white border border-[#CCFBF1] rounded-3xl p-12 text-center shadow-xl shadow-teal-900/5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0D9488] to-[#2DD4BF] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-200">
                      <CheckCircle2 size={32} className="text-white" />
                    </div>
                    <h3
                      className="text-2xl font-bold text-[#0F172A] mb-3"
                      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                      Message Sent Successfully!
                    </h3>
                    <p className="text-[#64748B] text-sm leading-relaxed max-w-md mx-auto">
                      Thank you for reaching out to Prolx. Our team will review your project 
                      specifications and contact you within 24 business hours.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", service: "", message: "", budget: "" }); }}
                      className="glow-btn mt-8 px-7 py-3 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-sm"
                    >
                      Send Another Message
                    </button>
                  </div>
                </ScrollReveal>
              ) : (
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#E2E8F0] shadow-sm">
                    <h3 className="text-xl font-bold text-[#0F172A] mb-6 font-mono" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      Project Inquiry Form
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-2 font-mono">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="John Smith"
                            className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] transition-all bg-[#F8FAFC] ${
                              errors.name ? "border-[#EF4444] bg-red-50/50" : "border-[#E2E8F0]"
                            }`}
                          />
                          {errors.name && <p className="text-[#EF4444] text-xs mt-1.5 font-semibold">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-2 font-mono">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="john@company.com"
                            className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] transition-all bg-[#F8FAFC] ${
                              errors.email ? "border-[#EF4444] bg-red-50/50" : "border-[#E2E8F0]"
                            }`}
                          />
                          {errors.email && <p className="text-[#EF4444] text-xs mt-1.5 font-semibold">{errors.email}</p>}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-2 font-mono">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="+92 330 0356046"
                            className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] transition-all bg-[#F8FAFC]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-2 font-mono">
                            Service Interest
                          </label>
                          <select
                            value={form.service}
                            onChange={(e) => setForm({ ...form, service: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] transition-all bg-[#F8FAFC] text-[#64748B]"
                          >
                            <option value="">Select a service…</option>
                            {services.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-3 font-mono">
                          Estimated Budget Range
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {budgets.map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setForm({ ...form, budget: b })}
                              className={`px-4.5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                                form.budget === b
                                  ? "bg-[#0D9488] border-[#0D9488] text-white shadow shadow-teal-900/10"
                                  : "border-[#E2E8F0] text-[#64748B] hover:border-[#0D9488] hover:text-[#0D9488] bg-white"
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-2 font-mono">
                          Your Message *
                        </label>
                        <textarea
                          rows={5}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          placeholder="Tell us about your project requirements, target audience, and desired launch timeline…"
                          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] transition-all resize-none bg-[#F8FAFC] ${
                            errors.message ? "border-[#EF4444] bg-red-50/50" : "border-[#E2E8F0]"
                          }`}
                        />
                        {errors.message && <p className="text-[#EF4444] text-xs mt-1.5 font-semibold">{errors.message}</p>}
                      </div>

                      {errors.api && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold">Submission Error</p>
                            <p className="text-xs opacity-90">{errors.api}</p>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="glow-btn inline-flex items-center gap-2.5 px-9 py-4 bg-gradient-to-r from-[#0D9488] to-[#0891B2] disabled:bg-opacity-70 text-white font-bold rounded-xl text-base shadow-lg"
                      >
                        <Send size={16} />
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </button>
                    </form>
                  </div>
                </ScrollReveal>
              )}
            </div>

            {/* Info Cards Column */}
            <StaggerContainer className="space-y-6" stagger={0.08}>
              <StaggerItem>
                <div className="bg-white rounded-3xl p-7 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
                  {/* Decorative background glow */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#F0FDFA] rounded-bl-full -z-10" />
                  
                  <h3
                    className="font-bold text-[#0F172A] mb-6 text-lg relative"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Office Credentials
                  </h3>
                  
                  <div className="space-y-5">
                    {[
                      { Icon: Mail, label: "Email Address", val: "hello@prolx.digital" },
                      { Icon: Phone, label: "Phone & Mobile", val: "03300356046" },
                      { Icon: MapPin, label: "Main Office Location", val: "Havelian Main Bazar, Abbottabad, Pakistan" },
                      { Icon: Clock, label: "Response Promise", val: "Within 24 business hours" },
                    ].map(({ Icon, label, val }) => (
                      <div key={label} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F0FDFA] to-[#CCFBF1] flex items-center justify-center shrink-0 border border-[#CCFBF1]">
                          <Icon size={16} className="text-[#0D9488]" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] font-mono leading-none mb-1">{label}</p>
                          <p className="text-sm font-semibold text-[#0F172A] leading-relaxed">{val}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <a
                    href="https://wa.me/923300356046"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-[#25D366] hover:bg-[#1eb855] text-white font-bold rounded-xl transition-all text-sm shadow-md shadow-green-100"
                  >
                    <MessageCircle size={18} />
                    Chat on WhatsApp
                  </a>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-sm">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13190.49005471465!2d73.1539207!3d34.053896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38de6b24467d983f%3A0x673dbb6a032d1847!2sHavelian%2C%20Abbottabad%2C%20Khyber%20Pakhtunkhwa%2C%20Pakistan!5e0!3m2!1sen!2s!4v1712246243000"
                    width="100%"
                    height="240"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Prolx Office Location"
                    className="grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
