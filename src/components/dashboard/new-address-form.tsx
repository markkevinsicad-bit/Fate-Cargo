"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SAVED_ADDRESS_TYPES, type SavedAddressType } from "@/lib/constants";
import { saveAddress } from "@/actions/organizations";

export function NewAddressForm() {
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState<SavedAddressType>("both");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!label.trim() || !address.trim()) {
      toast.error("Label and address are required.");
      return;
    }
    setSubmitting(true);
    const result = await saveAddress({ label, address, addressType: type, contactName, contactPhone });
    setSubmitting(false);
    if (result.success) {
      toast.success("Address saved.");
      setLabel("");
      setAddress("");
      setContactName("");
      setContactPhone("");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <FormField label="Label" htmlFor="addr_label" required hint="e.g. Home, Office, Warehouse">
            <Input id="addr_label" value={label} onChange={(e) => setLabel(e.target.value)} />
          </FormField>
          <FormField label="Type" htmlFor="addr_type">
            <Select value={type} onValueChange={(v) => setType(v as SavedAddressType)}>
              <SelectTrigger id="addr_type" className="capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAVED_ADDRESS_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Address" htmlFor="addr_address" required className="sm:col-span-2">
            <Input id="addr_address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </FormField>
          <FormField label="Contact Name" htmlFor="addr_contact_name">
            <Input id="addr_contact_name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </FormField>
          <FormField label="Contact Phone" htmlFor="addr_contact_phone">
            <Input id="addr_contact_phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </FormField>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              Save Address
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
