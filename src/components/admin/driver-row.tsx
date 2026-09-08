"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setDriverActive } from "@/actions/drivers";

export function DriverRow({
  driver,
}: {
  driver: { id: string; full_name: string | null; phone: string | null; is_active: boolean; pickupCount: number; deliveryCount: number };
}) {
  const [active, setActive] = useState(driver.is_active);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !active;
    startTransition(async () => {
      const result = await setDriverActive(driver.id, next);
      if (result.success) {
        setActive(next);
        toast.success(next ? "Driver activated." : "Driver deactivated.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900">{driver.full_name ?? "Unnamed driver"}</p>
            <Badge variant={active ? "success" : "secondary"}>{active ? "Active" : "Inactive"}</Badge>
          </div>
          <p className="text-sm text-slate-500">{driver.phone ?? "—"}</p>
          <p className="text-xs text-slate-400">
            {driver.pickupCount} pickup{driver.pickupCount === 1 ? "" : "s"} · {driver.deliveryCount} deliver
            {driver.deliveryCount === 1 ? "y" : "ies"}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={toggle} disabled={isPending}>
          {active ? "Deactivate" : "Activate"}
        </Button>
      </CardContent>
    </Card>
  );
}
