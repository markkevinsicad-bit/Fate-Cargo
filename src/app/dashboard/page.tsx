import Link from "next/link";
import { Package, FileText, Bell, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";

export default async function DashboardOverviewPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ count: quoteCount }, { count: unreadCount }] = await Promise.all([
    supabase
      .from("quote_requests")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", profile!.id),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile!.id)
      .eq("read", false),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-slate-500">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">0</p>
              <p className="text-sm text-slate-500">Active Shipments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/10 text-secondary-dark">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{quoteCount ?? 0}</p>
              <p className="text-sm text-slate-500">Quote Requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{unreadCount ?? 0}</p>
              <p className="text-sm text-slate-500">Unread Notifications</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">My Shipments</h2>
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="No shipment data available yet."
          description="Booking and shipment tracking will be available in the next phase of FATE CARGO 360."
        />
      </div>

      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link href="/get-quote">
            Request a new quote <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
