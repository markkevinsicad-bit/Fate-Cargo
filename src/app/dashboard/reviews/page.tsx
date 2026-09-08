import { Star } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { formatDate } from "@/lib/utils";

export default async function DashboardReviewsPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, shipments(fate_cargo_id)")
    .eq("customer_id", profile!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My Reviews</h1>

      {reviews && reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5 text-secondary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-secondary" : "fill-none"}`} />
                    ))}
                  </div>
                  <Badge variant={r.is_visible ? "success" : "secondary"}>
                    {r.is_visible ? "Published" : "Pending Approval"}
                  </Badge>
                </div>
                {r.comment && <p className="mt-2 text-sm text-slate-700">{r.comment}</p>}
                <p className="mt-2 text-xs text-slate-400">
                  <Link href={`/dashboard/shipments/${r.shipment_id}`} className="font-mono hover:underline">
                    {r.shipments?.fate_cargo_id}
                  </Link>{" "}
                  · {formatDate(r.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Star className="h-8 w-8" />}
          title="No reviews submitted yet."
          description="After a shipment is delivered, you can leave a review from its shipment details page."
        />
      )}
    </div>
  );
}
