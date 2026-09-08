"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeliveryStatusBadge } from "@/components/ui/pickup-delivery-badges";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProofOfDeliveryForm } from "@/components/driver/proof-of-delivery-form";
import { updateDeliveryStatus } from "@/actions/deliveries";
import type { DeliveryStatus } from "@/lib/constants";

type DeliveryData = {
  id: string;
  shipment_id: string;
  delivery_reference: string;
  destination_address: string;
  recipient_name: string | null;
  recipient_phone: string | null;
  status: DeliveryStatus;
  shipments?: { fate_cargo_id: string } | null;
};

export function DriverDeliveryCard({ delivery }: { delivery: DeliveryData }) {
  const [status, setStatus] = useState(delivery.status);
  const [showComplete, setShowComplete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function transition(next: Exclude<DeliveryStatus, "delivered">, confirmMessage?: string) {
    if (confirmMessage && !confirm(confirmMessage)) return;
    startTransition(async () => {
      const result = await updateDeliveryStatus(delivery.id, next);
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
            {delivery.shipments?.fate_cargo_id ?? delivery.delivery_reference}
          </p>
          <DeliveryStatusBadge status={status} />
        </div>

        <div className="space-y-1 text-sm text-slate-600">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> {delivery.destination_address}
          </p>
          {delivery.recipient_name && (
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-slate-400" />
              {delivery.recipient_name} {delivery.recipient_phone ? `· ${delivery.recipient_phone}` : ""}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          {status === "assigned" && (
            <Button size="sm" disabled={isPending} onClick={() => transition("out_for_delivery")}>
              Start Delivery
            </Button>
          )}
          {status === "out_for_delivery" && (
            <Button size="sm" disabled={isPending} onClick={() => transition("arrived")}>
              Mark Arrived
            </Button>
          )}
          {status === "arrived" && (
            <Button size="sm" onClick={() => setShowComplete(true)}>
              Complete Delivery
            </Button>
          )}
          {status !== "delivered" && status !== "failed" && (
            <Button
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={() => transition("failed", "Report this delivery as failed?")}
            >
              Report Issue
            </Button>
          )}
        </div>
      </CardContent>

      <Dialog open={showComplete} onOpenChange={setShowComplete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proof of Delivery — {delivery.shipments?.fate_cargo_id}</DialogTitle>
          </DialogHeader>
          <ProofOfDeliveryForm
            deliveryId={delivery.id}
            shipmentId={delivery.shipment_id}
            defaultRecipientName={delivery.recipient_name ?? undefined}
            onDone={() => {
              setShowComplete(false);
              setStatus("delivered");
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
