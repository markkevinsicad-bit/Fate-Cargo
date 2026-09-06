import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ShipmentStatusBadge } from "@/components/ui/shipment-status-badge";
import { SpecialHandlingBadges } from "@/components/ui/special-handling-badges";
import { getLoadingTripById, getShipmentsForTrip } from "@/lib/data/shipments";
import { formatDate } from "@/lib/utils";
import { LOADING_TRIP_STATUS_LABELS, type LoadingTripStatus, type ShipmentStatus } from "@/lib/constants";
import { Package } from "lucide-react";

export default async function AdminLoadingTripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await getLoadingTripById(id);
  if (!trip) notFound();

  const shipments = await getShipmentsForTrip(id);

  const totalWeight = shipments.reduce((sum, s) => sum + (Number(s.weight_kg) || 0), 0);
  const specialHandlingCount = shipments.filter((s) => s.special_handling && s.special_handling.length > 0).length;
  const readyCount = shipments.filter((s) => s.status === "ready_for_loading").length;
  const loadedCount = shipments.filter((s) => s.status === "loaded").length;
  const notReadyCount = shipments.length - readyCount - loadedCount;
  const uniqueDestinations = new Set(shipments.map((s) => s.destinations?.name).filter(Boolean));

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xl font-bold text-slate-900">{trip.trip_number}</p>
          <p className="text-sm capitalize text-slate-500">
            {trip.region} · {formatDate(trip.loading_date)}
          </p>
        </div>
        <Badge variant="secondary">{LOADING_TRIP_STATUS_LABELS[trip.status as LoadingTripStatus]}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Total Shipments" value={shipments.length} />
        <Stat label="Total Weight" value={`${totalWeight.toFixed(1)} kg`} />
        <Stat label="Destinations" value={uniqueDestinations.size} />
        <Stat label="Special Handling" value={specialHandlingCount} />
        <Stat label="Ready" value={readyCount} />
        <Stat label="Loaded" value={loadedCount} />
      </div>

      {notReadyCount > 0 && (
        <p className="text-sm text-amber-700">
          {notReadyCount} shipment{notReadyCount === 1 ? "" : "s"} assigned but not yet marked ready or loaded.
        </p>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Assigned Shipments</h2>
        {shipments.length > 0 ? (
          <div className="space-y-3">
            {shipments.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <Link href={`/admin/shipments/${s.id}`} className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm font-semibold text-slate-900">{s.fate_cargo_id}</p>
                      <p className="text-sm text-slate-500">
                        {s.destinations?.name ?? "TBD"} · {s.weight_kg ? `${s.weight_kg} kg` : "—"}
                      </p>
                    </div>
                    <ShipmentStatusBadge status={s.status as ShipmentStatus} />
                  </Link>
                  {s.special_handling.length > 0 && (
                    <div className="mt-2">
                      <SpecialHandlingBadges items={s.special_handling} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="h-8 w-8" />}
            title="No shipments assigned to this trip yet."
            description="Assign shipments from the shipment detail page."
          />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </CardContent>
    </Card>
  );
}
