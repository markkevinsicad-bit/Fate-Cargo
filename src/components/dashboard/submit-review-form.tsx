"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitReview } from "@/actions/reviews";

export function SubmitReviewForm({
  shipmentId,
  existingRating,
  existingComment,
}: {
  shipmentId: string;
  existingRating?: number;
  existingComment?: string;
}) {
  const [rating, setRating] = useState(existingRating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingComment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingRating);

  async function handleSubmit() {
    if (rating < 1) {
      toast.error("Please select a rating.");
      return;
    }
    setSubmitting(true);
    const result = await submitReview(shipmentId, rating, comment);
    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
      toast.success("Thanks for your review!");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
            className="p-0.5"
          >
            <Star
              className={`h-7 w-7 ${
                star <= (hoverRating || rating) ? "fill-secondary text-secondary" : "text-slate-300"
              }`}
            />
          </button>
        ))}
      </div>
      <Textarea
        rows={3}
        placeholder="Tell us about your experience (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button size="sm" onClick={handleSubmit} disabled={submitting}>
        {submitted ? "Update Review" : "Submit Review"}
      </Button>
      {submitted && <p className="text-xs text-slate-400">Your review will appear publicly once approved by our team.</p>}
    </div>
  );
}
