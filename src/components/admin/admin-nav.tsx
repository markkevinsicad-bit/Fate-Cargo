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
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/actions/profile";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, adminOnly: false },
  { href: "/admin/scanner", label: "QR Scanner", icon: QrCode, adminOnly: false },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList, adminOnly: false },
  { href: "/admin/shipments", label: "Shipments", icon: Package, adminOnly: false },
  { href: "/admin/pickups", label: "Pickups", icon: Truck, adminOnly: false },
  { href: "/admin/deliveries", label: "Deliveries", icon: MapPin, adminOnly: false },
  { href: "/admin/warehouse", label: "Warehouse", icon: Warehouse, adminOnly: false },
  { href: "/admin/loading-trips", label: "Loading Trips", icon: Ship, adminOnly: false },
  { href: "/admin/leads", label: "Leads", icon: Target, adminOnly: false },
  { href: "/admin/quotes", label: "Quote Requests", icon: ClipboardList, adminOnly: false },
  { href: "/admin/moving-requests", label: "Moving Requests", icon: ClipboardList, adminOnly: false },
  { href: "/admin/reviews", label: "Reviews", icon: Star, adminOnly: true },
  { href: "/admin/referrals", label: "Referrals", icon: Gift, adminOnly: true },
  { href: "/admin/customers", label: "Customers", icon: Users, adminOnly: false },
  { href: "/admin/organizations", label: "Business Accounts", icon: Building2, adminOnly: true },
  { href: "/admin/drivers", label: "Drivers", icon: UserCog, adminOnly: true },
  { href: "/admin/team", label: "Team Accounts", icon: UsersRound, adminOnly: true },
  { href: "/admin/schedules", label: "Schedules", icon: CalendarClock, adminOnly: false },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, adminOnly: true },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldCheck, adminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
];

export function AdminNav({ role }: { role: "admin" | "staff" | "warehouse" }) {
  const pathname = usePathname();
  const router = useRouter();
  const links = LINKS.filter((l) => !l.adminOnly || role === "admin");

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
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
          router.push("/staff-login");
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
