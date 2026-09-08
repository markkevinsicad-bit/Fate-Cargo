import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ShipmentStatusBadge } from "@/components/ui/shipment-status-badge";
import { SpecialHandlingBadges } from "@/components/ui/special-handling-badges";
import { PickupStatusBadge, DeliveryStatusBadge } from "@/components/ui/pickup-delivery-badges";
import { QrCodeDisplay } from "@/components/shared/qr-code-display";
import {
  getShipmentById,
  getShipmentTrackingEvents,
  getCargoConditionRecords,
  getSignedPhotoUrls,
  getQrScanLogs,
  getLoadingTrips,
} from "@/lib/data/shipments";
import { getPickupByShipmentId, getDeliveryByShipmentId } from "@/lib/data/pickups-deliveries";
import { formatDate, cubicMetersToDisplay } from "@/lib/utils";
import type { ShipmentStatus, PickupStatus, DeliveryStatus } from "@/lib/constants";
import { AdminShipmentActions } from "@/components/admin/admin-shipment-actions";
import { AdminInternalNotesForm } from "@/components/admin/admin-internal-notes-form";
import { AdminTripAssignForm } from "@/components/admin/admin-trip-assign-form";
import { CreatePickupForm } from "@/components/admin/create-pickup-form";
import { CreateDeliveryForm } from "@/components/admin/create-delivery-form";

