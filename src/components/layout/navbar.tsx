"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, PackagePlus, Truck, Boxes, Home, Building2, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const SERVICE_LINKS = [
  { href: "/services#door-to-door", label: "Door to Door Delivery", icon: Truck },
  { href: "/services#consolidation", label: "Cargo Consolidation", icon: Boxes },
  { href: "/moving", label: "Lipat Bahay", icon: Home },
  { href: "/services#office-transfer", label: "Office Transfer", icon: Building2 },
  { href: "/services#condo-transfer", label: "Condo Transfer", icon: Building },
];

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/track", label: "Track Shipment" },
  { href: "/get-quote", label: "Request Quote" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const pathname = usePathname();
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between">
        <Link href="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          <NavLink href="/" label="Home" active={pathname === "/"} />

          <div ref={servicesRef} className="relative">
            <button
              type="button"
              onClick={() => setServicesOpen((v) => !v)}
              className={cn(
                "flex items-center gap-1 text-sm font-semibold text-slate-700 transition-colors hover:text-primary",
                pathname === "/services" && "text-primary",
              )}
            >
              Services
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", servicesOpen && "rotate-180")} />
            </button>
            {servicesOpen && (
              <div className="absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2 overflow-hidden rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
                {SERVICE_LINKS.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    onClick={() => setServicesOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-primary/5 hover:text-primary"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <s.icon className="h-4 w-4" />
                    </span>
                    {s.label}
                  </Link>
                ))}
                <Link
                  href="/services"
                  onClick={() => setServicesOpen(false)}
                  className="mt-1 block rounded-lg px-3 py-2 text-center text-sm font-semibold text-secondary-dark hover:bg-secondary/10"
                >
                  View All Services →
                </Link>
              </div>
            )}
          </div>

          {NAV_LINKS.slice(1).map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} active={pathname === link.href} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-primary">
            Login
          </Link>
          <Button asChild className="gap-2 rounded-full px-6 shadow-sm">
            <Link href="/login">
              <PackagePlus className="h-4 w-4" /> Book a Shipment
            </Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-100 bg-white lg:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            <MobileLink href="/" label="Home" active={pathname === "/"} onClick={() => setOpen(false)} />

            <button
              type="button"
              onClick={() => setMobileServicesOpen((v) => !v)}
              className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Services
              <ChevronDown className={cn("h-4 w-4 transition-transform", mobileServicesOpen && "rotate-180")} />
            </button>
            {mobileServicesOpen && (
              <div className="ml-3 flex flex-col gap-0.5 border-l-2 border-slate-100 pl-3">
                {SERVICE_LINKS.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary"
                  >
                    <s.icon className="h-4 w-4 text-primary" />
                    {s.label}
                  </Link>
                ))}
              </div>
            )}

            {NAV_LINKS.slice(1).map((link) => (
              <MobileLink key={link.href} href={link.href} label={link.label} active={pathname === link.href} onClick={() => setOpen(false)} />
            ))}

            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
              <Button asChild variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="gap-2 rounded-full" onClick={() => setOpen(false)}>
                <Link href="/login">
                  <PackagePlus className="h-4 w-4" /> Book a Shipment
                </Link>
              </Button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative py-1 text-sm font-semibold text-slate-700 transition-colors hover:text-primary",
        active && "text-primary after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-secondary",
      )}
    >
      {label}
    </Link>
  );
}

function MobileLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50",
        active && "bg-slate-50 text-primary",
      )}
    >
      {label}
    </Link>
  );
}
