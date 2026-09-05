import Link from "next/link";
import { Users, ClipboardList, CalendarClock, Package, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [
    { count: customerCount },
    { count: totalQuoteCount },
    { count: pendingQuoteCount },
    { data: upcomingSchedules },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("quote_requests").select("*", { count: "exact", head: true }),
    supabase.from("quote_requests").select("*", { count: "exact", head: true }).eq("status", "requested"),
    supabase
      .from("loading_schedules")
      .select("*")
      .gte("loading_date", today)
      .order("loading_date", { ascending: true })
      .limit(4),
  ]);

  const metrics = [
    { label: "Total Customers", value: customerCount ?? 0, icon: Users, color: "bg-blue-100 text-blue-700" },
    { label: "Quote Requests", value: totalQuoteCount ?? 0, icon: ClipboardList, color: "bg-amber-100 text-amber-700" },
    { label: "Pending Requests", value: pendingQuoteCount ?? 0, icon: ClipboardList, color: "bg-red-100 text-red-700" },
    { label: "Active Shipments", value: 0, icon: Package, color: "bg-emerald-100 text-emerald-700", comingSoon: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-slate-500">Live overview of FATE CARGO 360 operations.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${m.color}`}>
                <m.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{m.value}</p>
                <p className="text-sm text-slate-500">
                  {m.label}
                  {m.comingSoon && <span className="ml-1 text-xs text-slate-400">(Phase 2)</span>}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Loading Schedules</h2>
          <Link href="/admin/schedules" className="flex items-center gap-1 text-sm font-medium text-[--color-primary] hover:underline">
            Manage <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {upcomingSchedules && upcomingSchedules.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {upcomingSchedules.map((s) => (
              <Card key={s.id}>
                <CardContent className="flex items-center gap-3 p-4">
                  <CalendarClock className="h-5 w-5 text-[--color-primary]" />
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">{s.region}</p>
                    <p className="font-semibold text-slate-900">{formatDate(s.loading_date)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CalendarClock className="h-8 w-8" />}
            title="No upcoming loading schedules."
            description="Add new loading dates from the Schedules module."
          />
        )}
      </div>
    </div>
  );
}
