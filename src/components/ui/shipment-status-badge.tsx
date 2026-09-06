import { Badge } from "@/components/ui/badge";
import { SHIPMENT_STATUS_LABELS, type ShipmentStatus } from "@/lib/constants";

const VARIANT_MAP: Record<ShipmentStatus, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  booked: "secondary",
  awaiting_pickup: "warning",
  cargo_received: "default",
  at_warehouse: "default",
  consolidating: "default",
  ready_for_loading: "warning",
  loaded: "warning",
  in_transit: "default",
  at_destination_hub: "default",
  out_for_delivery: "warning",
  delivered: "success",
  cancelled: "destructive",
  on_hold: "destructive",
  issue_reported: "destructive",
};

export function ShipmentStatusBadge({ status, className }: { status: ShipmentStatus; className?: string }) {
  return (
    <Badge variant={VARIANT_MAP[status]} className={className}>
      {SHIPMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
