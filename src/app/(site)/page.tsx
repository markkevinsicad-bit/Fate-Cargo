
import Link from "next/link";
import { ArrowRight, Truck, MapPinned, ShieldCheck, PackageSearch, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/site/service-card";
import { DestinationCard } from "@/components/site/destination-card";
import { ScheduleCard } from "@/components/site/schedule-card";
import { QuickLeadForm } from "@/components/forms/quick-lead-form";
import { HeroQuickActions } from "@/components/site/hero-quick-actions";
import { TrackCoverageBanner } from "@/components/site/track-coverage-banner";
import { COMPANY } from "@/lib/constants";
import { getActiveServices, getActiveDestinations, getNextLoadingSchedules } from "@/lib/data/public";
import { getReviews } from "@/lib/data/growth";

export default async function HomePage() {
  const [services, destinations, schedules, reviews] = await Promise.all([
    getActiveServices(),
    getActiveDestinations(),
    getNextLoadingSchedules(),
    getReviews(true),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-dark">
        {/* FATE Cargo Delivery Services — Hero Background Image */}
        <img
          src="/fate-cargo-hero.png"
          alt="FATE Cargo Delivery Services cargo truck, aircraft, and shipping port"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Navy overlay for text readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary-dark/95 via-primary-dark/70 to-primary-dark/10" />

        <div className="container-page relative z-10 py-14 sm:py-16">
  <div className="flex flex-col items-start gap-6">
    <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
      Logistics • Freight • Delivery
    </span>
    ... (headline, paragraph, buttons stay exactly the same, don't touch these) ...
  </div>
</div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-slate-100 bg-white">
        <div className="container-page grid grid-cols-1 gap-6 py-10 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Truck className="h-6 w-6" />
            </span>
            <div>
              <p className="font-semibold text-slate-900">Door-to-Door & Consolidation</p>
              <p className="text-sm text-slate-500">From pickup to final delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPinned className="h-6 w-6" />
            </span>
            <div>
              <p className="font-semibold text-slate-900">Visayas & Mindanao Routes</p>
              <p className="text-sm text-slate-500">Weekly scheduled loading</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <p className="font-semibold text-slate-900">Special Handling Process</p>
              <p className="text-sm text-slate-500">Fragile, medical, high-value & more</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16">
        <div className="container-page">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-secondary-dark">Our Services</p>
              <h2 className="mt-1 text-3xl font-extrabold text-slate-900">Complete Cargo Solutions</h2>
            </div>
            <Link href="/services" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              View All Services <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {services.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <ServiceCard key={s.id} name={s.name} description={s.description} icon={s.icon} slug={s.slug} />
              ))}
            </div>
          ) : (
            <p className="text-slate-500">Service information is being updated. Please check back soon.</p>
          )}
        </div>
      </section>

      {/* Next loading schedule */}
      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-secondary-dark">Loading Schedule</p>
              <h2 className="mt-1 text-3xl font-extrabold text-slate-900">Next Loading Schedule</h2>
            </div>
            <Link href="/schedule" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              View Full Schedule <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ScheduleCard region="visayas" schedule={schedules.visayas} />
            <ScheduleCard region="mindanao" schedule={schedules.mindanao} />
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="py-16">
        <div className="container-page">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-secondary-dark">Where We Deliver</p>
              <h2 className="mt-1 text-3xl font-extrabold text-slate-900">Our Destinations</h2>
            </div>
            <Link href="/destinations" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              View All Destinations <ArrowRight className="h-3.5 w-3.5" />
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

      {/* Tracking + coverage banner */}
      <TrackCoverageBanner />

      {/* Reviews (real, approved reviews only) */}
      {reviews.length > 0 && (
        <section className="py-16">
          <div className="container-page">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary-dark">Testimonials</p>
            <h2 className="mt-1 mb-8 text-3xl font-extrabold text-slate-900">What Our Customers Say</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.slice(0, 6).map((r) => (
                <div key={r.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex gap-0.5 text-secondary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-secondary" : "fill-none"}`} />
                    ))}
                  </div>
                  {r.comment && <p className="mt-3 text-sm text-slate-600">&ldquo;{r.comment}&rdquo;</p>}
                  <p className="mt-3 text-xs font-medium text-slate-500">
                    {r.profiles?.full_name ?? "FATE Cargo Customer"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
{/* Book a shipment / track shipment — moved here from the hero */}
<section className="bg-slate-50 py-16">
  <div className="container-page flex flex-col items-center text-center">
    <p className="text-xs font-bold uppercase tracking-widest text-secondary-dark">Get Started</p>
    <h2 className="mt-1 mb-8 text-3xl font-extrabold text-slate-900">Book or Track in Seconds</h2>
    <HeroQuickActions />
  </div>
</section>

{/* CTA / quick lead capture */}
<section className="py-16"></section>
      {/* CTA / quick lead capture */}
      <section className="py-16">
        <div className="container-page grid gap-8 rounded-3xl bg-primary px-6 py-14 text-white sm:px-14 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-start gap-4">
            <PackageSearch className="h-10 w-10 text-secondary" />
            <h2 className="text-3xl font-extrabold">Ready to ship with {COMPANY.name}?</h2>
            <p className="max-w-xl text-slate-200">
              Request a free quote today and our team will get back to you with competitive rates.
            </p>
            <Button asChild size="lg" variant="secondary" className="gap-2 rounded-full px-7">
              <Link href="/get-quote">
                Get a Full Quote <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="rounded-2xl bg-white p-6">
            <p className="mb-4 font-semibold text-slate-900">Or get a fast callback</p>
            <QuickLeadForm />
          </div>
        </div>
      </section>
    </>
  );
}