import { Warehouse } from "lucide-react";
import { ComingSoonModule } from "@/components/admin/coming-soon";

export default function AdminWarehousePage() {
  return (
    <ComingSoonModule
      icon={Warehouse}
      title="Warehouse"
      description="Cargo receiving, condition passport photos and consolidation tools are built in Phase 2."
    />
  );
}
