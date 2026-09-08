"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteSavedAddress } from "@/actions/organizations";

export function SavedAddressRow({
  address,
}: {
  address: { id: string; label: string; address: string; address_type: string; contact_name: string | null; contact_phone: string | null };
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${address.label}"?`)) return;
    startTransition(async () => {
      const result = await deleteSavedAddress(address.id);
      if (!result.success) toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900">{address.label}</p>
              <Badge variant="outline" className="capitalize">{address.address_type}</Badge>
            </div>
            <p className="text-sm text-slate-600">{address.address}</p>
            {address.contact_name && (
              <p className="text-xs text-slate-400">
                {address.contact_name} {address.contact_phone ? `· ${address.contact_phone}` : ""}
              </p>
            )}
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={handleDelete} disabled={isPending} aria-label="Delete address">
          <Trash2 className="h-4 w-4 text-slate-400" />
        </Button>
      </CardContent>
    </Card>
  );
}
