"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequestStatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { REQUEST_STATUSES, REQUEST_STATUS_LABELS, type RequestStatus } from "@/lib/constants";
import { updateQuoteRequestStatus } from "@/actions/admin";
import type { Database } from "@/lib/supabase/database.types";

type QuoteRow = Database["public"]["Tables"]["quote_requests"]["Row"] & {
  destinations?: { name: string } | null;
  cargo_categories?: { name: string } | null;
};

export function AdminQuoteRow({ quote }: { quote: QuoteRow }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<RequestStatus>(quote.status as RequestStatus);
  const [amount, setAmount] = useState(quote.quoted_amount != null ? String(quote.quoted_amount) : "");
  const [notes, setNotes] = useState(quote.admin_notes ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateQuoteRequestStatus(
        quote.id,
        status,
        amount ? Number(amount) : null,
        notes || null,
      );
      if (result.success) {
        toast.success("Quote request updated.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardContent className="p-5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-start justify-between gap-4 text-left"
        >
          <div>
            <p className="font-semibold text-slate-900">
              {quote.full_name} · {quote.phone}
            </p>
            <p className="text-sm text-slate-500">
              {quote.origin} → {quote.destinations?.name || quote.destination_text || "TBD"}
              {quote.cargo_categories?.name ? ` · ${quote.cargo_categories.name}` : ""}
            </p>
            <p className="mt-1 text-xs text-slate-400">Submitted {formatDate(quote.created_at)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <RequestStatusBadge status={quote.status as RequestStatus} />
            {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </div>
        </button>

        {open && (
          <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-4">
              {quote.number_of_packages != null && <p>Packages: {quote.number_of_packages}</p>}
              {quote.weight_kg != null && <p>Weight: {quote.weight_kg} kg</p>}
              {quote.volume_cbm != null && <p>Volume: {quote.volume_cbm} m³</p>}
              <p>Pickup: {quote.pickup_required ? "Yes" : "No"}</p>
            </div>
            {quote.special_handling?.length > 0 && (
              <p className="text-sm text-slate-600">
                Special handling: {quote.special_handling.join(", ")}
              </p>
            )}
            {quote.cargo_description && (
              <p className="text-sm text-slate-600">Description: {quote.cargo_description}</p>
            )}
            {quote.additional_notes && (
              <p className="text-sm text-slate-600">Customer notes: {quote.additional_notes}</p>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Status" htmlFor={`status-${quote.id}`}>
                <Select value={status} onValueChange={(v) => setStatus(v as RequestStatus)}>
                  <SelectTrigger id={`status-${quote.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {REQUEST_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Quoted Amount (₱)" htmlFor={`amount-${quote.id}`}>
                <Input
                  id={`amount-${quote.id}`}
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </FormField>
            </div>
            <FormField label="Admin Notes" htmlFor={`notes-${quote.id}`}>
              <Textarea
                id={`notes-${quote.id}`}
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </FormField>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
