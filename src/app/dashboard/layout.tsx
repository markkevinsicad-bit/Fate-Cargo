import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { COMPANY } from "@/lib/constants";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?redirect=/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-[--color-primary]">
            <Package className="h-5 w-5" />
            {COMPANY.name} 360
          </Link>
          <span className="text-sm text-slate-500">
            {profile.full_name || profile.phone || "Customer"}
          </span>
        </div>
      </header>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <DashboardNav />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
