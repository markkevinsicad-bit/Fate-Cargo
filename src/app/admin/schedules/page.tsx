import { CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { NewScheduleForm } from "@/components/admin/new-schedule-form";
import { ScheduleStatusRow } from "@/components/admin/schedule-status-row";

export default async function AdminSchedulesPage() {
  const supabase = await createClient();
  const { data: schedules } = await supabase
    .from("loading_schedules")
    .select("*")
    .order("loading_date", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Loading Schedules</h1>
        <p className="text-slate-500">
          Visayas loads every Friday, Mindanao every Saturday. Add or manage upcoming loading dates here —
          the public website reads directly from this table.
        </p>
      </div>

      <NewScheduleForm />

      {schedules && schedules.length > 0 ? (
        <div className="space-y-2">
          {schedules.map((s) => (
            <ScheduleStatusRow key={s.id} schedule={s} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarClock className="h-8 w-8" />}
          title="No loading schedules yet."
          description="Add your first loading date above."
        />
      )}
    </div>
  );
}
