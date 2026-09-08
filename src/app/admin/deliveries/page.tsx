import { MapPin } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getDeliveries, getActiveDrivers } from "@/lib/data/pickups-deliveries";
import { AdminDeliveryRow } from "@/components/admin/admin-delivery-row";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { DELIVERY_STATUSES, DELIVERY_STATUS_LABELS } from "@/lib/constants";

export default async function AdminDeliveriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; driver?: string }>;
}) {
  const { status, driver } = await searchParams;
  const [deliveries, drivers] = await Promise.all([
    getDeliveries({ status, driverId: driver }),
    getActiveDrivers(),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Deliveries</h1>
      <p className="mb-6 text-slate-500">Assign drivers and track last-mile delivery progress.</p>

      <AdminFilterBar
        searchPlaceholder="Search…"
        statusOptions={DELIVERY_STATUSES.map((s) => ({ value: s, label: DELIVERY_STATUS_LABELS[s] }))}
        driverOptions={drivers.filter((d) => d.is_active).map((d) => ({ value: d.id, label: d.full_name ?? "Unnamed driver" }))}
      />

      {deliveries.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {deliveries.map((d) => (
            <AdminDeliveryRow key={d.id} delivery={d} drivers={drivers.filter((dr) => dr.is_active)} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          icon={<MapPin className="h-8 w-8" />}
          title="No deliveries match your filters."
          description="Create a delivery assignment from a shipment's detail page once it reaches the destination hub."
        />
      )}
    </div>
  );
}
