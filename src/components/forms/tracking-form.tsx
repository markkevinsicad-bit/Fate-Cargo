"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Search, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { ShipmentStatusBadge } from "@/components/ui/shipment-status-badge";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { ShipmentStatus } from "@/lib/constants";

type TrackResult = {
  fate_cargo_id: string;
  status: ShipmentStatus;
  destination_name: string | null;
  destination_region: string | null;
  service_name: string | null;
  created_at: string;
  timeline: { status: ShipmentStatus; title: string; location: string | null; created_at: string }[];
};

export function TrackingForm({ initialId }: { initialId?: string }) {
  const [fateCargoId, setFateCargoId] = useState(initialId ?? "");
  const [result, setResult] = useState<TrackResult | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!fateCargoId.trim()) return;
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("track_shipment_public", {
        p_fate_cargo_id: fateCargoId.trim(),
      });
      if (error) {
        setError("Something went wrong. Please try again.");
        setResult(undefined);
        return;
      }
      setResult((data as TrackResult | null) ?? null);
    });
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={fateCargoId}
          onChange={(e) => setFateCargoId(e.target.value)}
          placeholder="e.g. FATE-2026-001294"
          className="font-mono"
        />
        <Button type="submit" disabled={isPending} className="sm:w-40">
          {isPending ? <Spinner className="text-white" /> : <Search className="h-4 w-4" />}
          Track
        </Button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {result === null && (
        <EmptyState
          className="mt-8"
          icon={<PackageSearch className="h-8 w-8" />}
          title="No shipment found for that FATE Cargo ID."
          description="Double-check the ID and try again, or contact us if you believe this is an error."
        />
      )}

      {result && (
        <Card className="mt-8">
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-lg font-bold text-slate-900">{result.fate_cargo_id}</p>
              <ShipmentStatusBadge status={result.status} className="text-sm" />
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Destination</p>
                <p className="text-slate-800">{result.destination_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Service</p>
                <p className="text-slate-800">{result.service_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Booked</p>
                <p className="text-slate-800">{formatDate(result.created_at)}</p>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-slate-900">Tracking Timeline</p>
              {result.timeline.length > 0 ? (
                <ol className="space-y-3 border-l-2 border-slate-100 pl-5">
                  {[...result.timeline].reverse().map((e, idx) => (
                    <li key={idx} className="relative">
                      <span
                        className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white ${
                          idx === 0 ? "bg-primary" : "bg-slate-300"
                        }`}
                      />
                      <p className="text-sm font-medium text-slate-900">{e.title}</p>
                      {e.location && <p className="text-xs text-slate-500">{e.location}</p>}
                      <p className="text-xs text-slate-400">{formatDate(e.created_at)}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-slate-500">No tracking updates yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
