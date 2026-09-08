import Link from "next/link";
import { UserCog, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getAllDriversWithStats } from "@/lib/data/growth";
import { DriverRow } from "@/components/admin/driver-row";

export default async function AdminDriversPage() {
  const drivers = await getAllDriversWithStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-slate-900">Drivers</h1>
          <p className="text-slate-500">
            Deactivating a driver preserves their pickup/delivery history but stops new assignments and sign-in.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/team">
            <Plus className="h-4 w-4" /> Create Driver Account
          </Link>
        </Button>
      </div>

      {drivers.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {drivers.map((d) => (
            <DriverRow key={d.id} driver={d} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<UserCog className="h-8 w-8" />}
          title="No drivers yet."
          description="Create a driver account (email + password) from Team Accounts."
          action={
            <Button asChild>
              <Link href="/admin/team">Create Driver Account</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
