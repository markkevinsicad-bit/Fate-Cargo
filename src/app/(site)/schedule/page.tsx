import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { getUpcomingLoadingSchedules } from "@/lib/data/public";

export const metadata: Metadata = { title: "Loading Schedule" };

const REGION_LABEL: Record<string, string> = { visayas: "Visayas", mindanao: "Mindanao" };
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "success"> = {
  scheduled: "success",
  closed: "secondary",
  completed: "secondary",
  cancelled: "destructive",
};

export default async function SchedulePage() {
  const schedules = await getUpcomingLoadingSchedules(20);

  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold text-slate-900">Loading Schedule</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        FATE CARGO loads for Visayas every Friday and Mindanao every Saturday. Book ahead of the
        cutoff time to make the next load.
      </p>

      {schedules.length > 0 ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {schedules.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{REGION_LABEL[s.region]}</p>
                    <Badge variant={STATUS_VARIANT[s.status] ?? "secondary"} className="capitalize">
                      {s.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-lg font-bold text-slate-900">{formatDate(s.loading_date)}</p>
                  {s.booking_cutoff && (
                    <p className="text-sm text-slate-500">Booking cutoff: {formatDate(s.booking_cutoff)}</p>
                  )}
                  {s.notes && <p className="mt-1 text-sm text-slate-500">{s.notes}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-10"
          icon={<CalendarDays className="h-8 w-8" />}
          title="No loading schedule data available yet."
          description="Please check back soon or contact us for the latest schedule."
        />
      )}
    </div>
  );
}
