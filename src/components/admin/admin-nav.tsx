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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { signOut } from "@/actions/profile";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, live: true },
  { href: "/admin/scanner", label: "QR Scanner", icon: QrCode, live: true },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList, live: true },
  { href: "/admin/shipments", label: "Shipments", icon: Package, live: true },
  { href: "/admin/warehouse", label: "Warehouse", icon: Warehouse, live: true },
  { href: "/admin/loading-trips", label: "Loading Trips", icon: Ship, live: true },
  { href: "/admin/quotes", label: "Quote Requests", icon: ClipboardList, live: true },
  { href: "/admin/moving-requests", label: "Moving Requests", icon: ClipboardList, live: true },
  { href: "/admin/customers", label: "Customers", icon: Users, live: true },
  { href: "/admin/schedules", label: "Schedules", icon: CalendarClock, live: true },
  { href: "/admin/pickup", label: "Pickup", icon: Truck, live: false },
  { href: "/admin/delivery", label: "Delivery", icon: MapPin, live: false },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, live: false },
  { href: "/admin/settings", label: "Settings", icon: Settings, live: false },
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
              "flex items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5",
              active && "bg-white/10 text-white",
            )}
          >
            <span className="flex items-center gap-3">
              <link.icon className="h-4 w-4" />
              {link.label}
            </span>
            {!link.live && (
              <Badge variant="outline" className="border-white/20 text-[10px] text-slate-400">
                Phase 3
              </Badge>
            )}
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
