import type { ComponentType } from "react";
import { Suspense } from "react";
import { Package, MapPin, Truck, Users, Target, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getShipmentReportData, getAcquisitionReportData } from "@/lib/data/reports";
import { ReportDateRangeFilter } from "@/components/admin/report-date-range-filter";
import { CsvExportButton } from "@/components/admin/csv-export-button";
import { SHIPMENT_STATUS_LABELS, type ShipmentStatus } from "@/lib/constants";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range = "month" } = await searchParams;
  const [shipmentData, acquisitionData] = await Promise.all([
    getShipmentReportData(range),
    getAcquisitionReportData(range),
  ]);

  const activeCount =
    shipmentData.statusCounts.booked +
    shipmentData.statusCounts.awaiting_pickup +
    shipmentData.statusCounts.cargo_received +
    shipmentData.statusCounts.at_warehouse +
    shipmentData.statusCounts.consolidating +
    shipmentData.statusCounts.ready_for_loading +
    shipmentData.statusCounts.loaded +
    shipmentData.statusCounts.in_transit +
    shipmentData.statusCounts.at_destination_hub +
    shipmentData.statusCounts.out_for_delivery;

  const statusCsvRows: (string | number)[][] = [
    ["Status", "Count"],
    ...Object.entries(shipmentData.statusCounts).map(([k, v]) => [SHIPMENT_STATUS_LABELS[k as ShipmentStatus], v]),
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500">Live operational and growth metrics, calculated from real data.</p>
        </div>
        <Suspense fallback={null}>
          <ReportDateRangeFilter />
        </Suspense>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Package className="h-5 w-5 text-primary" /> Shipments
          </h2>
          <CsvExportButton filename="shipment-status-report.csv" rows={statusCsvRows} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Total" value={Object.values(shipmentData.statusCounts).reduce((a, b) => a + b, 0)} />
          <Stat label="Active" value={activeCount} />
          <Stat label="Delivered" value={shipmentData.statusCounts.delivered} />
          <Stat label="Cancelled" value={shipmentData.statusCounts.cancelled} />
          <Stat label="On Hold" value={shipmentData.statusCounts.on_hold} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <MapPin className="h-5 w-5 text-primary" /> Destinations & Regions
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <RankedList title="Shipments per Destination" items={shipmentData.byDestination} />
          <RankedList title="Shipments per Region" items={shipmentData.byRegion} capitalize />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Most Used Services</h2>
        <RankedList title="" items={shipmentData.byService} />
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Users className="h-5 w-5 text-primary" /> Customers
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="New Customers" value={shipmentData.newCustomerCount} />
          <Stat label="Returning Customers" value={shipmentData.returningCustomers} />
          <Stat label="Customers with Shipments" value={shipmentData.totalCustomersWithShipments} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Truck className="h-5 w-5 text-primary" /> Operations
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat label="Pickups Completed" value={shipmentData.pickupCompletedCount} />
          <Stat label="Deliveries Completed" value={shipmentData.deliveryCompletedCount} />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Average processing time is not shown yet - it requires more historical timestamp data than is
          currently available to calculate reliably.
        </p>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Target className="h-5 w-5 text-primary" /> Customer Acquisition
        </h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <Stat label="Quote Leads" value={acquisitionData.totalLeads} />
          <Stat label="Converted Leads" value={acquisitionData.convertedLeads} />
          <Stat label="Referrals" value={acquisitionData.totalReferrals} icon={Gift} />
          <Stat label="Converted Referrals" value={acquisitionData.convertedReferrals} />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon?: ComponentType<{ className?: string }> }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-slate-400" />}
          <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
        <p className="text-xs text-slate-500">{label}</p>
      </CardContent>
    </Card>
  );
}

function RankedList({ title, items, capitalize }: { title: string; items: [string, number][]; capitalize?: boolean }) {
  return (
    <div>
      {title && <p className="mb-2 text-sm font-medium text-slate-700">{title}</p>}
      {items.length > 0 ? (
        <div className="space-y-1">
          {items.slice(0, 10).map(([name, count]) => (
            <div key={name} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
              <span className={capitalize ? "capitalize" : ""}>{name}</span>
              <span className="font-semibold text-slate-700">{count}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No data available yet.</p>
      )}
    </div>
  );
}
