import { Package } from "lucide-react";
import { ComingSoonModule } from "@/components/admin/coming-soon";

export default function AdminShipmentsPage() {
  return (
    <ComingSoonModule
      icon={Package}
      title="Shipments"
      description="Full shipment lifecycle tracking (warehouse, consolidation, loading, transit, delivery) is built in Phase 2."
    />
  );
}
