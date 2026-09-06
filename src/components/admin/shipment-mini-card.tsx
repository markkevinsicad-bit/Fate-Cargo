import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ShipmentStatusBadge } from "@/components/ui/shipment-status-badge";
import { SpecialHandlingBadges } from "@/components/ui/special-handling-badges";
import { formatDate } from "@/lib/utils";
import type { ShipmentStatus } from "@/lib/constants";

type MiniShipment = {
  id: string;
  fate_cargo_id: string;
  status: string;
  weight_kg: number | null;
  special_handling: string[];
  created_at: string;
  destinations?: { name: string } | null;
  services?: { name: string } | null;
};

export function ShipmentMiniCard({ shipment }: { shipment: MiniShipment }) {
  return (
    <Card>
      <CardContent className="p-4">
        <Link href={`/admin/shipments/${shipment.id}`} className="block">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-sm font-semibold text-slate-900">{shipment.fate_cargo_id}</p>
            <ShipmentStatusBadge status={shipment.status as ShipmentStatus} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {shipment.services?.name ?? "Service TBD"} → {shipment.destinations?.name ?? "Destination TBD"}
          </p>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>{shipment.weight_kg ? `${shipment.weight_kg} kg` : "—"}</span>
            <span>{formatDate(shipment.created_at)}</span>
          </div>
        </Link>
        {shipment.special_handling.length > 0 && (
          <div className="mt-2">
            <SpecialHandlingBadges items={shipment.special_handling} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