export default async function AdminShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shipment = await getShipmentById(id);
  if (!shipment) notFound();

  const [events, conditionRecords, scanLogs, loadingTrips, pickup, delivery] = await Promise.all([
    getShipmentTrackingEvents(id),
    getCargoConditionRecords(id),
    getQrScanLogs(id),
    getLoadingTrips(),
    getPickupByShipmentId(id),
    getDeliveryByShipmentId(id),
  ]);

  const allPhotoPaths = conditionRecords.flatMap((r) => r.photo_paths ?? []);
  const signedUrls = await getSignedPhotoUrls(allPhotoPaths);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xl font-bold text-slate-900">{shipment.fate_cargo_id}</p>
          <p className="text-sm text-slate-500">Booked {formatDate(shipment.created_at)}</p>
        </div>
        <ShipmentStatusBadge status={shipment.status as ShipmentStatus} className="text-sm" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="font-semibold text-slate-900">Customer & Booking</h2>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <Info label="Customer" value={shipment.profiles?.full_name ?? "—"} />
                <Info label="Phone" value={shipment.profiles?.phone ?? "—"} />
                {shipment.profiles?.email && <Info label="Email" value={shipment.profiles.email} />}
                <Info label="Service" value={shipment.services?.name ?? "—"} />
                <Info label="Destination" value={shipment.destinations?.name ?? "—"} />
                <Info label="Origin" value={shipment.origin_address} />
                {shipment.destination_address && (
                  <Info label="Delivery Address" value={shipment.destination_address} />
                )}
                {shipment.origin_contact_name && (
                  <Info label="Origin Contact" value={`${shipment.origin_contact_name} · ${shipment.origin_contact_phone ?? ""}`} />
                )}
                {shipment.recipient_name && (
                  <Info label="Recipient" value={`${shipment.recipient_name} · ${shipment.recipient_phone ?? ""}`} />
                )}
                <Info label="Pickup Required" value={shipment.pickup_required ? "Yes" : "No"} />
                {shipment.pickup_date && <Info label="Preferred Pickup" value={formatDate(shipment.pickup_date)} />}
                <Info label="Cargo Category" value={shipment.cargo_categories?.name ?? "—"} />
                {shipment.cargo_description && <Info label="Description" value={shipment.cargo_description} />}
                {shipment.number_of_packages && <Info label="Packages" value={String(shipment.number_of_packages)} />}
                {shipment.weight_kg && <Info label="Weight" value={`${shipment.weight_kg} kg`} />}
                {shipment.length_cm && shipment.width_cm && shipment.height_cm && (
                  <Info
                    label="Dimensions"
                    value={`${shipment.length_cm} × ${shipment.width_cm} × ${shipment.height_cm} cm${
                      shipment.volume_cbm ? ` (${cubicMetersToDisplay(Number(shipment.volume_cbm))})` : ""
                    }`}
                  />
                )}
              </div>
              {shipment.special_handling.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase text-slate-500">Special Handling</p>
                  <SpecialHandlingBadges items={shipment.special_handling} />
                  {shipment.special_handling_notes && (
                    <p className="mt-1 text-sm text-slate-600">{shipment.special_handling_notes}</p>
                  )}
                </div>
              )}
              {shipment.customer_notes && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase text-slate-500">Customer Notes</p>
                  <p className="text-sm text-slate-600">{shipment.customer_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 font-semibold text-slate-900">Tracking History</h2>
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
                <h2 className="mb-4 font-semibold text-slate-900">Cargo Condition Records</h2>
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
                              <img key={p} src={signedUrls[p]} alt="Cargo condition" className="h-20 w-20 rounded-md object-cover" />
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

          {scanLogs.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 font-semibold text-slate-900">QR Scan History</h2>
                <div className="space-y-2">
                  {scanLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-slate-700">
                        {log.scan_type} · {log.scan_result.replace("_", " ")}
                        {log.profiles?.full_name ? ` by ${log.profiles.full_name}` : ""}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(log.created_at)}</span>
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
              <h2 className="mb-4 font-semibold text-slate-900">QR Code</h2>
              <QrCodeDisplay token={shipment.qr_token} fateCargoId={shipment.fate_cargo_id} size={200} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="font-semibold text-slate-900">Update Status</h2>
              <AdminShipmentActions shipmentId={shipment.id} currentStatus={shipment.status as ShipmentStatus} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="font-semibold text-slate-900">Pickup</h2>
              {pickup ? (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-500">{pickup.pickup_reference}</span>
                    <PickupStatusBadge status={pickup.status as PickupStatus} />
                  </div>
                  <p className="text-slate-600">{pickup.pickup_address}</p>
                  {pickup.scheduled_date && <p className="text-xs text-slate-400">{formatDate(pickup.scheduled_date)}</p>}
                </div>
              ) : shipment.pickup_required ? (
                <CreatePickupForm
                  shipmentId={shipment.id}
                  defaultAddress={shipment.origin_address}
                  defaultContactName={shipment.origin_contact_name ?? undefined}
                  defaultContactPhone={shipment.origin_contact_phone ?? undefined}
                />
              ) : (
                <p className="text-sm text-slate-500">This shipment does not require pickup.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="font-semibold text-slate-900">Delivery</h2>
              {delivery ? (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-500">{delivery.delivery_reference}</span>
                    <DeliveryStatusBadge status={delivery.status as DeliveryStatus} />
                  </div>
                  <p className="text-slate-600">{delivery.destination_address}</p>
                  {delivery.pod_recipient_name && (
                    <p className="text-xs text-emerald-700">Delivered to {delivery.pod_recipient_name}</p>
                  )}
                </div>
              ) : (
                <CreateDeliveryForm
                  shipmentId={shipment.id}
                  defaultAddress={shipment.destination_address ?? undefined}
                  defaultRecipientName={shipment.recipient_name ?? undefined}
                  defaultRecipientPhone={shipment.recipient_phone ?? undefined}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="font-semibold text-slate-900">Assign to Loading Trip</h2>
              <AdminTripAssignForm
                shipmentId={shipment.id}
                currentTripId={shipment.loading_trip_id}
                trips={loadingTrips}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="font-semibold text-slate-900">Internal Notes</h2>
              <p className="text-xs text-slate-500">Visible to staff/admin only - never shown to the customer.</p>
              <AdminInternalNotesForm shipmentId={shipment.id} initialNotes={shipment.internal_notes ?? ""} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="text-slate-800">{value}</p>
    </div>
  );
}
