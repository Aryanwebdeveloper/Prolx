import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface LoginProps {
  searchParams: Promise<Message>;
}

export default async function SignInPage({ searchParams }: LoginProps) {
  const message = await searchParams;

  if ("message" in message) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] relative flex-col items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D9488]/20 via-transparent to-[#0D9488]/10" />
        <div className="relative z-10 text-center max-w-md">
          <Link href="/" className="inline-flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-[#0D9488] flex items-center justify-center">
              <span className="text-white font-bold text-lg font-mono">Px</span>
            </div>
            <span
              className="text-white font-bold text-3xl"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Prolx
            </span>
          </Link>
          <h2
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Welcome Back to Your{" "}
            <em style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#2DD4BF" }}>
              Dashboard
            </em>
          </h2>
          <p className="text-[#94A3B8] leading-relaxed">
            Manage your content, track analytics, and keep your website running at peak performance.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { val: "12.8K", label: "Visitors" },
              { val: "284", label: "Leads" },
              { val: "98%", label: "Satisfaction" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-xl font-bold text-[#2DD4BF]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {s.val}
                </div>
                <div className="text-xs text-[#64748B]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Sign In Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0D9488] flex items-center justify-center">
                <span className="text-white font-bold text-sm font-mono">Px</span>
              </div>
              <span className="text-[#0F172A] font-bold text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Prolx
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Sign In
            </h1>
            <p className="text-[#64748B] text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-[#0D9488] font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <form className="space-y-5">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-[#0F172A]">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-xs text-[#0D9488] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Your password"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
              />
            </div>

            <SubmitButton
              className="w-full py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
              pendingText="Signing in..."
              formAction={signInAction}
            >
              Sign In
            </SubmitButton>

            <FormMessage message={message} />
          </form>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-[#64748B] hover:text-[#0D9488] transition-colors">
              ← Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
