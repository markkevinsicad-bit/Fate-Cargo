"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setReviewVisibility } from "@/actions/reviews";

export function ReviewVisibilityToggle({ reviewId, isVisible }: { reviewId: string; isVisible: boolean }) {
  const [visible, setVisible] = useState(isVisible);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !visible;
    startTransition(async () => {
      const result = await setReviewVisibility(reviewId, next);
      if (result.success) {
        setVisible(next);
        toast.success(next ? "Review published." : "Review hidden.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button size="sm" variant="outline" onClick={toggle} disabled={isPending}>
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      {visible ? "Hide" : "Publish"}
    </Button>
  );
}
