import type { ComponentType } from "react";
import { Inbox, PackageCheck, ClipboardCheck, AlertTriangle, CalendarClock, Truck } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { ShipmentMiniCard } from "@/components/admin/shipment-mini-card";

export default async function AdminWarehousePage() {
  const supabase = await createClient();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const baseSelect =
    "id, fate_cargo_id, status, weight_kg, special_handling, created_at, updated_at, destinations(name), services(name)";

  const [{ data: incoming }, { data: receivedToday }, { data: pendingInspection }, { data: readyForLoading }, { data: loaded }] =
    await Promise.all([
      supabase.from("shipments").select(baseSelect).in("status", ["booked", "awaiting_pickup"]).order("created_at", { ascending: false }),
      supabase
        .from("shipments")
        .select(baseSelect)
        .eq("status", "cargo_received")
        .gte("updated_at", startOfToday.toISOString())
        .order("updated_at", { ascending: false }),
      supabase.from("shipments").select(baseSelect).in("status", ["cargo_received", "at_warehouse"]).order("updated_at", { ascending: false }),
      supabase.from("shipments").select(baseSelect).eq("status", "ready_for_loading").order("updated_at", { ascending: false }),
      supabase.from("shipments").select(baseSelect).eq("status", "loaded").order("updated_at", { ascending: false }),
    ]);

  const specialHandlingItems = [...(incoming ?? []), ...(pendingInspection ?? [])].filter(
    (s) => s.special_handling && s.special_handling.length > 0,
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Warehouse</h1>
        <p className="mt-1 text-slate-500">Live operational view of cargo moving through the warehouse.</p>
      </div>

      <Section
        title="Incoming Cargo"
        icon={Inbox}
        items={incoming}
        emptyText="No shipments awaiting pickup or receiving right now."
      />

      <Section
        title="Cargo Received Today"
        icon={PackageCheck}
        items={receivedToday}
        emptyText="No cargo has been received today yet."
      />

      <Section
        title="Pending Inspection"
        icon={ClipboardCheck}
        items={pendingInspection}
        emptyText="Nothing pending inspection."
      />

      <div>
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-slate-900">Special Handling</h2>
        </div>
        {specialHandlingItems.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {specialHandlingItems.map((s) => (
              <ShipmentMiniCard key={s.id} shipment={s} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No incoming or pending shipments require special handling.</p>
        )}
      </div>

      <Section
        title="Ready for Loading"
        icon={CalendarClock}
        items={readyForLoading}
        emptyText="No shipments are ready for loading yet."
      />

      <Section title="Loaded" icon={Truck} items={loaded} emptyText="No shipments have been loaded yet." />
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  items,
  emptyText,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  items: Array<Parameters<typeof ShipmentMiniCard>[0]["shipment"]> | null;
  emptyText: string;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>
        <span className="text-sm text-slate-400">{items?.length ?? 0}</span>
      </div>
      {items && items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <ShipmentMiniCard key={s.id} shipment={s} />
          ))}
        </div>
      ) : (
        <EmptyState title={emptyText} className="py-8" />
      )}
    </div>
  );
}
