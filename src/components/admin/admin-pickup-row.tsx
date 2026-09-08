"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { PickupStatusBadge } from "@/components/ui/pickup-delivery-badges";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { PICKUP_STATUSES, PICKUP_STATUS_LABELS, type PickupStatus } from "@/lib/constants";
import { assignPickupDriver, updatePickupStatus } from "@/actions/pickups";

type Driver = { id: string; full_name: string | null };

type PickupRow = {
  id: string;
  shipment_id: string;
  pickup_reference: string;
  pickup_address: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  status: PickupStatus;
  assigned_driver_id: string | null;
  shipments?: { fate_cargo_id: string; weight_kg: number | null; special_handling: string[] } | null;
  profiles?: { full_name: string | null } | null;
};

export function AdminPickupRow({ pickup, drivers }: { pickup: PickupRow; drivers: Driver[] }) {
  const [status, setStatus] = useState<PickupStatus>(pickup.status);
  const [driverId, setDriverId] = useState(pickup.assigned_driver_id ?? "");
  const [isPending, startTransition] = useTransition();

  function handleAssign(newDriverId: string) {
    setDriverId(newDriverId);
    startTransition(async () => {
      const result = await assignPickupDriver(pickup.id, newDriverId);
      if (result.success) toast.success("Driver assigned.");
      else toast.error(result.error);
    });
  }

  function handleStatusChange(newStatus: PickupStatus) {
    setStatus(newStatus);
    startTransition(async () => {
      const result = await updatePickupStatus(pickup.id, newStatus as Exclude<PickupStatus, "picked_up">);
      if (result.success) toast.success("Pickup status updated.");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <Link href={`/admin/shipments/${pickup.shipment_id}`} className="font-mono text-sm font-semibold text-slate-900 hover:underline">
              {pickup.shipments?.fate_cargo_id ?? pickup.pickup_reference}
            </Link>
            <p className="text-sm text-slate-500">{pickup.pickup_address}</p>
            <p className="text-xs text-slate-400">
              {pickup.scheduled_date ? formatDate(pickup.scheduled_date) : "No date set"}
              {pickup.scheduled_time ? ` · ${pickup.scheduled_time}` : ""}
            </p>
          </div>
          <PickupStatusBadge status={status} />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Select value={driverId || undefined} onValueChange={handleAssign} disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder="Assign driver" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.full_name ?? "Unnamed driver"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => handleStatusChange(v as PickupStatus)} disabled={isPending}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PICKUP_STATUSES.filter((s) => s !== "picked_up").map((s) => (
                <SelectItem key={s} value={s}>
                  {PICKUP_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
