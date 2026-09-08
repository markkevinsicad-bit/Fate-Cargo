"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/constants";
import { updateLead } from "@/actions/leads";
import type { Database } from "@/lib/supabase/database.types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

const VARIANT: Record<LeadStatus, "secondary" | "default" | "warning" | "success" | "destructive"> = {
  new: "secondary",
  contacted: "default",
  quoted: "warning",
  converted: "success",
  lost: "destructive",
};

export function AdminLeadRow({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<LeadStatus>(lead.status as LeadStatus);
  const [notes, setNotes] = useState(lead.internal_notes ?? "");
  const [followUp, setFollowUp] = useState(lead.follow_up_date ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateLead(lead.id, { status, internalNotes: notes, followUpDate: followUp || null });
      if (result.success) toast.success("Lead updated.");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardContent className="p-5">
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-start justify-between gap-4 text-left">
          <div>
            <p className="font-semibold text-slate-900">
              {lead.full_name} · {lead.phone}
            </p>
            <p className="text-sm text-slate-500">
              {lead.origin ?? "—"} → {lead.destination ?? "—"} {lead.cargo_type ? `· ${lead.cargo_type}` : ""}
            </p>
            <p className="mt-1 text-xs text-slate-400">Submitted {formatDate(lead.created_at)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Badge variant={VARIANT[lead.status as LeadStatus]}>{LEAD_STATUS_LABELS[lead.status as LeadStatus]}</Badge>
            {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </div>
        </button>

        {open && (
          <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
            {lead.notes && <p className="text-sm text-slate-600">Customer notes: {lead.notes}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Status" htmlFor={`lead-status-${lead.id}`}>
                <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
                  <SelectTrigger id={`lead-status-${lead.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {LEAD_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Follow-up Date" htmlFor={`lead-followup-${lead.id}`}>
                <Input id={`lead-followup-${lead.id}`} type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
              </FormField>
            </div>
            <FormField label="Internal Notes" htmlFor={`lead-notes-${lead.id}`}>
              <Textarea id={`lead-notes-${lead.id}`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
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
