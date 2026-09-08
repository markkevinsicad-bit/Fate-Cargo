import { BookingForm } from "@/components/forms/booking-form";
import { getActiveDestinations, getActiveCargoCategories, getActiveServices } from "@/lib/data/public";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { getShipmentById } from "@/lib/data/shipments";

export const metadata = { title: "Book a Shipment" };

export default async function BookShipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ repeat?: string }>;
}) {
  const { repeat } = await searchParams;
  const [services, destinations, cargoCategories, profile] = await Promise.all([
    getActiveServices(),
    getActiveDestinations(),
    getActiveCargoCategories(),
    getCurrentProfile(),
  ]);

  // Repeat booking: copy allowed customer-facing fields only from a
  // previous shipment the caller owns. Never copies internal_notes, and
  // the resulting booking always gets a brand-new FATE Cargo ID and QR
  // token via create_booking() - nothing here reuses those.
  let repeatFrom: Awaited<ReturnType<typeof getShipmentById>> | null = null;
  if (repeat) {
    const source = await getShipmentById(repeat);
    if (source && source.customer_id === profile?.id) {
      repeatFrom = source;
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">
        {repeatFrom ? "Repeat Booking" : "Book a Shipment"}
      </h1>
      <p className="mt-1 text-slate-500">
        {repeatFrom
          ? `We've pre-filled this booking from ${repeatFrom.fate_cargo_id}. Review and edit before confirming - a new FATE Cargo ID and QR code will be generated.`
          : "Fill in the details below. You'll review everything before your booking is confirmed."}
      </p>

      <div className="mt-8">
        <BookingForm
          services={services}
          destinations={destinations}
          cargoCategories={cargoCategories}
          customer={{
            fullName: profile?.full_name ?? "",
            phone: profile?.phone ?? "",
            email: profile?.email ?? "",
          }}
          initialValues={
            repeatFrom
              ? {
                  service_id: repeatFrom.service_id ?? "",
                  origin_address: repeatFrom.origin_address,
                  origin_city: repeatFrom.origin_city ?? "",
                  origin_contact_name: repeatFrom.origin_contact_name ?? "",
                  origin_contact_phone: repeatFrom.origin_contact_phone ?? "",
                  pickup_required: repeatFrom.pickup_required,
                  destination_id: repeatFrom.destination_id ?? "",
                  destination_address: repeatFrom.destination_address ?? "",
                  recipient_name: repeatFrom.recipient_name ?? "",
                  recipient_phone: repeatFrom.recipient_phone ?? "",
                  delivery_notes: repeatFrom.delivery_notes ?? "",
                  cargo_category_id: repeatFrom.cargo_category_id ?? "",
                  cargo_description: repeatFrom.cargo_description ?? "",
                  number_of_packages: repeatFrom.number_of_packages ?? undefined,
                  package_type: repeatFrom.package_type ?? "",
                  weight_kg: repeatFrom.weight_kg ?? undefined,
                  length_cm: repeatFrom.length_cm ?? undefined,
                  width_cm: repeatFrom.width_cm ?? undefined,
                  height_cm: repeatFrom.height_cm ?? undefined,
                  special_handling: repeatFrom.special_handling as never,
                  special_handling_notes: repeatFrom.special_handling_notes ?? "",
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
