"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload, Download, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bookingSchema } from "@/lib/validation/schemas";
import { submitBulkBookings, type BulkBookingRowResult } from "@/actions/bulk-booking";

const TEMPLATE_HEADERS = [
  "origin_address",
  "origin_city",
  "destination_address",
  "recipient_name",
  "recipient_phone",
  "cargo_description",
  "number_of_packages",
  "weight_kg",
  "length_cm",
  "width_cm",
  "height_cm",
  "pickup_required",
];

type ParsedRow = { data: Record<string, string>; errors: string[] };

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

function validateRow(row: Record<string, string>): string[] {
  const parsed = bookingSchema.safeParse({
    origin_address: row.origin_address,
    origin_city: row.origin_city,
    destination_address: row.destination_address,
    recipient_name: row.recipient_name,
    recipient_phone: row.recipient_phone,
    cargo_description: row.cargo_description,
    number_of_packages: row.number_of_packages,
    weight_kg: row.weight_kg,
    length_cm: row.length_cm,
    width_cm: row.width_cm,
    height_cm: row.height_cm,
    pickup_required: row.pickup_required?.toLowerCase() === "true",
    special_handling: [],
  });
  if (parsed.success) return [];
  return parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`);
}

export function BulkBookingUpload({ organizationId }: { organizationId: string }) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [results, setResults] = useState<BulkBookingRowResult[] | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDownloadTemplate() {
    const csv = TEMPLATE_HEADERS.join(",") + "\n" + "123 Main St,Quezon City,456 Rizal Ave,Juan Dela Cruz,09171234567,Boxes of goods,3,25.5,40,30,30,true";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fate-cargo-bulk-booking-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const parsed = parseCsv(text);
      setRows(parsed.map((data) => ({ data, errors: validateRow(data) })));
      setResults(null);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const invalidCount = rows.length - validCount;

  async function handleConfirmImport() {
    const validRows = rows.filter((r) => r.errors.length === 0).map((r) => r.data);
    if (validRows.length === 0) {
      toast.error("No valid rows to import.");
      return;
    }
    setImporting(true);
    const res = await submitBulkBookings(validRows, organizationId);
    setImporting(false);
    setResults(res);
    const successCount = res.filter((r) => r.success).length;
    toast.success(`${successCount} of ${res.length} bookings created.`);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-6">
          <div>
            <p className="font-semibold text-slate-900">1. Download the CSV template</p>
            <p className="text-sm text-slate-500">Fill it in with your shipment details, one row per booking.</p>
          </div>
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="h-4 w-4" /> Download Template
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-6">
          <div>
            <p className="font-semibold text-slate-900">2. Upload your completed CSV</p>
            <p className="text-sm text-slate-500">We&apos;ll validate every row before anything is booked.</p>
          </div>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" /> Upload CSV
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
        </CardContent>
      </Card>

      {rows.length > 0 && !results && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <Badge variant="success">{validCount} valid</Badge>
              {invalidCount > 0 && <Badge variant="destructive">{invalidCount} with errors</Badge>}
            </div>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className={`rounded-md border p-3 text-sm ${
                    row.errors.length > 0 ? "border-red-200 bg-red-50" : "border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    {row.errors.length > 0 ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    )}
                    Row {i + 1}: {row.data.origin_address || "(no origin)"} → {row.data.destination_address || "(no destination)"}
                  </div>
                  {row.errors.length > 0 && (
                    <ul className="mt-1 list-disc pl-6 text-xs text-red-700">
                      {row.errors.map((e, j) => (
                        <li key={j}>{e}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <Button className="mt-4" onClick={handleConfirmImport} disabled={importing || validCount === 0}>
              {importing && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Import ({validCount} booking{validCount === 1 ? "" : "s"})
            </Button>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card>
          <CardContent className="p-6">
            <p className="mb-3 font-semibold text-slate-900">Import Results</p>
            <div className="space-y-1">
              {results.map((r) => (
                <div key={r.row} className="flex items-center justify-between text-sm">
                  <span>Row {r.row}</span>
                  {r.success ? (
                    <span className="font-mono text-emerald-700">{r.fateCargoId}</span>
                  ) : (
                    <span className="text-red-600">{r.error}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
