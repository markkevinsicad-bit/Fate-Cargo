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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary-dark to-primary">
        {/* Decorative shapes - swap this section for a real photo whenever you have one:
            add a background image to this <section> and drop the gradient/blobs below. */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-secondary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-primary/40 blur-3xl" />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 border-l-[3px] border-secondary/30 lg:block" />

        <div className="container-page relative z-10 grid gap-12 py-20 sm:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="flex flex-col items-start gap-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              Logistics • Freight • Delivery
            </span>
            <h1 className="max-w-2xl text-4xl font-extrabold uppercase leading-tight text-white sm:text-5xl lg:text-6xl">
              From Booking to Doorstep,{" "}
              <span className="text-secondary">Everything Connected</span>
            </h1>
            <p className="max-w-xl text-lg text-slate-300">{COMPANY.positioning}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2 rounded-full px-7 shadow-lg">
                <Link href="/login">
                  <PackageSearch className="h-4 w-4" /> Book a Shipment
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/30 bg-white/5 px-7 text-white hover:bg-white/10"
              >
                <Link href="/services">
                  Our Services <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroQuickActions />
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
