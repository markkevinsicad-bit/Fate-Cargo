import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { AdminNav } from "@/components/admin/admin-nav";
import { COMPANY } from "@/lib/constants";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?redirect=/admin");
  }
  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="bg-primary-dark p-4 lg:sticky lg:top-0 lg:h-screen">
          <Link href="/admin" className="flex items-center gap-2 px-2 py-3 font-bold text-white">
            <Package className="h-5 w-5 text-secondary" />
            {COMPANY.name} 360
            <span className="ml-auto rounded bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-300">
              Admin
            </span>
          </Link>
          <div className="mt-4">
            <AdminNav />
          </div>
        </aside>
        <main className="p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
