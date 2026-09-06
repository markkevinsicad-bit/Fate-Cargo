import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ShipmentStatusBadge } from "@/components/ui/shipment-status-badge";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { getCustomerShipments } from "@/lib/data/shipments";
import { formatDate } from "@/lib/utils";
import type { ShipmentStatus } from "@/lib/constants";

export default async function DashboardShipmentsPage() {
  const profile = await getCurrentProfile();
  const shipments = profile ? await getCustomerShipments(profile.id) : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Shipments</h1>
        <Button asChild size="sm">
          <Link href="/dashboard/book">
            <Plus className="h-4 w-4" /> New Booking
          </Link>
        </Button>
      </div>

      {shipments.length > 0 ? (
        <div className="space-y-3">
          {shipments.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-semibold text-slate-900">{s.fate_cargo_id}</p>
                    <ShipmentStatusBadge status={s.status as ShipmentStatus} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {s.services?.name ?? "Service TBD"} → {s.destinations?.name ?? "Destination TBD"}
                  </p>
                  <p className="text-xs text-slate-400">Booked {formatDate(s.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/shipments/${s.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="No shipments yet."
          description="Book your first shipment and track it from here, from booking all the way to delivery."
          action={
            <Button asChild>
              <Link href="/dashboard/book">Book a Shipment</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
