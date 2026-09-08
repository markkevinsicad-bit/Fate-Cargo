"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Users,
  Warehouse,
  Truck,
  MapPin,
  CalendarClock,
  QrCode,
  BarChart3,
  Settings,
  LogOut,
  Ship,
  UserCog,
  Target,
  Star,
  Gift,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/actions/profile";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/scanner", label: "QR Scanner", icon: QrCode },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/admin/shipments", label: "Shipments", icon: Package },
  { href: "/admin/pickups", label: "Pickups", icon: Truck },
  { href: "/admin/deliveries", label: "Deliveries", icon: MapPin },
  { href: "/admin/warehouse", label: "Warehouse", icon: Warehouse },
  { href: "/admin/loading-trips", label: "Loading Trips", icon: Ship },
  { href: "/admin/leads", label: "Leads", icon: Target },
  { href: "/admin/quotes", label: "Quote Requests", icon: ClipboardList },
  { href: "/admin/moving-requests", label: "Moving Requests", icon: ClipboardList },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/referrals", label: "Referrals", icon: Gift },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/organizations", label: "Business Accounts", icon: Building2 },
  { href: "/admin/drivers", label: "Drivers", icon: UserCog },
  { href: "/admin/schedules", label: "Schedules", icon: CalendarClock },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav() {
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
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5",
              active && "bg-white/10 text-white",
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
        className="mt-2 flex items-center gap-3 rounded-md border-t border-white/10 px-3 py-2.5 pt-4 text-sm font-medium text-slate-400 hover:bg-white/5"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </nav>
  );
}
