import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { COMPANY } from "@/lib/constants";
import { DriverLogoutButton } from "@/components/driver/driver-logout-button";

export default async function DriverLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?redirect=/driver");
  }
  if (profile.role !== "driver" && profile.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/driver" className="flex items-center gap-2 font-bold text-primary">
            <Package className="h-5 w-5" />
            {COMPANY.name} Driver
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{profile.full_name || "Driver"}</span>
            <DriverLogoutButton />
          </div>
        </div>
      </header>
      <main className="container-page py-6">{children}</main>
    </div>
  );
}
