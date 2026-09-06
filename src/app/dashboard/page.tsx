import Link from "next/link";
import { Package, FileText, Bell, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ShipmentStatusBadge } from "@/components/ui/shipment-status-badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { getCustomerShipments } from "@/lib/data/shipments";
import { formatDate } from "@/lib/utils";
import { ACTIVE_SHIPMENT_STATUSES, type ShipmentStatus } from "@/lib/constants";

export default async function DashboardOverviewPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ count: quoteCount }, { count: unreadCount }, shipments] = await Promise.all([
    supabase
      .from("quote_requests")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", profile!.id),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile!.id)
      .eq("read", false),
    getCustomerShipments(profile!.id),
  ]);

  const activeShipments = shipments.filter((s) =>
    ACTIVE_SHIPMENT_STATUSES.includes(s.status as ShipmentStatus),
  );
  const deliveredCount = shipments.filter((s) => s.status === "delivered").length;
  const recentShipments = shipments.slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-slate-500">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{activeShipments.length}</p>
              <p className="text-sm text-slate-500">Active Shipments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{deliveredCount}</p>
              <p className="text-sm text-slate-500">Delivered</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/10 text-secondary-dark">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{quoteCount ?? 0}</p>
              <p className="text-sm text-slate-500">Quote Requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{unreadCount ?? 0}</p>
              <p className="text-sm text-slate-500">Unread Notifications</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Shipments</h2>
          <Button asChild size="sm">
            <Link href="/dashboard/book">
              <Plus className="h-4 w-4" /> New Booking
            </Link>
          </Button>
        </div>
        {recentShipments.length > 0 ? (
          <div className="space-y-3">
            {recentShipments.map((s) => (
              <Card key={s.id}>
                <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
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
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/shipments/${s.id}`}>View</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="h-8 w-8" />}
            title="No shipments yet."
            description="Book your first shipment to see it tracked here."
            action={
              <Button asChild>
                <Link href="/dashboard/book">Book a Shipment</Link>
              </Button>
            }
          />
        )}
      </div>

      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link href="/get-quote">
            Request a new quote <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
