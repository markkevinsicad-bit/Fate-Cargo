import { Truck, MapPin, Package } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { getDriverPickups, getDriverDeliveries } from "@/lib/data/pickups-deliveries";
import { DriverPickupCard } from "@/components/driver/driver-pickup-card";
import { DriverDeliveryCard } from "@/components/driver/driver-delivery-card";

export default async function DriverDashboardPage() {
  const profile = await getCurrentProfile();
  const [pickups, deliveries] = await Promise.all([
    getDriverPickups(profile!.id),
    getDriverDeliveries(profile!.id),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  const activePickups = pickups.filter((p) => ["assigned", "scheduled", "out_for_pickup", "arrived"].includes(p.status));
  const todaysPickups = activePickups.filter((p) => p.scheduled_date === today);
  const upcomingPickups = activePickups.filter((p) => p.scheduled_date && p.scheduled_date > today);
  const completedPickupsToday = pickups.filter((p) => p.status === "picked_up" && p.picked_up_at?.startsWith(today));

  const activeDeliveries = deliveries.filter((d) => ["assigned", "out_for_delivery", "arrived"].includes(d.status));
  const todaysDeliveries = activeDeliveries.filter((d) => d.scheduled_date === today);
  const upcomingDeliveries = activeDeliveries.filter((d) => d.scheduled_date && d.scheduled_date > today);
  const completedDeliveriesToday = deliveries.filter((d) => d.status === "delivered" && d.delivered_at?.startsWith(today));

  const noAssignmentsAtAll = pickups.length === 0 && deliveries.length === 0;

  if (noAssignmentsAtAll) {
    return (
      <EmptyState
        icon={<Truck className="h-8 w-8" />}
        title="No assignments yet."
        description="Pickups and deliveries assigned to you will appear here."
      />
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Today&apos;s Pickups</h1>
        {todaysPickups.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {todaysPickups.map((p) => (
              <DriverPickupCard key={p.id} pickup={p} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No pickups scheduled for today.</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Today&apos;s Deliveries</h2>
        {todaysDeliveries.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {todaysDeliveries.map((d) => (
              <DriverDeliveryCard key={d.id} delivery={d} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No deliveries scheduled for today.</p>
        )}
      </div>

      {(upcomingPickups.length > 0 || upcomingDeliveries.length > 0) && (
        <div>
          <h2 className="text-xl font-bold text-slate-900">Upcoming Assignments</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingPickups.map((p) => (
              <DriverPickupCard key={p.id} pickup={p} />
            ))}
            {upcomingDeliveries.map((d) => (
              <DriverDeliveryCard key={d.id} delivery={d} />
            ))}
          </div>
        </div>
      )}

      {(completedPickupsToday.length > 0 || completedDeliveriesToday.length > 0) && (
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Package className="h-5 w-5" /> Completed Today
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {completedPickupsToday.length} pickup{completedPickupsToday.length === 1 ? "" : "s"},{" "}
            {completedDeliveriesToday.length} deliver{completedDeliveriesToday.length === 1 ? "y" : "ies"} completed.
          </p>
        </div>
      )}

      {activePickups.length === 0 && activeDeliveries.length === 0 && (
        <EmptyState icon={<MapPin className="h-8 w-8" />} title="No active assignments right now." />
      )}
    </div>
  );
}
