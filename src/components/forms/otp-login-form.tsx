"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Phone, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { otpRequestSchema, otpVerifySchema, profileSetupSchema } from "@/lib/validation/schemas";
import { toE164PH } from "@/lib/utils";
import { completeProfileSetup } from "@/actions/profile";

type Step = "phone" | "otp" | "profile";

export function OtpLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [step, setStep] = useState<Step>("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = otpRequestSchema.safeParse({ phone: phoneInput });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid phone number.");
      return;
    }

    const e164 = toE164PH(parsed.data.phone);
    if (!e164) {
      setError("Enter a valid PH mobile number (e.g. 09171234567).");
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({
        phone: e164,
        options: { shouldCreateUser: true },
      });
      if (error) {
        setError(error.message);
        return;
      }
      setPhoneInput(e164);
      setStep("otp");
      toast.success("Verification code sent.");
    });
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = otpVerifySchema.safeParse({ phone: phoneInput, token: otp });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter the 6-digit code.");
      return;
    }

    startTransition(async () => {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: parsed.data.phone,
        token: parsed.data.token,
        type: "sms",
      });
      if (error) {
        setError(error.message);
        return;
      }

      // Check whether this is a first-time customer (no full_name saved yet).
      const userId = data.user?.id;
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", userId)
          .single();

        if (!profile?.full_name) {
          setStep("profile");
          return;
        }
      }

      toast.success("Welcome back!");
      router.push(redirectTo);
      router.refresh();
    });
  }

  async function handleCompleteProfile(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = profileSetupSchema.safeParse({ full_name: fullName, email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter your full name.");
      return;
    }

    startTransition(async () => {
      const result = await completeProfileSetup(parsed.data);
      if (!result.success) {
        setError(result.error);
        return;
      }
      toast.success("Profile created. Welcome to FATE CARGO 360!");
      router.push(redirectTo);
      router.refresh();
    });
  }

  if (step === "profile") {
    return (
      <form onSubmit={handleCompleteProfile} className="space-y-5" noValidate>
        <p className="text-sm text-slate-500">
          Welcome! Let&apos;s finish setting up your account.
        </p>
        <FormField label="Full Name" htmlFor="full_name" required error={error ?? undefined}>
          <Input
            id="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoFocus
          />
        </FormField>
        <FormField label="Email (optional)" htmlFor="email">
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Spinner className="text-white" />}
          Continue
        </Button>
      </form>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
        <button
          type="button"
          onClick={() => setStep("phone")}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Change number
        </button>
        <FormField
          label="Verification Code"
          htmlFor="otp"
          required
          error={error ?? undefined}
          hint={`We sent a 6-digit code to ${phoneInput}`}
        >
          <Input
            id="otp"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            autoFocus
          />
        </FormField>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Spinner className="text-white" />}
          <ShieldCheck className="h-4 w-4" /> Verify & Continue
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOtp} className="space-y-5" noValidate>
      <FormField
        label="Phone Number"
        htmlFor="phone"
        required
        error={error ?? undefined}
        hint="e.g. 09171234567"
      >
        <Input
          id="phone"
          inputMode="tel"
          placeholder="09171234567"
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value)}
          autoFocus
        />
      </FormField>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Spinner className="text-white" />}
        <Phone className="h-4 w-4" /> Send Verification Code
      </Button>
    </form>
  );
}
