import { Gift, Users, TrendingUp, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getReferralStats } from "@/lib/data/growth";

export default async function AdminReferralsPage() {
  const stats = await getReferralStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Referrals</h1>
        <p className="text-slate-500">Track referral activity. Reward structure is not yet configured.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalReferrals}</p>
              <p className="text-sm text-slate-500">Total Referrals</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.convertedReferrals}</p>
              <p className="text-sm text-slate-500">Converted (Booked)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Award className="h-5 w-5 text-secondary-dark" /> Top Referrers
        </h2>
        {stats.topReferrers.length > 0 ? (
          <div className="space-y-2">
            {stats.topReferrers.map((r, i) => (
              <Card key={i}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                      {i + 1}
                    </span>
                    <span className="font-medium text-slate-900">{r.name}</span>
                  </div>
                  <span className="text-sm text-slate-500">{r.count} referral{r.count === 1 ? "" : "s"}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState icon={<Users className="h-8 w-8" />} title="No referrals recorded yet." className="py-8" />
        )}
      </div>
    </div>
  );
}
