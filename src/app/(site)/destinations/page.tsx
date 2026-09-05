import type { Metadata } from "next";
import { DestinationCard } from "@/components/site/destination-card";
import { getActiveDestinations } from "@/lib/data/public";

export const metadata: Metadata = { title: "Destinations" };

export default async function DestinationsPage() {
  const destinations = await getActiveDestinations();
  const visayas = destinations.filter((d) => d.region === "visayas");
  const mindanao = destinations.filter((d) => d.region === "mindanao");

  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold text-slate-900">Destinations</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        We serve major hubs across Visayas and Mindanao with scheduled weekly loading.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">Visayas</h2>
        {visayas.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visayas.map((d) => (
              <DestinationCard key={d.id} name={d.name} region={d.region} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-slate-500">No Visayas destinations available yet.</p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-900">Mindanao</h2>
        {mindanao.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {mindanao.map((d) => (
              <DestinationCard key={d.id} name={d.name} region={d.region} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-slate-500">No Mindanao destinations available yet.</p>
        )}
      </section>
    </div>
  );
}
