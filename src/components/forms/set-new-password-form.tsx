"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { setNewPasswordSchema } from "@/lib/validation/schemas";

export function SetNewPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = setNewPasswordSchema.safeParse({ password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid password.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setIsPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setIsPending(false);

    if (error) {
      setError(
        error.message.includes("session")
          ? "This reset link has expired. Please request a new one."
          : error.message,
      );
      return;
    }

    toast.success("Password updated. Please log in.");
    router.push("/staff-login");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <FormField label="New Password" htmlFor="new_password" required error={error ?? undefined} hint="At least 8 characters">
        <Input id="new_password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
      </FormField>
      <FormField label="Confirm New Password" htmlFor="confirm_password" required>
        <Input id="confirm_password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </FormField>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Spinner className="text-white" />}
        <KeyRound className="h-4 w-4" /> Set New Password
      </Button>
    </form>
  );
}
