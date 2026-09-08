"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { promoteToDriver } from "@/actions/drivers";

export function PromoteDriverForm() {
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Enter a phone number.");
      return;
    }
    setSubmitting(true);
    const result = await promoteToDriver(phone.trim());
    setSubmitting(false);
    if (result.success) {
      toast.success("Account promoted to driver.");
      setPhone("");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <FormField
            label="Promote Existing Account to Driver"
            htmlFor="promote_phone"
            hint="The person must already have a FATE CARGO 360 account (signed up via phone OTP)."
            className="flex-1"
          >
            <Input id="promote_phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+639171234567" />
          </FormField>
          <Button type="submit" disabled={submitting}>
            Promote to Driver
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
