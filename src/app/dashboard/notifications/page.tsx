import { Bell } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { formatDate } from "@/lib/utils";
import { NotificationReadButton } from "@/components/dashboard/notification-read-button";

export default async function DashboardNotificationsPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", profile!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Notifications</h1>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={n.read ? "opacity-70" : ""}>
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div>
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(n.created_at)}</p>
                </div>
                {!n.read && <NotificationReadButton id={n.id} />}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title="No notifications yet."
          description="We'll let you know here whenever there's an update on your requests or shipments."
        />
      )}
    </div>
  );
}
