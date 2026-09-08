import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { getUserOrganizations } from "@/lib/data/growth";
import { BulkBookingUpload } from "@/components/dashboard/bulk-booking-upload";

export default async function BulkBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const memberships = await getUserOrganizations(profile!.id);
  const membership = memberships.find((m) => m.business_organizations?.id === id);
  if (!membership) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">
        Bulk Booking — {membership.business_organizations?.name}
      </h1>
      <p className="mb-6 text-slate-500">
        Upload multiple bookings at once. Every row is validated before anything is created - invalid rows
        are skipped and clearly listed.
      </p>

      <BulkBookingUpload organizationId={id} />
    </div>
  );
}
