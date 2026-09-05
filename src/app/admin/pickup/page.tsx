import { Truck } from "lucide-react";
import { ComingSoonModule } from "@/components/admin/coming-soon";

export default function AdminPickupPage() {
  return (
    <ComingSoonModule
      icon={Truck}
      title="Pickup"
      description="Driver pickup assignment and tracking are built in Phase 3."
    />
  );
}
