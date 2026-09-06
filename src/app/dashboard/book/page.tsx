import { BookingForm } from "@/components/forms/booking-form";
import { getActiveDestinations, getActiveCargoCategories, getActiveServices } from "@/lib/data/public";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";

export const metadata = { title: "Book a Shipment" };

export default async function BookShipmentPage() {
  const [services, destinations, cargoCategories, profile] = await Promise.all([
    getActiveServices(),
    getActiveDestinations(),
    getActiveCargoCategories(),
    getCurrentProfile(),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Book a Shipment</h1>
      <p className="mt-1 text-slate-500">
        Fill in the details below. You&apos;ll review everything before your booking is confirmed.
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
        />
      </div>
    </div>
  );
}
