import { Target } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getLeads } from "@/lib/data/growth";
import { AdminLeadRow } from "@/components/admin/admin-lead-row";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/lib/constants";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const leads = await getLeads(status, q);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Leads</h1>
      <p className="mb-6 text-slate-500">Track and follow up on inbound interest before it becomes a booking.</p>

      <AdminFilterBar
        searchPlaceholder="Search by name or phone…"
        statusOptions={LEAD_STATUSES.map((s) => ({ value: s, label: LEAD_STATUS_LABELS[s] }))}
      />

      {leads.length > 0 ? (
        <div className="mt-6 space-y-3">
          {leads.map((l) => (
            <AdminLeadRow key={l.id} lead={l} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          icon={<Target className="h-8 w-8" />}
          title="No leads yet."
          description="Leads submitted from the website's quick-quote widget will appear here."
        />
      )}
    </div>
  );
}
