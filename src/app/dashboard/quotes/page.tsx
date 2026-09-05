import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { RequestStatusBadge } from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { formatDate } from "@/lib/utils";
import type { RequestStatus } from "@/lib/constants";

export default async function DashboardQuotesPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: quotes } = await supabase
    .from("quote_requests")
    .select("*")
    .eq("customer_id", profile!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Quote Requests</h1>
        <Button asChild size="sm">
          <Link href="/get-quote">New Quote</Link>
        </Button>
      </div>

      {quotes && quotes.length > 0 ? (
        <div className="space-y-3">
          {quotes.map((q) => (
            <Card key={q.id}>
              <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {q.origin} → {q.destination_text || "Destination TBD"}
                  </p>
                  <p className="text-sm text-slate-500">
                    Submitted {formatDate(q.created_at)}
                    {q.cargo_description ? ` · ${q.cargo_description}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {q.quoted_amount != null && (
                    <span className="font-semibold text-slate-900">
                      ₱{Number(q.quoted_amount).toLocaleString()}
                    </span>
                  )}
                  <RequestStatusBadge status={q.status as RequestStatus} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="No quote requests yet."
          description="Submit a quote request and it will appear here with its status."
          action={
            <Button asChild>
              <Link href="/get-quote">Get a Quote</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
