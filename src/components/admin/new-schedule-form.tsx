"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGIONS } from "@/lib/constants";
import { createLoadingSchedule } from "@/actions/admin";

export function NewScheduleForm() {
  const [region, setRegion] = useState<"visayas" | "mindanao">("visayas");
  const [loadingDate, setLoadingDate] = useState("");
  const [bookingCutoff, setBookingCutoff] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!loadingDate) {
      toast.error("Loading date is required.");
      return;
    }
    startTransition(async () => {
      const result = await createLoadingSchedule({
        region,
        loading_date: loadingDate,
        booking_cutoff: bookingCutoff || null,
        notes: notes || null,
      });
      if (result.success) {
        toast.success("Loading schedule added.");
        setLoadingDate("");
        setBookingCutoff("");
        setNotes("");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-4">
          <FormField label="Region" htmlFor="region">
            <Select value={region} onValueChange={(v) => setRegion(v as "visayas" | "mindanao")}>
              <SelectTrigger id="region">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r} className="capitalize">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Loading Date" htmlFor="loading_date" required>
            <Input
              id="loading_date"
              type="date"
              value={loadingDate}
              onChange={(e) => setLoadingDate(e.target.value)}
            />
          </FormField>
          <FormField label="Booking Cutoff" htmlFor="booking_cutoff">
            <Input
              id="booking_cutoff"
              type="datetime-local"
              value={bookingCutoff}
              onChange={(e) => setBookingCutoff(e.target.value)}
            />
          </FormField>
          <FormField label="Notes" htmlFor="notes">
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </FormField>
          <div className="sm:col-span-4">
            <Button type="submit" disabled={isPending}>
              Add Loading Schedule
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
