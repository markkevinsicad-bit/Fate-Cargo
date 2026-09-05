import { BarChart3 } from "lucide-react";
import { ComingSoonModule } from "@/components/admin/coming-soon";

export default function AdminReportsPage() {
  return (
    <ComingSoonModule
      icon={BarChart3}
      title="Reports"
      description="Operational and revenue reports are built once real shipment and booking data exists in Phase 3."
    />
  );
}
