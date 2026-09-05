import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Customers</h1>
      <p className="mb-6 text-slate-500">Most recently registered customers (showing up to 50).</p>

      {customers && customers.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Phone</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-5 py-3 font-medium text-slate-900">{c.full_name || "—"}</td>
                      <td className="px-5 py-3 text-slate-600">{c.phone || "—"}</td>
                      <td className="px-5 py-3 text-slate-600">{c.email || "—"}</td>
                      <td className="px-5 py-3 text-slate-600">{formatDate(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No customers yet."
          description="Registered customers will appear here once they sign up via phone OTP."
        />
      )}
    </div>
  );
}
