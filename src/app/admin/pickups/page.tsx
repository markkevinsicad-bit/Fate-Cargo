import { Truck } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getPickups, getActiveDrivers } from "@/lib/data/pickups-deliveries";
import { AdminPickupRow } from "@/components/admin/admin-pickup-row";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { PICKUP_STATUSES, PICKUP_STATUS_LABELS } from "@/lib/constants";

export default async function AdminPickupsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; driver?: string }>;
}) {
  const { status, driver } = await searchParams;
  const [pickups, drivers] = await Promise.all([
    getPickups({ status, driverId: driver }),
    getActiveDrivers(),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Pickups</h1>
      <p className="mb-6 text-slate-500">Schedule, assign, and track cargo pickups.</p>

      <AdminFilterBar
        searchPlaceholder="Search…"
        statusOptions={PICKUP_STATUSES.map((s) => ({ value: s, label: PICKUP_STATUS_LABELS[s] }))}
        driverOptions={drivers.filter((d) => d.is_active).map((d) => ({ value: d.id, label: d.full_name ?? "Unnamed driver" }))}
      />

      {pickups.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pickups.map((p) => (
            <AdminPickupRow key={p.id} pickup={p} drivers={drivers.filter((d) => d.is_active)} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          icon={<Truck className="h-8 w-8" />}
          title="No pickups match your filters."
          description="Create a pickup request from a shipment's detail page."
        />
      )}
    </div>
  );
}
