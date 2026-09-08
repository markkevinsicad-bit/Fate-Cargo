import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { ReferralCodeCard } from "@/components/dashboard/referral-code-card";
import { RedeemReferralForm } from "@/components/dashboard/redeem-referral-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardReferralsPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: referredByMe }, { data: myReferral }, { data: settings }] = await Promise.all([
    supabase.from("referrals").select("*, profiles!referrals_referred_id_fkey(full_name)").eq("referrer_id", profile!.id),
    supabase.from("referrals").select("*").eq("referred_id", profile!.id).maybeSingle(),
    supabase.from("referral_settings").select("*").maybeSingle(),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Referrals</h1>
        <p className="mt-1 text-slate-500">{settings?.reward_description}</p>
      </div>

      <ReferralCodeCard />

      {!myReferral && <RedeemReferralForm />}

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-3 font-semibold text-slate-900">People You&apos;ve Referred</h2>
          {referredByMe && referredByMe.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {referredByMe.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                  <span>{(r as unknown as { profiles?: { full_name: string | null } }).profiles?.full_name ?? "Customer"}</span>
                  <span className={r.converted ? "text-emerald-700" : "text-slate-400"}>
                    {r.converted ? "Booked" : "Signed up"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No referrals yet. Share your code to get started!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
