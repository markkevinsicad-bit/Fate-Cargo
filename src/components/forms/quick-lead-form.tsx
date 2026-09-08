"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import { submitLead } from "@/actions/leads";

export function QuickLeadForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      toast.error("Please enter your name and phone number.");
      return;
    }
    setSubmitting(true);
    const result = await submitLead({ fullName, phone, origin, destination });
    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
      toast.success("Thanks! We'll get back to you shortly.");
    } else {
      toast.error(result.error);
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
        <CheckCircle2 className="h-6 w-6 shrink-0" />
        <p className="text-sm font-medium">Thanks! Our team will reach out to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <FormField label="Full Name" htmlFor="lead_name" required>
        <Input id="lead_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </FormField>
      <FormField label="Phone Number" htmlFor="lead_phone" required>
        <Input id="lead_phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09171234567" />
      </FormField>
      <FormField label="Pickup Area" htmlFor="lead_origin">
        <Input id="lead_origin" value={origin} onChange={(e) => setOrigin(e.target.value)} />
      </FormField>
      <FormField label="Destination" htmlFor="lead_destination">
        <Input id="lead_destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
      </FormField>
      <div className="sm:col-span-2">
        <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
          {submitting ? <Spinner className="text-white" /> : <Send className="h-4 w-4" />}
          Get a Fast Callback
        </Button>
      </div>
    </form>
  );
}
