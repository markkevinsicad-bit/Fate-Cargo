import { ClipboardList } from "lucide-react";
import { ComingSoonModule } from "@/components/admin/coming-soon";

export default function AdminBookingsPage() {
  return (
    <ComingSoonModule
      icon={ClipboardList}
      title="Bookings"
      description="Booking management, FATE Cargo ID assignment and QR generation are built in Phase 2."
    />
  );
}
