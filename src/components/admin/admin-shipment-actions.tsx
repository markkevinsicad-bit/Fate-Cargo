"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateShipmentStatus } from "@/actions/warehouse";
import { cancelBooking } from "@/actions/booking";
import { SHIPMENT_STATUSES, SHIPMENT_STATUS_LABELS, type ShipmentStatus } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AdminShipmentActions({
  shipmentId,
  currentStatus,
}: {
  shipmentId: string;
  currentStatus: ShipmentStatus;
}) {
  const [status, setStatus] = useState<ShipmentStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();

  function handleApply() {
    if (status === currentStatus) return;
    startTransition(async () => {
      const result =
        status === "cancelled"
          ? await cancelBooking(shipmentId)
          : await updateShipmentStatus(shipmentId, status);
      if (result.success) {
        toast.success("Status updated.");
      } else {
        toast.error(result.error);
        setStatus(currentStatus);
      }
    });
  }

  return (
    <div className="space-y-3">
      <Select value={status} onValueChange={(v) => setStatus(v as ShipmentStatus)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SHIPMENT_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {SHIPMENT_STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" className="w-full" disabled={isPending || status === currentStatus} onClick={handleApply}>
        Apply Status Change
      </Button>
      <p className="text-xs text-slate-500">
        This creates a tracking event and notifies the customer automatically.
      </p>
    </div>
  );
}
