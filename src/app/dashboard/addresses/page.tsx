import { MapPin } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { getSavedAddresses } from "@/lib/data/growth";
import { NewAddressForm } from "@/components/dashboard/new-address-form";
import { SavedAddressRow } from "@/components/dashboard/saved-address-row";

export default async function DashboardAddressesPage() {
  const profile = await getCurrentProfile();
  const addresses = await getSavedAddresses(profile!.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Saved Addresses</h1>
        <p className="mt-1 text-slate-500">Save frequently used pickup and delivery addresses to speed up booking.</p>
      </div>

      <NewAddressForm />

      {addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((a) => (
            <SavedAddressRow key={a.id} address={a} />
          ))}
        </div>
      ) : (
        <EmptyState icon={<MapPin className="h-8 w-8" />} title="No saved addresses yet." />
      )}
    </div>
  );
}
