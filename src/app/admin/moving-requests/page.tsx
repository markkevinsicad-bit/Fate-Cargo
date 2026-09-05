import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { AdminMovingRow } from "@/components/admin/admin-moving-row";

export default async function AdminMovingRequestsPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("moving_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Moving Requests</h1>
      <p className="mb-6 text-slate-500">Lipat Bahay, office and condo moving requests from customers.</p>

      {requests && requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((r) => (
            <AdminMovingRow key={r.id} request={r} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ClipboardList className="h-8 w-8" />}
          title="No moving requests yet."
          description="Submitted moving requests from the public website will appear here."
        />
      )}
    </div>
  );
}
