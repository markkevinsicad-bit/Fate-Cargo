import { MapPin } from "lucide-react";
import { ComingSoonModule } from "@/components/admin/coming-soon";

export default function AdminDeliveryPage() {
  return (
    <ComingSoonModule
      icon={MapPin}
      title="Delivery"
      description="Driver delivery workflows and proof of delivery are built in Phase 3."
    />
  );
}
