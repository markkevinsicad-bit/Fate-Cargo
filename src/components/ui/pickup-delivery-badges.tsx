import { Badge } from "@/components/ui/badge";
import { PICKUP_STATUS_LABELS, DELIVERY_STATUS_LABELS, type PickupStatus, type DeliveryStatus } from "@/lib/constants";

const PICKUP_VARIANTS: Record<PickupStatus, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  requested: "secondary",
  scheduled: "default",
  assigned: "default",
  out_for_pickup: "warning",
  arrived: "warning",
  picked_up: "success",
  failed: "destructive",
  cancelled: "destructive",
};

export function PickupStatusBadge({ status, className }: { status: PickupStatus; className?: string }) {
  return (
    <Badge variant={PICKUP_VARIANTS[status]} className={className}>
      {PICKUP_STATUS_LABELS[status]}
    </Badge>
  );
}

const DELIVERY_VARIANTS: Record<DeliveryStatus, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  pending_assignment: "secondary",
  assigned: "default",
  out_for_delivery: "warning",
  arrived: "warning",
  delivered: "success",
  failed: "destructive",
  return_required: "destructive",
};

export function DeliveryStatusBadge({ status, className }: { status: DeliveryStatus; className?: string }) {
  return (
    <Badge variant={DELIVERY_VARIANTS[status]} className={className}>
      {DELIVERY_STATUS_LABELS[status]}
    </Badge>
  );
}
