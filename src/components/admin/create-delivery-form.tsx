"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { createDeliveryAssignment } from "@/actions/deliveries";

export function CreateDeliveryForm({
  shipmentId,
  defaultAddress,
  defaultRecipientName,
  defaultRecipientPhone,
}: {
  shipmentId: string;
  defaultAddress?: string;
  defaultRecipientName?: string;
  defaultRecipientPhone?: string;
}) {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState(defaultAddress ?? "");
  const [recipientName, setRecipientName] = useState(defaultRecipientName ?? "");
  const [recipientPhone, setRecipientPhone] = useState(defaultRecipientPhone ?? "");
  const [date, setDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!address.trim()) {
      toast.error("Destination address is required.");
      return;
    }
    setSubmitting(true);
    const result = await createDeliveryAssignment({
      shipmentId,
      destinationAddress: address,
      recipientName: recipientName || undefined,
      recipientPhone: recipientPhone || undefined,
      scheduledDate: date || undefined,
    });
    setSubmitting(false);
    if (result.success) {
      toast.success("Delivery assignment created.");
      setOpen(false);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Create Delivery Assignment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Delivery Assignment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Destination Address" htmlFor="dl_address" required>
            <Input id="dl_address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </FormField>
          <FormField label="Recipient Name" htmlFor="dl_recipient_name">
            <Input id="dl_recipient_name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
          </FormField>
          <FormField label="Recipient Phone" htmlFor="dl_recipient_phone">
            <Input id="dl_recipient_phone" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} />
          </FormField>
          <FormField label="Scheduled Date" htmlFor="dl_date">
            <Input id="dl_date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormField>
          <Button type="submit" className="w-full" disabled={submitting}>
            Create Delivery Assignment
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
