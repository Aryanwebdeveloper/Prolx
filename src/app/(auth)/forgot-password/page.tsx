import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { forgotPasswordAction } from "@/app/actions";
import { UrlProvider } from "@/components/url-provider";

export default async function ForgotPassword(props: {
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
    <div className="min-h-screen flex items-center justify-center bg-[#F0FDFA] px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0D9488] flex items-center justify-center">
              <span className="text-white font-bold text-sm font-mono">Px</span>
            </div>
            <span className="text-[#0F172A] font-bold text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Prolx
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
          <UrlProvider>
            <form className="space-y-5">
              <div className="text-center mb-2">
                <h1 className="text-2xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  Reset Password
                </h1>
                <p className="text-sm text-[#64748B]">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
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

              <SubmitButton
                formAction={forgotPasswordAction}
                pendingText="Sending reset link..."
                className="w-full py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
              >
                Send Reset Link
              </SubmitButton>

              <FormMessage message={searchParams} />

              <div className="text-center">
                <Link href="/sign-in" className="text-sm text-[#0D9488] hover:underline font-medium">
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          </UrlProvider>
        </div>
        <SmtpMessage />
      </div>
    </div>
  );
}
