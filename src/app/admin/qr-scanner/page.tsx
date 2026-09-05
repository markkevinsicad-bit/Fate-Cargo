import { QrCode } from "lucide-react";
import { ComingSoonModule } from "@/components/admin/coming-soon";

export default function AdminQrScannerPage() {
  return (
    <ComingSoonModule
      icon={QrCode}
      title="QR Scanner"
      description="Mobile-friendly QR scanning for warehouse, pickup and delivery workflows is built in Phase 2."
    />
  );
}
