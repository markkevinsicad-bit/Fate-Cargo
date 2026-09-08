import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ShipmentStatusBadge } from "@/components/ui/shipment-status-badge";
import { getOrganizationById, getOrganizationMembers, getOrganizationShipments } from "@/lib/data/growth";
import { AddOrgMemberForm } from "@/components/admin/add-org-member-form";
import { formatDate } from "@/lib/utils";
import { Package, Users } from "lucide-react";
import type { ShipmentStatus } from "@/lib/constants";

export default async function AdminOrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = await getOrganizationById(id);
  if (!org) notFound();

  const [members, shipments] = await Promise.all([getOrganizationMembers(id), getOrganizationShipments(id)]);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{org.name}</h1>
          <p className="text-sm text-slate-500">
            {org.contact_email ?? "—"} {org.contact_phone ? `· ${org.contact_phone}` : ""}
          </p>
        </div>
        <Badge variant={org.is_active ? "success" : "secondary"}>{org.is_active ? "Active" : "Inactive"}</Badge>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <Users className="h-4 w-4 text-primary" /> Authorized Users
          </h2>
          <AddOrgMemberForm organizationId={id} />
          {members.length > 0 ? (
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm">
                  <span>
                    {m.profiles?.full_name ?? "Unnamed"} · {m.profiles?.phone ?? "—"}
                  </span>
                  <Badge variant="outline" className="capitalize">{m.org_role}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No members added yet.</p>
          )}
        </CardContent>
      </Card>

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
                  href={`/admin/shipments/${s.id}`}
                  className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <div>
                    <span className="font-mono font-semibold text-slate-900">{s.fate_cargo_id}</span>
                    <span className="ml-2 text-slate-500">
                      {s.services?.name ?? "—"} → {s.destinations?.name ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{formatDate(s.created_at)}</span>
                    <ShipmentStatusBadge status={s.status as ShipmentStatus} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No shipments booked under this organization yet." className="py-8" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
