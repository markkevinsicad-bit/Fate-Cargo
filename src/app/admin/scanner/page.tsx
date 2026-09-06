import { QrScannerClient } from "@/components/admin/qr-scanner-client";

export default function AdminScannerPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">QR Scanner</h1>
      <p className="mb-6 text-slate-500">Scan a shipment QR code, or enter the FATE Cargo ID manually.</p>
      <QrScannerClient />
    </div>
  );
}
