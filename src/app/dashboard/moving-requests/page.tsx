import Link from "next/link";
import { Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { RequestStatusBadge } from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { formatDate } from "@/lib/utils";
import { MOVING_TYPE_LABELS, type RequestStatus, type MovingType } from "@/lib/constants";

export default async function DashboardMovingRequestsPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from("moving_requests")
    .select("*")
    .eq("customer_id", profile!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Moving Requests</h1>
        <Button asChild size="sm">
          <Link href="/moving">New Moving Request</Link>
        </Button>
      </div>

      {requests && requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {MOVING_TYPE_LABELS[r.moving_type as MovingType]}: {r.pickup_location} → {r.destination_location}
                  </p>
                  <p className="text-sm text-slate-500">
                    Submitted {formatDate(r.created_at)}
                    {r.preferred_date ? ` · Preferred date: ${formatDate(r.preferred_date)}` : ""}
                  </p>
                  {r.quoted_amount == null && r.status === "requested" && (
                    <p className="mt-1 text-xs text-slate-400">
                      Our team is reviewing your request. You&apos;ll be notified as soon as a quote is ready.
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {r.quoted_amount != null && (
                    <span className="font-semibold text-slate-900">
                      ₱{Number(r.quoted_amount).toLocaleString()}
                    </span>
                  )}
                  <RequestStatusBadge status={r.status as RequestStatus} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Truck className="h-8 w-8" />}
          title="No moving requests yet."
          description="Submit a Lipat Bahay, office, or condo moving request and it will appear here with its status and quote."
          action={
            <Button asChild>
              <Link href="/moving">Request a Move</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
