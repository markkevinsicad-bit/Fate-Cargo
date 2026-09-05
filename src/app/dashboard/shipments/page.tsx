import { Package } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardShipmentsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My Shipments</h1>
      <EmptyState
        icon={<Package className="h-8 w-8" />}
        title="No shipment data available yet."
        description="Once booking and the FATE Cargo ID / QR tracking system launch, your shipments will appear here in real time."
      />
    </div>
  );
}
