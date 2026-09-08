"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { createPickupRequest } from "@/actions/pickups";

export function CreatePickupForm({
  shipmentId,
  defaultAddress,
  defaultContactName,
  defaultContactPhone,
}: {
  shipmentId: string;
  defaultAddress?: string;
  defaultContactName?: string;
  defaultContactPhone?: string;
}) {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState(defaultAddress ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [contactName, setContactName] = useState(defaultContactName ?? "");
  const [contactPhone, setContactPhone] = useState(defaultContactPhone ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!address.trim()) {
      toast.error("Pickup address is required.");
      return;
    }
    setSubmitting(true);
    const result = await createPickupRequest({
      shipmentId,
      pickupAddress: address,
      scheduledDate: date || undefined,
      scheduledTime: time || undefined,
      contactName: contactName || undefined,
      contactPhone: contactPhone || undefined,
    });
    setSubmitting(false);
    if (result.success) {
      toast.success("Pickup request created.");
      setOpen(false);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Create Pickup Request
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Pickup Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Pickup Address" htmlFor="pu_address" required>
            <Input id="pu_address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Scheduled Date" htmlFor="pu_date">
              <Input id="pu_date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </FormField>
            <FormField label="Scheduled Time" htmlFor="pu_time">
              <Input id="pu_time" placeholder="e.g. Morning" value={time} onChange={(e) => setTime(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Contact Name" htmlFor="pu_contact_name">
            <Input id="pu_contact_name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </FormField>
          <FormField label="Contact Phone" htmlFor="pu_contact_phone">
            <Input id="pu_contact_phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </FormField>
          <Button type="submit" className="w-full" disabled={submitting}>
            Create Pickup Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
