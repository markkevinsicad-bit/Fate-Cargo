import type { Metadata } from "next";
import { ServiceCard } from "@/components/site/service-card";
import { CARGO_CATEGORIES } from "@/lib/constants";
import { getActiveServices } from "@/lib/data/public";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const services = await getActiveServices();

  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold text-slate-900">Our Services</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        From single-package delivery to full household moves, FATE CARGO handles it with
        competitive rates and a dedicated special handling process.
      </p>

      {services.length > 0 ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.id} name={s.name} description={s.description} icon={s.icon} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-slate-500">Service information is being updated. Please check back soon.</p>
      )}

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900">Cargo We Accept</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {CARGO_CATEGORIES.map((c) => (
            <Badge key={c} variant="outline" className="text-sm">
              {c}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
