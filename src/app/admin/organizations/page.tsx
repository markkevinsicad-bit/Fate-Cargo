import Link from "next/link";
import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllOrganizations } from "@/lib/data/growth";
import { NewOrganizationForm } from "@/components/admin/new-organization-form";

export default async function AdminOrganizationsPage() {
  const organizations = await getAllOrganizations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Business Accounts</h1>
        <p className="text-slate-500">Manage business organizations and their authorized users.</p>
      </div>

      <NewOrganizationForm />

      {organizations.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Link key={org.id} href={`/admin/organizations/${org.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{org.name}</p>
                    <Badge variant={org.is_active ? "success" : "secondary"}>
                      {org.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {org.contact_email && <p className="mt-1 text-sm text-slate-500">{org.contact_email}</p>}
                  {org.contact_phone && <p className="text-sm text-slate-500">{org.contact_phone}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Building2 className="h-8 w-8" />}
          title="No business organizations yet."
          description="Create one above to onboard a recurring business customer."
        />
      )}
    </div>
  );
}
