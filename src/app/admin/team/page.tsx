import { UsersRound } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getInternalAccounts } from "@/lib/data/growth";
import { CreateTeamAccountForm } from "@/components/admin/create-team-account-form";
import { TeamAccountRow } from "@/components/admin/team-account-row";

export default async function AdminTeamPage() {
  const accounts = await getInternalAccounts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Team Accounts</h1>
        <p className="text-slate-500">
          Create and manage email + password accounts for admin, staff, warehouse, and driver roles.
          Customers always sign in with phone + OTP - this page never touches customer accounts.
        </p>
      </div>

      <CreateTeamAccountForm />

      {accounts.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <TeamAccountRow key={a.id} account={a} />
          ))}
        </div>
      ) : (
        <EmptyState icon={<UsersRound className="h-8 w-8" />} title="No team accounts yet." />
      )}
    </div>
  );
}
