import { CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Database } from "@/lib/supabase/database.types";

type Schedule = Database["public"]["Tables"]["loading_schedules"]["Row"];

const REGION_LABEL: Record<string, string> = {
  visayas: "Visayas",
  mindanao: "Mindanao",
};

export function ScheduleCard({ region, schedule }: { region: "visayas" | "mindanao"; schedule: Schedule | null }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start gap-4 p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CalendarClock className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Next {REGION_LABEL[region]} Loading
            </p>
            <Badge variant="secondary">{region === "visayas" ? "Every Friday" : "Every Saturday"}</Badge>
          </div>
          {schedule ? (
            <>
              <p className="mt-1 text-xl font-bold text-slate-900">{formatDate(schedule.loading_date)}</p>
              {schedule.booking_cutoff && (
                <p className="mt-1 text-sm text-slate-500">
                  Booking cutoff: {formatDate(schedule.booking_cutoff)}
                </p>
              )}
            </>
          ) : (
            <p className="mt-1 text-sm text-slate-500">No upcoming loading date scheduled yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
