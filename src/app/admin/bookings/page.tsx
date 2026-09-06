import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { ShipmentStatusBadge } from "@/components/ui/shipment-status-badge";
import { createClient } from "@/lib/supabase/server";
import { getActiveDestinations } from "@/lib/data/public";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { formatDate } from "@/lib/utils";
import { SHIPMENT_STATUSES, SHIPMENT_STATUS_LABELS, type ShipmentStatus } from "@/lib/constants";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; destination?: string }>;
}) {
  const { q, status, destination } = await searchParams;
  const supabase = await createClient();
  const destinations = await getActiveDestinations();

  let query = supabase
    .from("shipments")
    .select(
      "id, fate_cargo_id, status, created_at, origin_address, customer_id, destination_id, profiles!shipments_customer_id_fkey(full_name, phone), destinations(name), services(name)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status as ShipmentStatus);
  if (destination) query = query.eq("destination_id", destination);
  if (q) {
    query = query.or(`fate_cargo_id.ilike.%${q}%,origin_address.ilike.%${q}%`);
  }

  const { data: bookings } = await query;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Bookings</h1>
      <p className="mb-6 text-slate-500">Search and filter all customer bookings.</p>

      <AdminFilterBar
        searchPlaceholder="Search by FATE Cargo ID or address…"
        statusOptions={SHIPMENT_STATUSES.map((s) => ({ value: s, label: SHIPMENT_STATUS_LABELS[s] }))}
        destinationOptions={destinations.map((d) => ({ value: d.id, label: d.name }))}
      />

      {bookings && bookings.length > 0 ? (
        <div className="mt-6 space-y-3">
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-4">
                <Link href={`/admin/shipments/${b.id}`} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-semibold text-slate-900">{b.fate_cargo_id}</p>
                      <ShipmentStatusBadge status={b.status as ShipmentStatus} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {b.profiles?.full_name ?? "Unknown customer"} · {b.profiles?.phone ?? "—"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {b.services?.name ?? "Service TBD"} → {b.destinations?.name ?? "TBD"} · Booked{" "}
                      {formatDate(b.created_at)}
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          icon={<ClipboardList className="h-8 w-8" />}
          title="No bookings match your filters."
          description="Try adjusting your search or filters."
        />
      )}
    </div>
  );
}
