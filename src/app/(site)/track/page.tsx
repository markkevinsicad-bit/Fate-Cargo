import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackingForm } from "@/components/forms/tracking-form";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = { title: "Track Shipment" };

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <div className="container-page max-w-2xl py-14">
      <h1 className="text-3xl font-bold text-slate-900">Track Your Cargo</h1>
      <p className="mt-2 text-slate-500">
        Enter your FATE Cargo ID to see the current status and tracking history. You can find your
        FATE Cargo ID in your booking confirmation or your {COMPANY.name} 360 dashboard.
      </p>

      <div className="mt-8">
        <Suspense fallback={<div className="h-20" />}>
          <TrackingForm initialId={id} />
        </Suspense>
      </div>
    </div>
  );
}
