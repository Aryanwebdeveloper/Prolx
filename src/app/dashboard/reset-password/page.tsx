import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function ResetPassword(props: {
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
          <form className="space-y-5">
            <div className="text-center mb-2">
              <h1 className="text-2xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Reset Password
              </h1>
              <p className="text-sm text-[#64748B]">
                Please enter your new password below.
              </p>
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="New password"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
              />
            </div>

            <SubmitButton
              formAction={resetPasswordAction}
              pendingText="Resetting password..."
              className="w-full py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
            >
              Reset Password
            </SubmitButton>

            <FormMessage message={searchParams} />
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-sm text-[#64748B] hover:text-[#0D9488] transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
