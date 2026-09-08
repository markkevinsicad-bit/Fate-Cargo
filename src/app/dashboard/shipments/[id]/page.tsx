import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, MapPin, Package, Truck, FileText, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShipmentStatusBadge } from "@/components/ui/shipment-status-badge";
import { SpecialHandlingBadges } from "@/components/ui/special-handling-badges";
import { QrCodeDisplay } from "@/components/shared/qr-code-display";
import { SubmitReviewForm } from "@/components/dashboard/submit-review-form";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import {
  getShipmentById,
  getShipmentTrackingEvents,
  getCargoConditionRecords,
  getSignedPhotoUrls,
} from "@/lib/data/shipments";
import { formatDate, cubicMetersToDisplay } from "@/lib/utils";
import type { ShipmentStatus } from "@/lib/constants";

export default async function CustomerShipmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const { id } = await params;
  const { confirmed } = await searchParams;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const shipment = await getShipmentById(id);
  if (!shipment || shipment.customer_id !== profile.id) notFound();

  const [events, conditionRecords] = await Promise.all([
    getShipmentTrackingEvents(id),
    getCargoConditionRecords(id),
  ]);

  let existingReview: { rating: number; comment: string | null } | null = null;
  if (shipment.status === "delivered") {
    const supabase = await createClient();
    const { data } = await supabase.from("reviews").select("rating, comment").eq("shipment_id", id).maybeSingle();
    existingReview = data;
  }

  const allPhotoPaths = conditionRecords.flatMap((r) => r.photo_paths ?? []);
  const signedUrls = await getSignedPhotoUrls(allPhotoPaths);

  return (
    <div className="max-w-4xl space-y-6">
      {confirmed === "1" && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Booking confirmed! Your FATE Cargo ID and QR code are ready below.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-lg font-bold text-slate-900">{shipment.fate_cargo_id}</p>
          <p className="text-sm text-slate-500">Booked {formatDate(shipment.created_at)}</p>
        </div>
        <ShipmentStatusBadge status={shipment.status as ShipmentStatus} className="text-sm" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                <MapPin className="h-4 w-4 text-primary" /> Shipment Summary
              </h2>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <SummaryItem label="Service" value={shipment.services?.name ?? "—"} />
                <SummaryItem label="Destination" value={shipment.destinations?.name ?? "—"} />
                <SummaryItem label="Origin" value={shipment.origin_address} />
                {shipment.destination_address && (
                  <SummaryItem label="Delivery Address" value={shipment.destination_address} />
                )}
                <SummaryItem label="Cargo Category" value={shipment.cargo_categories?.name ?? "—"} />
                {shipment.cargo_description && (
                  <SummaryItem label="Description" value={shipment.cargo_description} />
                )}
                {shipment.number_of_packages && (
                  <SummaryItem label="Packages" value={String(shipment.number_of_packages)} />
                )}
                {shipment.weight_kg && <SummaryItem label="Weight" value={`${shipment.weight_kg} kg`} />}
                {shipment.length_cm && shipment.width_cm && shipment.height_cm && (
                  <SummaryItem
                    label="Dimensions"
                    value={`${shipment.length_cm} × ${shipment.width_cm} × ${shipment.height_cm} cm${
                      shipment.volume_cbm ? ` (${cubicMetersToDisplay(Number(shipment.volume_cbm))})` : ""
                    }`}
                  />
                )}
                <SummaryItem label="Pickup Required" value={shipment.pickup_required ? "Yes" : "No"} />
                {shipment.pickup_date && (
                  <SummaryItem label="Preferred Pickup" value={formatDate(shipment.pickup_date)} />
                )}
              </div>
              {shipment.special_handling.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase text-slate-500">Special Handling</p>
                  <SpecialHandlingBadges items={shipment.special_handling} />
                </div>
              )}
              {shipment.customer_notes && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase text-slate-500">Your Notes</p>
                  <p className="text-sm text-slate-600">{shipment.customer_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                <Truck className="h-4 w-4 text-primary" /> Tracking Timeline
              </h2>
              {events.length > 0 ? (
                <ol className="space-y-4 border-l-2 border-slate-100 pl-5">
                  {events.map((e, idx) => (
                    <li key={e.id} className="relative">
                      <span
                        className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white ${
                          idx === 0 ? "bg-primary" : "bg-slate-300"
                        }`}
                      />
                      <p className="font-medium text-slate-900">{e.title}</p>
                      {e.description && <p className="text-sm text-slate-500">{e.description}</p>}
                      {e.location && <p className="text-xs text-slate-400">{e.location}</p>}
                      <p className="text-xs text-slate-400">{formatDate(e.created_at)}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-slate-500">No tracking events yet.</p>
              )}
            </CardContent>
          </Card>

          {conditionRecords.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                  <FileText className="h-4 w-4 text-primary" /> Cargo Condition Records
                </h2>
                <div className="space-y-4">
                  {conditionRecords.map((r) => (
                    <div key={r.id} className="rounded-lg border border-slate-100 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold capitalize text-slate-900">
                          {r.stage.replace("_", " ")}
                        </p>
                        <p className="text-xs text-slate-400">{formatDate(r.recorded_at)}</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">Condition: {r.condition}</p>
                      {r.packaging_condition && (
                        <p className="text-sm text-slate-600">Packaging: {r.packaging_condition}</p>
                      )}
                      {r.notes && <p className="text-sm text-slate-500">{r.notes}</p>}
                      {r.photo_paths.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {r.photo_paths.map((p) =>
                            signedUrls[p] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={p}
                                src={signedUrls[p]}
                                alt="Cargo condition photo"
                                className="h-20 w-20 rounded-md object-cover"
                              />
                            ) : null,
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                <Package className="h-4 w-4 text-primary" /> QR Code
              </h2>
              <QrCodeDisplay token={shipment.qr_token} fateCargoId={shipment.fate_cargo_id} />
              <p className="mt-4 text-center text-xs text-slate-500">
                Show this QR code to FATE Cargo staff at pickup, receiving, or delivery.
              </p>
            </CardContent>
          </Card>

          <Button asChild variant="outline" className="w-full">
            <Link href={`/track?id=${shipment.fate_cargo_id}`}>Open Public Tracking</Link>
          </Button>

          {shipment.status === "delivered" && (
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                  <Star className="h-4 w-4 text-primary" /> Leave a Review
                </h2>
                <SubmitReviewForm
                  shipmentId={shipment.id}
                  existingRating={existingReview?.rating}
                  existingComment={existingReview?.comment ?? undefined}
                />
              </CardContent>
            </Card>
          )}

          <Button asChild variant="outline" className="w-full">
            <Link href={`/dashboard/book?repeat=${shipment.id}`}>Repeat This Booking</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="text-slate-800">{value}</p>
    </div>
  );
}
