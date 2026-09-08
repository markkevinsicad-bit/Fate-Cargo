"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { DeliveryStatusBadge } from "@/components/ui/pickup-delivery-badges";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { DELIVERY_STATUSES, DELIVERY_STATUS_LABELS, type DeliveryStatus } from "@/lib/constants";
import { assignDeliveryDriver, updateDeliveryStatus } from "@/actions/deliveries";

type Driver = { id: string; full_name: string | null };

type DeliveryRow = {
  id: string;
  shipment_id: string;
  delivery_reference: string;
  destination_address: string;
  scheduled_date: string | null;
  status: DeliveryStatus;
  assigned_driver_id: string | null;
  pod_recipient_name: string | null;
  delivered_at: string | null;
  shipments?: { fate_cargo_id: string; destinations?: { name: string } | null } | null;
};

export function AdminDeliveryRow({ delivery, drivers }: { delivery: DeliveryRow; drivers: Driver[] }) {
  const [status, setStatus] = useState<DeliveryStatus>(delivery.status);
  const [driverId, setDriverId] = useState(delivery.assigned_driver_id ?? "");
  const [isPending, startTransition] = useTransition();

  function handleAssign(newDriverId: string) {
    setDriverId(newDriverId);
    startTransition(async () => {
      const result = await assignDeliveryDriver(delivery.id, newDriverId);
      if (result.success) toast.success("Driver assigned.");
      else toast.error(result.error);
    });
  }

  function handleStatusChange(newStatus: DeliveryStatus) {
    setStatus(newStatus);
    startTransition(async () => {
      const result = await updateDeliveryStatus(delivery.id, newStatus as Exclude<DeliveryStatus, "delivered">);
      if (result.success) toast.success("Delivery status updated.");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <Link href={`/admin/shipments/${delivery.shipment_id}`} className="font-mono text-sm font-semibold text-slate-900 hover:underline">
              {delivery.shipments?.fate_cargo_id ?? delivery.delivery_reference}
            </Link>
            <p className="text-sm text-slate-500">
              {delivery.shipments?.destinations?.name ?? delivery.destination_address}
            </p>
            <p className="text-xs text-slate-400">
              {delivery.scheduled_date ? formatDate(delivery.scheduled_date) : "No date set"}
            </p>
          </div>
          <DeliveryStatusBadge status={status} />
        </div>

        {delivery.pod_recipient_name && (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            Delivered to {delivery.pod_recipient_name}
            {delivery.delivered_at ? ` on ${formatDate(delivery.delivered_at)}` : ""}
          </p>
        )}

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

          <Select value={status} onValueChange={(v) => handleStatusChange(v as DeliveryStatus)} disabled={isPending}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DELIVERY_STATUSES.filter((s) => s !== "delivered").map((s) => (
                <SelectItem key={s} value={s}>
                  {DELIVERY_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
