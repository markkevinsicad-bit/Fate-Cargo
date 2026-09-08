import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SettingsListManager } from "@/components/admin/settings-list-manager";
import { ReferralSettingsForm } from "@/components/admin/referral-settings-form";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock, UserCog } from "lucide-react";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const [{ data: destinations }, { data: services }, { data: cargoCategories }, { data: referralSettings }] =
    await Promise.all([
      supabase.from("destinations").select("*").order("region").order("name"),
      supabase.from("services").select("*").order("name"),
      supabase.from("cargo_categories").select("*").order("name"),
      supabase.from("referral_settings").select("*").maybeSingle(),
    ]);

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">
          Manage services, destinations, cargo categories, and referral settings without touching code.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/schedules">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <CalendarClock className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold text-slate-900">Loading Schedules</p>
                <p className="text-sm text-slate-500">Manage Visayas/Mindanao loading dates</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/drivers">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <UserCog className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold text-slate-900">Drivers</p>
                <p className="text-sm text-slate-500">Manage driver accounts and status</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <SettingsListManager
        title="Services"
        type="service"
        items={(services ?? []).map((s) => ({ id: s.id, name: s.name, active: s.active }))}
      />

      <SettingsListManager
        title="Destinations"
        type="destination"
        items={(destinations ?? []).map((d) => ({ id: d.id, name: `${d.name} (${d.region})`, active: d.active }))}
        needsRegion
      />

      <SettingsListManager
        title="Cargo Categories"
        type="cargo_category"
        items={(cargoCategories ?? []).map((c) => ({ id: c.id, name: c.name, active: c.active }))}
      />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Referral Settings</h2>
        <ReferralSettingsForm
          initialDescription={referralSettings?.reward_description ?? ""}
          initialActive={referralSettings?.is_active ?? true}
        />
      </div>
    </div>
  );
}
