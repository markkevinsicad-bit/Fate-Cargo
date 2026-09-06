"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateShipmentInternalNotes } from "@/actions/admin-shipments";

export function AdminInternalNotesForm({
  shipmentId,
  initialNotes,
}: {
  shipmentId: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateShipmentInternalNotes(shipmentId, notes);
      if (result.success) toast.success("Internal notes saved.");
      else toast.error(result.error);
    });
  }

  return (
    <div className="space-y-2">
      <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button size="sm" onClick={handleSave} disabled={isPending}>
        Save Notes
      </Button>
    </div>
  );
}
