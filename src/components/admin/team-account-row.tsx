"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setTeamMemberActive } from "@/actions/team";

export function TeamAccountRow({
  account,
}: {
  account: { id: string; full_name: string | null; email: string | null; role: string; is_active: boolean };
}) {
  const [active, setActive] = useState(account.is_active);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !active;
    startTransition(async () => {
      const result = await setTeamMemberActive(account.id, next);
      if (result.success) {
        setActive(next);
        toast.success(next ? "Account activated." : "Account deactivated.");
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
            <p className="font-semibold text-slate-900">{account.full_name ?? "Unnamed"}</p>
            <Badge variant="outline" className="capitalize">{account.role}</Badge>
            <Badge variant={active ? "success" : "secondary"}>{active ? "Active" : "Inactive"}</Badge>
          </div>
          <p className="text-sm text-slate-500">{account.email ?? "—"}</p>
        </div>
        <Button size="sm" variant="outline" onClick={toggle} disabled={isPending}>
          {active ? "Deactivate" : "Activate"}
        </Button>
      </CardContent>
    </Card>
  );
}
