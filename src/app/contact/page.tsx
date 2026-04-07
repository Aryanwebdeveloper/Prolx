"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { submitContact } from "@/app/contact-actions";

const services = [
  "Website Development", "Custom Web App", "Mobile App", "UI/UX Design",
  "E-commerce", "SaaS Development", "SEO & Marketing", "Branding", "Other",
];

const budgets = ["Under $500", "$500 – $2,000", "$2,000 – $5,000", "$5,000 – $15,000", "$15,000+", "Not Sure"];

export default function ContactPage() {
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
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-[#F0FDFA]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
            <Link href="/" className="hover:text-[#0D9488]">Home</Link>
            <ChevronRight size={14} />
            <span className="text-[#0D9488]">Contact Us</span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Let&apos;s{" "}
            <em
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
            >
              Work Together
            </em>
          </h1>
          <p className="text-[#64748B] text-lg max-w-xl">
            Have a project in mind? We&apos;d love to hear about it. Send us a message
            and we&apos;ll get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#0D9488] flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={32} className="text-white" />
                  </div>
                  <h3
                    className="text-2xl font-bold text-[#0F172A] mb-3"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Message Sent Successfully!
                  </h3>
                  <p className="text-[#64748B]">
                    Thank you for reaching out. Our team will review your request and 
                    get back to you within 24 business hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", service: "", message: "", budget: "" }); }}
                    className="mt-6 px-6 py-2.5 bg-[#0D9488] text-white rounded-lg font-semibold text-sm"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="John Smith"
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-[#0D9488] transition-colors ${
                          errors.name ? "border-[#EF4444] bg-red-50" : "border-[#E2E8F0]"
                        }`}
                      />
                      {errors.name && <p className="text-[#EF4444] text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="john@company.com"
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-[#0D9488] transition-colors ${
                          errors.email ? "border-[#EF4444] bg-red-50" : "border-[#E2E8F0]"
                        }`}
                      />
                      {errors.email && <p className="text-[#EF4444] text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+1 234 567 890"
                        className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Service Interest
                      </label>
                      <select
                        value={form.service}
                        onChange={(e) => setForm({ ...form, service: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] transition-colors text-[#64748B]"
                      >
                        <option value="">Select a service…</option>
                        {services.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                      Budget Range
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {budgets.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setForm({ ...form, budget: b })}
                          className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                            form.budget === b
                              ? "bg-[#0D9488] border-[#0D9488] text-white"
                              : "border-[#E2E8F0] text-[#64748B] hover:border-[#0D9488] hover:text-[#0D9488]"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                      Your Message *
                    </label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your project, goals, and timeline…"
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-[#0D9488] transition-colors resize-none ${
                        errors.message ? "border-[#EF4444] bg-red-50" : "border-[#E2E8F0]"
                      }`}
                    />
                    {errors.message && <p className="text-[#EF4444] text-xs mt-1">{errors.message}</p>}
                  </div>

                    {errors.api && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                          <span className="font-bold text-sm">!</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold">Submission Error</p>
                          <p className="text-xs opacity-80">{errors.api}</p>
                        </div>
                      </div>
                    )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-opacity-70 active:scale-95 text-white font-bold rounded-xl transition-all text-base"
                  >
                    <Send size={18} />
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-[#F0FDFA] rounded-2xl p-6 border border-[#CCFBF1]">
                <h3
                  className="font-bold text-[#0F172A] mb-4"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Get in Touch
                </h3>
                <div className="space-y-4">
                  {[
                    { Icon: Mail, label: "Email", val: "hello@prolx.digital" },
                    { Icon: Phone, label: "Phone", val: "03300356046" },
                    { Icon: MapPin, label: "Offices", val: "Main Havelian Bazar & AUST BIC, Abbottabad" },
                  ].map(({ Icon, label, val }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-[#0D9488]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#64748B]">{label}</p>
                        <p className="text-sm font-medium text-[#0F172A]">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href="https://wa.me/923300356046"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#1eb855] text-white font-semibold rounded-xl transition-all text-sm"
                >
                  <MessageCircle size={18} />
                  Chat on WhatsApp
                </a>
              </div>

              <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13190.49005471465!2d73.1539207!3d34.053896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38de6b24467d983f%3A0x673dbb6a032d1847!2sHavelian%2C%20Abbottabad%2C%20Khyber%20Pakhtunkhwa%2C%20Pakistan!5e0!3m2!1sen!2s!4v1712246243000"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Prolx Office Location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
