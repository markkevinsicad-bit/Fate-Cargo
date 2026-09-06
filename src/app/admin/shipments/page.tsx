import Link from "next/link";
import { Package } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { ShipmentStatusBadge } from "@/components/ui/shipment-status-badge";
import { SpecialHandlingBadges } from "@/components/ui/special-handling-badges";
import { createClient } from "@/lib/supabase/server";
import { getActiveDestinations } from "@/lib/data/public";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { formatDate } from "@/lib/utils";
import { SHIPMENT_STATUSES, SHIPMENT_STATUS_LABELS, type ShipmentStatus } from "@/lib/constants";

export default async function AdminShipmentsPage({
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
      "id, fate_cargo_id, status, created_at, weight_kg, special_handling, destination_id, profiles!shipments_customer_id_fkey(full_name), destinations(name), services(name)",
    )
    .order("created_at", { ascending: false })
    .limit(150);

  if (status) query = query.eq("status", status as ShipmentStatus);
  if (destination) query = query.eq("destination_id", destination);
  if (q) query = query.ilike("fate_cargo_id", `%${q}%`);

  const { data: shipments } = await query;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Shipments</h1>
      <p className="mb-6 text-slate-500">Full operational view across the shipment lifecycle.</p>

      <AdminFilterBar
        searchPlaceholder="Search by FATE Cargo ID…"
        statusOptions={SHIPMENT_STATUSES.map((s) => ({ value: s, label: SHIPMENT_STATUS_LABELS[s] }))}
        destinationOptions={destinations.map((d) => ({ value: d.id, label: d.name }))}
      />

      {shipments && shipments.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shipments.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4">
                <Link href={`/admin/shipments/${s.id}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-sm font-semibold text-slate-900">{s.fate_cargo_id}</p>
                    <ShipmentStatusBadge status={s.status as ShipmentStatus} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{s.profiles?.full_name ?? "Unknown customer"}</p>
                  <p className="text-xs text-slate-400">
                    {s.services?.name ?? "Service TBD"} → {s.destinations?.name ?? "TBD"}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                    <span>{s.weight_kg ? `${s.weight_kg} kg` : "—"}</span>
                    <span>{formatDate(s.created_at)}</span>
                  </div>
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
          className="mt-8"
          icon={<Package className="h-8 w-8" />}
          title="No shipments match your filters."
          description="Try adjusting your search or filters."
        />
      )}
    </div>
  );
}
