import Link from "next/link";
import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { getUserOrganizations } from "@/lib/data/growth";

export default async function DashboardOrganizationsPage() {
  const profile = await getCurrentProfile();
  const memberships = await getUserOrganizations(profile!.id);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Business Accounts</h1>
      <p className="mb-6 text-slate-500">Organizations you&apos;re authorized to book and manage shipments for.</p>

      {memberships.length > 0 ? (
        <div className="space-y-3">
          {memberships.map((m) => (
            <Link key={m.business_organizations?.id} href={`/dashboard/organizations/${m.business_organizations?.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-primary" />
                    <p className="font-semibold text-slate-900">{m.business_organizations?.name}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">{m.org_role}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Building2 className="h-8 w-8" />}
          title="You're not part of any business account yet."
          description="Contact FATE Cargo to set up a business account for your organization."
        />
      )}
    </div>
  );
}
