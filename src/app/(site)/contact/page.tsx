import type { Metadata } from "next";
import { Phone, MapPin, Clock } from "lucide-react";
import { COMPANY } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="text-3xl font-bold text-slate-900">Contact {COMPANY.name}</h1>
      <p className="mt-2 text-slate-500">
        Have questions about a shipment, a move, or our services? Reach us directly or send a quote
        request and our team will follow up.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-6">
          <MapPin className="h-6 w-6 text-primary" />
          <h3 className="mt-3 font-semibold text-slate-900">Office / Warehouse</h3>
          <p className="mt-1 text-slate-600">{COMPANY.address}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-6">
          <Phone className="h-6 w-6 text-primary" />
          <h3 className="mt-3 font-semibold text-slate-900">Phone</h3>
          {COMPANY.phones.map((p) => (
            <p key={p} className="mt-1">
              <a href={`tel:${p}`} className="text-slate-600 hover:text-primary">{p}</a>
            </p>
          ))}
        </div>
        <div className="rounded-xl border border-slate-200 p-6 sm:col-span-2">
          <Clock className="h-6 w-6 text-primary" />
          <h3 className="mt-3 font-semibold text-slate-900">Loading Schedule</h3>
          <p className="mt-1 text-slate-600">Visayas: every Friday · Mindanao: every Saturday</p>
        </div>
      </div>

      <div className="mt-10">
        <Button asChild size="lg">
          <Link href="/get-quote">Send a Quote Request</Link>
        </Button>
      </div>
    </div>
  );
}
