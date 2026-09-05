import type { Metadata } from "next";
import { ShieldCheck, Truck, HeartHandshake, MapPin } from "lucide-react";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = { title: "About Us" };

const VALUES = [
  {
    icon: Truck,
    title: "Competitive Rates",
    description: "Transparent, fair pricing for every shipment size, from single boxes to full loads.",
  },
  {
    icon: HeartHandshake,
    title: "Best Customer Service",
    description: "A dedicated team that keeps you informed from booking to delivery.",
  },
  {
    icon: ShieldCheck,
    title: "Special Handling Process",
    description: "Fragile, medical, high-value and oversized cargo handled with documented care.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-page max-w-4xl py-14">
      <h1 className="text-3xl font-bold text-slate-900">About {COMPANY.name}</h1>
      <p className="mt-4 text-lg text-slate-600">{COMPANY.positioning}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-xl border border-slate-200 p-6">
            <v.icon className="h-8 w-8 text-primary" />
            <h3 className="mt-3 font-semibold text-slate-900">{v.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{v.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-start gap-3 rounded-xl bg-slate-50 p-6">
        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="font-semibold text-slate-900">Office & Warehouse</p>
          <p className="text-slate-600">{COMPANY.address}</p>
        </div>
      </div>
    </div>
  );
}
