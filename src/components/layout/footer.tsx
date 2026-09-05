import Link from "next/link";
import { Package, MapPin, Phone } from "lucide-react";
import { COMPANY } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[--color-primary-dark] text-slate-200">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-bold text-white">
            <Package className="h-5 w-5 text-[--color-secondary]" />
            {COMPANY.name} 360
          </div>
          <p className="mt-3 text-sm text-slate-300">{COMPANY.tagline}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Company</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white">About FATE Cargo</Link></li>
            <li><Link href="/services" className="hover:text-white">Services</Link></li>
            <li><Link href="/destinations" className="hover:text-white">Destinations</Link></li>
            <li><Link href="/schedule" className="hover:text-white">Loading Schedule</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Customers</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/get-quote" className="hover:text-white">Get a Quote</Link></li>
            <li><Link href="/moving" className="hover:text-white">Lipat Bahay / Moving</Link></li>
            <li><Link href="/track" className="hover:text-white">Track Shipment</Link></li>
            <li><Link href="/login" className="hover:text-white">Customer Login</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[--color-secondary]" />
              {COMPANY.address}
            </li>
            {COMPANY.phones.map((phone) => (
              <li key={phone} className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[--color-secondary]" />
                <a href={`tel:${phone}`} className="hover:text-white">{phone}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
      </div>
    </footer>
  );
}
