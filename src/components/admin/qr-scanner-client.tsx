"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { QrScannerCamera } from "@/components/admin/qr-scanner-camera";
import { ScanResultPanel } from "@/components/admin/scan-result-panel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { scanQrToken } from "@/actions/warehouse";
import { QR_SCAN_TYPES, QR_SCAN_TYPE_LABELS, type QrScanType } from "@/lib/constants";

type ScannedShipment = Parameters<typeof ScanResultPanel>[0]["shipment"];

export function QrScannerClient() {
  const [scanType, setScanType] = useState<QrScanType>("validation");
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState<ScannedShipment | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleScan(token: string) {
    if (loading) return;
    setLoading(true);
    setError(null);
    const result = await scanQrToken(token, scanType);
    setLoading(false);
    if (result.success) {
      setShipment(result.shipment as unknown as ScannedShipment);
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  }

  function reset() {
    setShipment(null);
    setError(null);
  }

  if (shipment) {
    return <ScanResultPanel shipment={shipment} onReset={reset} />;
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-4">
          <Label htmlFor="scan_type">Scan Purpose</Label>
          <Select value={scanType} onValueChange={(v) => setScanType(v as QrScanType)}>
            <SelectTrigger id="scan_type" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QR_SCAN_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {QR_SCAN_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
          <Spinner /> Looking up shipment…
        </div>
      ) : (
        <QrScannerCamera onScan={handleScan} />
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}
