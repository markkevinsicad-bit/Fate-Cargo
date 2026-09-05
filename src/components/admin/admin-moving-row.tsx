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
import { REQUEST_STATUSES, REQUEST_STATUS_LABELS, MOVING_TYPE_LABELS, type RequestStatus, type MovingType } from "@/lib/constants";
import { updateMovingRequestStatus } from "@/actions/admin";
import type { Database } from "@/lib/supabase/database.types";

type MovingRow = Database["public"]["Tables"]["moving_requests"]["Row"];

export function AdminMovingRow({ request }: { request: MovingRow }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<RequestStatus>(request.status as RequestStatus);
  const [amount, setAmount] = useState(request.quoted_amount != null ? String(request.quoted_amount) : "");
  const [notes, setNotes] = useState(request.admin_notes ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateMovingRequestStatus(
        request.id,
        status,
        amount ? Number(amount) : null,
        notes || null,
      );
      if (result.success) {
        toast.success("Moving request updated.");
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
              {request.full_name} · {request.phone}
            </p>
            <p className="text-sm text-slate-500">
              {MOVING_TYPE_LABELS[request.moving_type as MovingType]} · {request.pickup_location} →{" "}
              {request.destination_location}
            </p>
            <p className="mt-1 text-xs text-slate-400">Submitted {formatDate(request.created_at)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <RequestStatusBadge status={request.status as RequestStatus} />
            {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </div>
        </button>

        {open && (
          <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-4">
              {request.preferred_date && <p>Preferred date: {formatDate(request.preferred_date)}</p>}
              {request.rooms_estimate && <p>Size: {request.rooms_estimate}</p>}
              <p>Elevator: {request.elevator_available ? "Yes" : "No"}</p>
              <p>Stairs: {request.stairs ? "Yes" : "No"}</p>
            </div>
            {request.major_items && <p className="text-sm text-slate-600">Major items: {request.major_items}</p>}
            {request.special_items && <p className="text-sm text-slate-600">Special items: {request.special_items}</p>}
            {request.notes && <p className="text-sm text-slate-600">Customer notes: {request.notes}</p>}

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Status" htmlFor={`status-${request.id}`}>
                <Select value={status} onValueChange={(v) => setStatus(v as RequestStatus)}>
                  <SelectTrigger id={`status-${request.id}`}>
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
              <FormField label="Quoted Amount (₱)" htmlFor={`amount-${request.id}`}>
                <Input
                  id={`amount-${request.id}`}
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </FormField>
            </div>
            <FormField label="Admin Notes" htmlFor={`notes-${request.id}`}>
              <Textarea id={`notes-${request.id}`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
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
