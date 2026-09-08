"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { staffLoginSchema, resetPasswordRequestSchema } from "@/lib/validation/schemas";

type Mode = "login" | "forgot" | "sent";

export function StaffLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirect = searchParams.get("redirect");

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const supabase = createClient();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = staffLoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email and password.");
      return;
    }

    setIsPending(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      setIsPending(false);
      setError(
        error.message.includes("Invalid login credentials")
          ? "Incorrect email or password."
          : error.message,
      );
      return;
    }

    // Route drivers to their own portal by default; everyone else to the
    // admin panel, unless middleware sent them here with an explicit
    // ?redirect= target (e.g. a deep link to a specific admin page).
    let destination = explicitRedirect || "/admin";
    if (!explicitRedirect && data.user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      if (profile?.role === "driver") destination = "/driver";
    }

    setIsPending(false);
    toast.success("Welcome back!");
    router.push(destination);
    router.refresh();
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = resetPasswordRequestSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email.");
      return;
    }

    setIsPending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsPending(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMode("sent");
  }

  if (mode === "sent") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-slate-600">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
        </p>
        <Button variant="outline" onClick={() => setMode("login")} className="w-full">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Button>
      </div>
    );
  }

  if (mode === "forgot") {
    return (
      <form onSubmit={handleForgotPassword} className="space-y-5" noValidate>
        <button
          type="button"
          onClick={() => setMode("login")}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to login
        </button>
        <FormField label="Email" htmlFor="forgot_email" required error={error ?? undefined}>
          <Input
            id="forgot_email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </FormField>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Spinner className="text-white" />}
          <KeyRound className="h-4 w-4" /> Send Reset Link
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5" noValidate>
      <FormField label="Email" htmlFor="staff_email" required error={error ?? undefined}>
        <Input
          id="staff_email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
      </FormField>
      <FormField label="Password" htmlFor="staff_password" required>
        <Input
          id="staff_password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormField>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Spinner className="text-white" />}
        <Mail className="h-4 w-4" /> Log In
      </Button>
      <button
        type="button"
        onClick={() => setMode("forgot")}
        className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
      >
        Forgot password?
      </button>
    </form>
  );
}
