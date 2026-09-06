import Link from "next/link";
import { Ship } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoadingTrips } from "@/lib/data/shipments";
import { getActiveDestinations } from "@/lib/data/public";
import { NewLoadingTripForm } from "@/components/admin/new-loading-trip-form";
import { formatDate } from "@/lib/utils";
import { LOADING_TRIP_STATUS_LABELS, type LoadingTripStatus } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLoadingTripsPage() {
  const [trips, destinations] = await Promise.all([getLoadingTrips(), getActiveDestinations()]);
  const supabase = await createClient();

  const tripShipmentCounts: Record<string, number> = {};
  if (trips.length > 0) {
    const { data: counts } = await supabase
      .from("shipments")
      .select("loading_trip_id")
      .in(
        "loading_trip_id",
        trips.map((t) => t.id),
      );
    for (const row of counts ?? []) {
      if (row.loading_trip_id) {
        tripShipmentCounts[row.loading_trip_id] = (tripShipmentCounts[row.loading_trip_id] ?? 0) + 1;
      }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Loading Trips</h1>
        <p className="text-slate-500">Create trips and assign shipments to them for loading.</p>
      </div>

      <NewLoadingTripForm destinations={destinations} />

      {trips.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((t) => (
            <Link key={t.id} href={`/admin/loading-trips/${t.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-sm font-semibold text-slate-900">{t.trip_number}</p>
                    <Badge variant="secondary">{LOADING_TRIP_STATUS_LABELS[t.status as LoadingTripStatus]}</Badge>
                  </div>
                  <p className="mt-1 text-sm capitalize text-slate-500">
                    {t.region} {t.destinations?.name ? `· ${t.destinations.name}` : ""}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(t.loading_date)}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {tripShipmentCounts[t.id] ?? 0} shipment{tripShipmentCounts[t.id] === 1 ? "" : "s"} assigned
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Ship className="h-8 w-8" />} title="No loading trips yet." description="Create your first loading trip above." />
      )}
    </div>
  );
}
