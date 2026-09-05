import Link from "next/link";
import { ArrowRight, Truck, MapPinned, ShieldCheck, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/site/service-card";
import { DestinationCard } from "@/components/site/destination-card";
import { ScheduleCard } from "@/components/site/schedule-card";
import { COMPANY } from "@/lib/constants";
import { getActiveServices, getActiveDestinations, getNextLoadingSchedules } from "@/lib/data/public";

export default async function HomePage() {
  const [services, destinations, schedules] = await Promise.all([
    getActiveServices(),
    getActiveDestinations(),
    getNextLoadingSchedules(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[--color-primary-dark]">
        <div className="container-page relative z-10 flex flex-col items-start gap-6 py-20 sm:py-28">
          <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-[--color-secondary]">
            {COMPANY.name}
          </span>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            {COMPANY.tagline}
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            {COMPANY.positioning}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/get-quote">
                Get a Quote <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/login">Book a Shipment</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
              <Link href="/track">Track Cargo</Link>
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[--color-secondary]/20 blur-3xl" />
      </section>

      {/* Trust strip */}
      <section className="border-b border-slate-100 bg-white">
        <div className="container-page grid grid-cols-1 gap-6 py-10 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <Truck className="h-8 w-8 shrink-0 text-[--color-primary]" />
            <div>
              <p className="font-semibold text-slate-900">Door-to-Door & Consolidation</p>
              <p className="text-sm text-slate-500">From pickup to final delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPinned className="h-8 w-8 shrink-0 text-[--color-primary]" />
            <div>
              <p className="font-semibold text-slate-900">Visayas & Mindanao Routes</p>
              <p className="text-sm text-slate-500">Weekly scheduled loading</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 shrink-0 text-[--color-primary]" />
            <div>
              <p className="font-semibold text-slate-900">Special Handling Process</p>
              <p className="text-sm text-slate-500">Fragile, medical, high-value & more</p>
            </div>
          </div>
        </div>
      </section>

      {/* Next loading schedule */}
      <section className="bg-slate-50 py-14">
        <div className="container-page">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Next Loading Schedule</h2>
            <Link href="/schedule" className="text-sm font-medium text-[--color-primary] hover:underline">
              View full schedule →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ScheduleCard region="visayas" schedule={schedules.visayas} />
            <ScheduleCard region="mindanao" schedule={schedules.mindanao} />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-14">
        <div className="container-page">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Our Services</h2>
          {services.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <ServiceCard key={s.id} name={s.name} description={s.description} icon={s.icon} />
              ))}
            </div>
          ) : (
            <p className="text-slate-500">Service information is being updated. Please check back soon.</p>
          )}
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/services">See all services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="bg-slate-50 py-14">
        <div className="container-page">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Where We Deliver</h2>
            <Link href="/destinations" className="text-sm font-medium text-[--color-primary] hover:underline">
              View all destinations →
            </Link>
          </div>
          {destinations.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {destinations.slice(0, 8).map((d) => (
                <DestinationCard key={d.id} name={d.name} region={d.region} />
              ))}
            </div>
          ) : (
            <p className="text-slate-500">Destination information is being updated. Please check back soon.</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container-page flex flex-col items-center gap-4 rounded-2xl bg-[--color-primary] px-6 py-14 text-center text-white sm:px-14">
          <PackageSearch className="h-10 w-10 text-[--color-secondary]" />
          <h2 className="text-3xl font-bold">Ready to ship with {COMPANY.name}?</h2>
          <p className="max-w-xl text-slate-200">
            Request a free quote today and our team will get back to you with competitive rates.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/get-quote">
              Get a Quote <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
