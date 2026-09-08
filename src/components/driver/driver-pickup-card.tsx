"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MapPin, Phone, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PickupStatusBadge } from "@/components/ui/pickup-delivery-badges";
import { SpecialHandlingBadges } from "@/components/ui/special-handling-badges";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PickupCompleteForm } from "@/components/driver/pickup-complete-form";
import { updatePickupStatus } from "@/actions/pickups";
import type { PickupStatus } from "@/lib/constants";

type PickupData = {
  id: string;
  shipment_id: string;
  pickup_reference: string;
  pickup_address: string;
  pickup_contact_name: string | null;
  pickup_contact_phone: string | null;
  scheduled_time: string | null;
  status: PickupStatus;
  shipments?: {
    fate_cargo_id: string;
    cargo_description: string | null;
    special_handling: string[];
    weight_kg: number | null;
  } | null;
};

export function DriverPickupCard({ pickup }: { pickup: PickupData }) {
  const [status, setStatus] = useState(pickup.status);
  const [showComplete, setShowComplete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function transition(next: Exclude<PickupStatus, "picked_up">, confirmMessage?: string) {
    if (confirmMessage && !confirm(confirmMessage)) return;
    startTransition(async () => {
      const result = await updatePickupStatus(pickup.id, next);
      if (result.success) {
        setStatus(next);
        toast.success("Updated.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-sm font-semibold text-slate-900">
            {pickup.shipments?.fate_cargo_id ?? pickup.pickup_reference}
          </p>
          <PickupStatusBadge status={status} />
        </div>

        <div className="space-y-1 text-sm text-slate-600">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> {pickup.pickup_address}
          </p>
          {pickup.pickup_contact_name && (
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-slate-400" />
              {pickup.pickup_contact_name} {pickup.pickup_contact_phone ? `· ${pickup.pickup_contact_phone}` : ""}
            </p>
          )}
          {pickup.shipments?.cargo_description && (
            <p className="flex items-start gap-2">
              <Package className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> {pickup.shipments.cargo_description}
            </p>
          )}
          {pickup.scheduled_time && <p className="text-xs text-slate-400">Scheduled: {pickup.scheduled_time}</p>}
        </div>

        {pickup.shipments?.special_handling && pickup.shipments.special_handling.length > 0 && (
          <SpecialHandlingBadges items={pickup.shipments.special_handling} />
        )}

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          {(status === "assigned" || status === "scheduled") && (
            <Button size="sm" disabled={isPending} onClick={() => transition("out_for_pickup")}>
              Start Pickup
            </Button>
          )}
          {status === "out_for_pickup" && (
            <Button size="sm" disabled={isPending} onClick={() => transition("arrived")}>
              Mark Arrived
            </Button>
          )}
          {status === "arrived" && (
            <Button size="sm" onClick={() => setShowComplete(true)}>
              Mark Cargo Picked Up
            </Button>
          )}
          {status !== "picked_up" && status !== "failed" && status !== "cancelled" && (
            <Button
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={() => transition("failed", "Report this pickup as failed?")}
            >
              Report Issue
            </Button>
          )}
        </div>
      </CardContent>

      <Dialog open={showComplete} onOpenChange={setShowComplete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Pickup — {pickup.shipments?.fate_cargo_id}</DialogTitle>
          </DialogHeader>
          <PickupCompleteForm
            pickupId={pickup.id}
            shipmentId={pickup.shipment_id}
            onDone={() => {
              setShowComplete(false);
              setStatus("picked_up");
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
