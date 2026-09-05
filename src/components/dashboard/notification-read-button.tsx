"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { markNotificationRead } from "@/actions/profile";

export function NotificationReadButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => startTransition(async () => {
        await markNotificationRead(id);
      })}
    >
      Mark as read
    </Button>
  );
}
