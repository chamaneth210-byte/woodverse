import { useState } from "react";
import {
  ArrowRight,
  Mail,
  Send,
} from "lucide-react";
import { navigate } from "../../utils";
import { BrandLogo } from "../../components/BrandLogo";
import { AuthField, AuthShell } from "./LoginPage";

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <AuthShell>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
        className="flex min-h-[760px] flex-col px-16 py-16 max-lg:min-h-0 max-sm:px-7 max-sm:py-10"
      >
        <button type="button" onClick={() => navigate("/")} className="w-fit text-left">
          <BrandLogo imageClassName="h-12 w-12" textClassName="text-[34px] text-[#164f40] max-sm:text-3xl" />
        </button>

        <div className="mt-9">
          <h1 className="break-words text-[34px] font-extrabold leading-tight tracking-normal text-[#151d28] max-sm:text-3xl">Forgot Password?</h1>
          <p className="mt-2 break-words text-base leading-relaxed text-[#4b514f]">
            Enter your email address and we will send reset instructions for your WoodVerse account.
          </p>
        </div>

        <div className="mt-11 grid gap-7">
          <AuthField label="Email Address" placeholder="name@company.com" type="email" autoComplete="email" icon={Mail} />
        </div>

        {sent && (
          <div className="mt-6 rounded-md border border-[#b9d8c8] bg-[#edf6ef] p-4 text-sm font-semibold leading-relaxed text-[#164f40]">
            Password reset instructions have been sent to your email address.
          </div>
        )}

        <button type="submit" className="mt-9 inline-flex min-h-[68px] w-full min-w-0 items-center justify-center gap-3 rounded-md bg-[#164f40] px-4 text-base font-bold text-white shadow-sm">
          <span>Send Reset Link</span>
          <ArrowRight className="h-6 w-6 shrink-0" />
        </button>

        <div className="my-9 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 text-xs font-semibold uppercase text-[#6c736f]">
          <span className="h-px bg-[#ecece8]" />
          <span>or</span>
          <span className="h-px bg-[#ecece8]" />
        </div>

        <button type="button" onClick={() => navigate("/login")} className="min-h-[70px] rounded-md border border-[#8b5633] bg-white px-4 font-bold text-[#8b5633]">
          Back to Sign In
        </button>

        <p className="mt-auto pt-16 text-xs font-semibold leading-snug tracking-wide text-[#7b827e] max-lg:pt-10">
          © 2026 WoodVerse Sri Lanka. Built for sustainable timber craftsmanship.
        </p>
      </form>
    </AuthShell>
  );
}
