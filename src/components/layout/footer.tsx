import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { FacebookIcon, InstagramIcon, MessengerIcon } from "@/components/shared/social-icons";
import { COMPANY } from "@/lib/constants";

const SOCIALS = [
  { href: "https://facebook.com", label: "Facebook", Icon: FacebookIcon },
  { href: "https://instagram.com", label: "Instagram", Icon: InstagramIcon },
  { href: "https://m.me", label: "Messenger", Icon: MessengerIcon },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-primary-dark text-slate-200">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo dark />
          <p className="mt-4 text-sm leading-relaxed text-slate-300">{COMPANY.tagline}</p>
          <div className="mt-5 flex items-center gap-2.5">
            {SOCIALS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-secondary hover:text-primary-dark"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Company</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/about" className="text-slate-300 transition-colors hover:text-secondary">About FATE Cargo</Link></li>
            <li><Link href="/services" className="text-slate-300 transition-colors hover:text-secondary">Services</Link></li>
            <li><Link href="/destinations" className="text-slate-300 transition-colors hover:text-secondary">Destinations</Link></li>
            <li><Link href="/schedule" className="text-slate-300 transition-colors hover:text-secondary">Loading Schedule</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Customers</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/get-quote" className="text-slate-300 transition-colors hover:text-secondary">Get a Quote</Link></li>
            <li><Link href="/moving" className="text-slate-300 transition-colors hover:text-secondary">Lipat Bahay / Moving</Link></li>
            <li><Link href="/track" className="text-slate-300 transition-colors hover:text-secondary">Track Shipment</Link></li>
            <li><Link href="/login" className="text-slate-300 transition-colors hover:text-secondary">Customer Login</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                <MapPin className="h-3.5 w-3.5 text-secondary" />
              </span>
              <span className="text-slate-300">{COMPANY.address}</span>
            </li>
            {COMPANY.phones.map((phone) => (
              <li key={phone} className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Phone className="h-3.5 w-3.5 text-secondary" />
                </span>
                <a href={`tel:${phone}`} className="text-slate-300 transition-colors hover:text-secondary">{phone}</a>
              </li>
            ))}
            <li className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Mail className="h-3.5 w-3.5 text-secondary" />
              </span>
              <Link href="/contact" className="text-slate-300 transition-colors hover:text-secondary">Send a message</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {COMPANY.name} 360. All rights reserved.{" "}
        <Link href="/staff-login" className="text-slate-500 hover:text-slate-300">
          Staff login
        </Link>
      </div>
    </footer>
  );
}
