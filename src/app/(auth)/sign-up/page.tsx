import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { signUpAction } from "@/app/actions";
import { UrlProvider } from "@/components/url-provider";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={searchParams} />
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
            Join the Prolx{" "}
            <em style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#2DD4BF" }}>
              Platform
            </em>
          </h2>
          <p className="text-[#94A3B8] leading-relaxed mb-6">
            Register as Staff or Client. Your account will be reviewed and activated by an Admin before you can log in.
          </p>
          <div className="mt-8 flex flex-col gap-3 text-left">
            {[
              "Role-based secure access",
              "Certificate management & verification",
              "Profile & document management",
              "Admin approval required",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-[#94A3B8] text-sm">
                <span className="w-5 h-5 rounded-full bg-[#0D9488]/20 flex items-center justify-center text-[#2DD4BF] text-xs">✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Sign Up Form */}
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
              Create Account
            </h1>
            <p className="text-[#64748B] text-sm">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-[#0D9488] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Pending approval notice */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 text-xs font-medium">
              ⚠️ New accounts require Admin approval before access is granted. You will be notified once your account is reviewed.
            </p>
          </div>

          <UrlProvider>
            <form className="space-y-5">
              <div>
                <Label htmlFor="full_name" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                />
              </div>

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

              {/* Role Selection */}
              <div>
                <Label htmlFor="role" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                  Account Type
                </Label>
                <select
                  id="role"
                  name="role"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:border-[#0D9488] bg-white"
                >
                  <option value="client">Client — I am a client of Prolx</option>
                  <option value="staff">Staff — I work at Prolx</option>
                </select>
              </div>

              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Min. 6 characters"
                  minLength={6}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                />
              </div>

              <SubmitButton
                formAction={signUpAction}
                pendingText="Creating account..."
                className="w-full py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
              >
                Create Account
              </SubmitButton>

              <FormMessage message={searchParams} />
            </form>
          </UrlProvider>

          <SmtpMessage />

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
