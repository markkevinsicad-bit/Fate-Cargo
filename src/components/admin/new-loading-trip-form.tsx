"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGIONS } from "@/lib/constants";
import { createLoadingTrip } from "@/actions/loading-trips";

type Option = { id: string; name: string };

export function NewLoadingTripForm({ destinations }: { destinations: Option[] }) {
  const [region, setRegion] = useState<"visayas" | "mindanao">("visayas");
  const [destinationId, setDestinationId] = useState("");
  const [loadingDate, setLoadingDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!loadingDate) {
      toast.error("Loading date is required.");
      return;
    }
    startTransition(async () => {
      const result = await createLoadingTrip({
        region,
        loadingDate,
        destinationId: destinationId || undefined,
        notes: notes || undefined,
      });
      if (result.success) {
        toast.success("Loading trip created.");
        setLoadingDate("");
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
          <FormField label="Region" htmlFor="trip_region">
            <Select value={region} onValueChange={(v) => setRegion(v as "visayas" | "mindanao")}>
              <SelectTrigger id="trip_region">
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
          <FormField label="Destination (optional)" htmlFor="trip_destination">
            <Select value={destinationId || undefined} onValueChange={setDestinationId}>
              <SelectTrigger id="trip_destination">
                <SelectValue placeholder="Any destination" />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Loading Date" htmlFor="trip_date" required>
            <Input id="trip_date" type="date" value={loadingDate} onChange={(e) => setLoadingDate(e.target.value)} />
          </FormField>
          <FormField label="Notes" htmlFor="trip_notes">
            <Input id="trip_notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </FormField>
          <div className="sm:col-span-4">
            <Button type="submit" disabled={isPending}>
              Create Loading Trip
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
