"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { assignShipmentToTrip } from "@/actions/warehouse";
import { formatDate } from "@/lib/utils";
import type { Database } from "@/lib/supabase/database.types";

type Trip = Database["public"]["Tables"]["loading_trips"]["Row"];

export function AdminTripAssignForm({
  shipmentId,
  currentTripId,
  trips,
}: {
  shipmentId: string;
  currentTripId: string | null;
  trips: Trip[];
}) {
  const [tripId, setTripId] = useState(currentTripId ?? "");
  const [isPending, startTransition] = useTransition();

  function handleAssign() {
    if (!tripId) return;
    startTransition(async () => {
      const result = await assignShipmentToTrip(shipmentId, tripId);
      if (result.success) toast.success("Shipment assigned to trip.");
      else toast.error(result.error);
    });
  }

  if (trips.length === 0) {
    return <p className="text-sm text-slate-500">No loading trips yet. Create one from Loading Trips.</p>;
  }

  return (
    <div className="space-y-3">
      <Select value={tripId || undefined} onValueChange={setTripId}>
        <SelectTrigger>
          <SelectValue placeholder="Select a loading trip" />
        </SelectTrigger>
        <SelectContent>
          {trips.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.trip_number} · {t.region} · {formatDate(t.loading_date)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" className="w-full" onClick={handleAssign} disabled={isPending || !tripId || tripId === currentTripId}>
        Assign to Trip
      </Button>
    </div>
  );
}
