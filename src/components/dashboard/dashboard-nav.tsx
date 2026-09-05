"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Package, FileText, Bell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/actions/profile";
import { useRouter } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/shipments", label: "My Shipments", icon: Package },
  { href: "/dashboard/quotes", label: "Quote Requests", icon: FileText },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100",
              active && "bg-[--color-primary]/10 text-[--color-primary]",
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.push("/");
          router.refresh();
        }}
        className="mt-2 flex items-center gap-3 rounded-md border-t border-slate-100 px-3 py-2.5 pt-4 text-sm font-medium text-slate-500 hover:bg-slate-100"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </nav>
  );
}
