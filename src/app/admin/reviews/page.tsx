import { Star } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getReviews } from "@/lib/data/growth";
import { ReviewVisibilityToggle } from "@/components/admin/review-visibility-toggle";
import { formatDate } from "@/lib/utils";

export default async function AdminReviewsPage() {
  const reviews = await getReviews(false);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Reviews</h1>
      <p className="mb-6 text-slate-500">Moderate customer reviews before they appear on the public site.</p>

      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5 text-secondary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-secondary" : "fill-none"}`} />
                      ))}
                    </div>
                    <Badge variant={r.is_visible ? "success" : "secondary"}>
                      {r.is_visible ? "Published" : "Hidden"}
                    </Badge>
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-slate-700">&ldquo;{r.comment}&rdquo;</p>}
                  <p className="mt-2 text-xs text-slate-400">
                    {r.profiles?.full_name ?? "Customer"} · {r.shipments?.fate_cargo_id} ·{" "}
                    {r.shipments?.destinations?.name} · {formatDate(r.created_at)}
                  </p>
                </div>
                <ReviewVisibilityToggle reviewId={r.id} isVisible={r.is_visible} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Star className="h-8 w-8" />}
          title="No reviews yet."
          description="Reviews submitted by customers after delivery will appear here for moderation."
        />
      )}
    </div>
  );
}
