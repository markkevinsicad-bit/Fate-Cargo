"use client";

import { useState, type ComponentType } from "react";
import { toast } from "sonner";
import { CheckCircle2, Package, User, MapPin, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShipmentStatusBadge } from "@/components/ui/shipment-status-badge";
import { SpecialHandlingBadges } from "@/components/ui/special-handling-badges";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CargoConditionForm } from "@/components/admin/cargo-condition-form";
import { updateShipmentStatus } from "@/actions/warehouse";
import type { ShipmentStatus } from "@/lib/constants";

type ScannedShipment = {
  id: string;
  fate_cargo_id: string;
  status: ShipmentStatus;
  customer_full_name: string | null;
  customer_phone_masked: string | null;
  origin_address: string | null;
  origin_city: string | null;
  destination_name: string | null;
  destination_address: string | null;
  service_name: string | null;
  cargo_description: string | null;
  number_of_packages: number | null;
  weight_kg: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  volume_cbm: number | null;
  special_handling: string[];
  pickup_required: boolean;
  pickup_date: string | null;
};

const NEXT_STATUS_ACTIONS: Partial<Record<ShipmentStatus, { status: ShipmentStatus; label: string }[]>> = {
  cargo_received: [{ status: "at_warehouse", label: "Move to Warehouse" }],
  at_warehouse: [{ status: "consolidating", label: "Start Consolidating" }],
  consolidating: [{ status: "ready_for_loading", label: "Mark Ready for Loading" }],
  ready_for_loading: [{ status: "loaded", label: "Mark Loaded" }],
  loaded: [{ status: "in_transit", label: "Mark In Transit" }],
  in_transit: [{ status: "at_destination_hub", label: "Mark At Destination Hub" }],
  at_destination_hub: [{ status: "out_for_delivery", label: "Mark Out for Delivery" }],
  out_for_delivery: [{ status: "delivered", label: "Mark Delivered" }],
};

export function ScanResultPanel({ shipment, onReset }: { shipment: ScannedShipment; onReset: () => void }) {
  const [currentStatus, setCurrentStatus] = useState(shipment.status);
  const [showReceiveForm, setShowReceiveForm] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const canReceive = currentStatus === "booked" || currentStatus === "awaiting_pickup";
  const nextActions = NEXT_STATUS_ACTIONS[currentStatus] ?? [];

  async function handleTransition(status: ShipmentStatus, label: string) {
    setPending(status);
    const result = await updateShipmentStatus(shipment.id, status);
    setPending(null);
    if (result.success) {
      setCurrentStatus(status);
      toast.success(label + ".");
    } else {
      toast.error(result.error);
    }
  }

  async function handleReportIssue() {
    setPending("issue_reported");
    const result = await updateShipmentStatus(shipment.id, "issue_reported", "Issue reported by staff during scan.");
    setPending(null);
    if (result.success) {
      setCurrentStatus("issue_reported");
      toast.success("Issue reported.");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
          <p className="font-semibold">Booking Verified</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-lg font-bold text-slate-900">{shipment.fate_cargo_id}</p>
          <ShipmentStatusBadge status={currentStatus} />
        </div>

        {shipment.special_handling.length > 0 && <SpecialHandlingBadges items={shipment.special_handling} />}

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <InfoRow icon={User} label="Customer" value={shipment.customer_full_name ?? "—"} />
          <InfoRow icon={User} label="Phone" value={shipment.customer_phone_masked ?? "—"} />
          <InfoRow
            icon={MapPin}
            label="Origin"
            value={[shipment.origin_address, shipment.origin_city].filter(Boolean).join(", ") || "—"}
          />
          <InfoRow icon={MapPin} label="Destination" value={shipment.destination_name ?? "—"} />
          <InfoRow icon={Package} label="Service" value={shipment.service_name ?? "—"} />
          {shipment.cargo_description && (
            <InfoRow icon={Package} label="Cargo" value={shipment.cargo_description} />
          )}
          {shipment.number_of_packages && (
            <InfoRow icon={Package} label="Packages" value={String(shipment.number_of_packages)} />
          )}
          {shipment.weight_kg && <InfoRow icon={Package} label="Weight" value={`${shipment.weight_kg} kg`} />}
          {shipment.length_cm && shipment.width_cm && shipment.height_cm && (
            <InfoRow
              icon={Package}
              label="Dimensions"
              value={`${shipment.length_cm} × ${shipment.width_cm} × ${shipment.height_cm} cm`}
            />
          )}
          <InfoRow icon={Package} label="Pickup Required" value={shipment.pickup_required ? "Yes" : "No"} />
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {canReceive && (
            <Button size="sm" onClick={() => setShowReceiveForm(true)}>
              Receive Cargo
            </Button>
          )}
          {nextActions.map((action) => (
            <Button
              key={action.status}
              size="sm"
              variant="outline"
              disabled={pending === action.status}
              onClick={() => handleTransition(action.status, action.label)}
            >
              {action.label}
            </Button>
          ))}
          {currentStatus !== "cancelled" && currentStatus !== "delivered" && currentStatus !== "issue_reported" && (
            <Button
              size="sm"
              variant="destructive"
              disabled={pending === "issue_reported"}
              onClick={handleReportIssue}
            >
              <AlertTriangle className="h-4 w-4" /> Report Issue
            </Button>
          )}
        </div>

        <Button variant="ghost" size="sm" onClick={onReset}>
          Scan another shipment
        </Button>
      </CardContent>

      <Dialog open={showReceiveForm} onOpenChange={setShowReceiveForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive Cargo — {shipment.fate_cargo_id}</DialogTitle>
          </DialogHeader>
          <CargoConditionForm
            shipmentId={shipment.id}
            stage="receiving"
            onDone={() => {
              setShowReceiveForm(false);
              setCurrentStatus("cargo_received");
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div>
        <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
        <p className="text-slate-800">{value}</p>
      </div>
    </div>
  );
}
