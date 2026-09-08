"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { createOrganization } from "@/actions/organizations";

export function NewOrganizationForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Organization name is required.");
      return;
    }
    setSubmitting(true);
    const result = await createOrganization({ name, contactEmail: email, contactPhone: phone });
    setSubmitting(false);
    if (result.success) {
      toast.success("Business organization created.");
      setName("");
      setEmail("");
      setPhone("");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-4">
          <FormField label="Organization Name" htmlFor="org_name" required className="sm:col-span-2">
            <Input id="org_name" value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="Contact Email" htmlFor="org_email">
            <Input id="org_email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormField>
          <FormField label="Contact Phone" htmlFor="org_phone">
            <Input id="org_phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormField>
          <div className="sm:col-span-4">
            <Button type="submit" disabled={submitting}>
              Create Organization
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
