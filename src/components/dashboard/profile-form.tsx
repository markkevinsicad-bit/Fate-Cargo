"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import { completeProfileSetup } from "@/actions/profile";

export function ProfileForm({
  initialFullName,
  initialEmail,
  phone,
}: {
  initialFullName: string;
  initialEmail: string;
  phone: string;
}) {
  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await completeProfileSetup({ full_name: fullName, email });
      if (result.success) {
        toast.success("Profile updated.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField label="Phone Number" htmlFor="phone_display" hint="Your phone number is verified and can't be changed here.">
        <Input id="phone_display" value={phone} disabled />
      </FormField>
      <FormField label="Full Name" htmlFor="full_name" required>
        <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </FormField>
      <FormField label="Email (optional)" htmlFor="email">
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormField>
      <Button type="submit" disabled={isPending}>
        {isPending && <Spinner className="text-white" />}
        Save Changes
      </Button>
    </form>
  );
}
