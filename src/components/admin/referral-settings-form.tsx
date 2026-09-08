"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { updateReferralSettings } from "@/actions/settings";

export function ReferralSettingsForm({
  initialDescription,
  initialActive,
}: {
  initialDescription: string;
  initialActive: boolean;
}) {
  const [description, setDescription] = useState(initialDescription);
  const [active, setActive] = useState(initialActive);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateReferralSettings(description, active);
      if (result.success) toast.success("Referral settings saved.");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="flex items-center gap-2">
          <Checkbox id="referral_active" checked={active} onCheckedChange={(v) => setActive(!!v)} />
          <Label htmlFor="referral_active">Referral tracking is active</Label>
        </div>
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
