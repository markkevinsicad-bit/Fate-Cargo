"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { SCHEDULE_STATUSES } from "@/lib/constants";
import { updateLoadingScheduleStatus } from "@/actions/admin";
import type { Database } from "@/lib/supabase/database.types";

type Schedule = Database["public"]["Tables"]["loading_schedules"]["Row"];

export function ScheduleStatusRow({ schedule }: { schedule: Schedule }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <CalendarClock className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold capitalize text-slate-900">{schedule.region}</p>
            <p className="text-sm text-slate-500">{formatDate(schedule.loading_date)}</p>
          </div>
        </div>
        <Select
          value={schedule.status}
          onValueChange={(v) =>
            startTransition(async () => {
              const result = await updateLoadingScheduleStatus(
                schedule.id,
                v as "scheduled" | "closed" | "completed" | "cancelled",
              );
              if (!result.success) toast.error(result.error);
            })
          }
          disabled={isPending}
        >
          <SelectTrigger className="w-40 capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCHEDULE_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
