import { notFound } from "next/navigation";
import Link from "next/link";
import { Package, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ShipmentStatusBadge } from "@/components/ui/shipment-status-badge";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { getUserOrganizations, getOrganizationShipments } from "@/lib/data/growth";
import { formatDate } from "@/lib/utils";
import type { ShipmentStatus } from "@/lib/constants";

export default async function DashboardOrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const memberships = await getUserOrganizations(profile!.id);
  const membership = memberships.find((m) => m.business_organizations?.id === id);
  if (!membership) notFound();

  const shipments = await getOrganizationShipments(id);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{membership.business_organizations?.name}</h1>
        <Button asChild size="sm">
          <Link href={`/dashboard/organizations/${id}/bulk-booking`}>
            <Upload className="h-4 w-4" /> Bulk Booking
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
            <Package className="h-4 w-4 text-primary" /> Shipment History
          </h2>
          {shipments.length > 0 ? (
            <div className="space-y-2">
              {shipments.map((s) => (
                <Link
                  key={s.id}
                  href={`/dashboard/shipments/${s.id}`}
                  className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <div>
                    <span className="font-mono font-semibold text-slate-900">{s.fate_cargo_id}</span>
                    <span className="ml-2 text-slate-500">{s.destinations?.name ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{formatDate(s.created_at)}</span>
                    <ShipmentStatusBadge status={s.status as ShipmentStatus} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No shipments booked yet." className="py-8" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
