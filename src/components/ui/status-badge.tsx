import { Badge } from "@/components/ui/badge";
import { REQUEST_STATUS_LABELS, type RequestStatus } from "@/lib/constants";

const VARIANT_MAP: Record<RequestStatus, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  requested: "secondary",
  reviewed: "warning",
  quote_provided: "success",
  declined: "destructive",
  cancelled: "destructive",
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return <Badge variant={VARIANT_MAP[status]}>{REQUEST_STATUS_LABELS[status]}</Badge>;
}
