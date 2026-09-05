import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardProfilePage() {
  const profile = await getCurrentProfile();

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Profile</h1>
      <Card>
        <CardContent className="p-6">
          <ProfileForm
            initialFullName={profile?.full_name ?? ""}
            initialEmail={profile?.email ?? ""}
            phone={profile?.phone ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
