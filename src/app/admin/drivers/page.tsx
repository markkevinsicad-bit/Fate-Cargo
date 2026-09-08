import { UserCog } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getAllDriversWithStats } from "@/lib/data/growth";
import { DriverRow } from "@/components/admin/driver-row";
import { PromoteDriverForm } from "@/components/admin/promote-driver-form";

export default async function AdminDriversPage() {
  const drivers = await getAllDriversWithStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Drivers</h1>
        <p className="text-slate-500">
          Manage driver accounts. Deactivating a driver preserves their pickup/delivery history but stops new
          assignments.
        </p>
      </div>

      <PromoteDriverForm />

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
          description="Promote an existing customer account to driver using the form above."
        />
      )}
    </div>
  );
}
