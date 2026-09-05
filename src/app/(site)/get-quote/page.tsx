import type { Metadata } from "next";
import { QuoteForm } from "@/components/forms/quote-form";
import { getActiveDestinations, getActiveCargoCategories } from "@/lib/data/public";

export const metadata: Metadata = { title: "Get a Quote" };

export default async function GetQuotePage() {
  const [destinations, cargoCategories] = await Promise.all([
    getActiveDestinations(),
    getActiveCargoCategories(),
  ]);

  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="text-3xl font-bold text-slate-900">Get a Quote</h1>
      <p className="mt-2 text-slate-500">
        Tell us about your shipment and our team will review it and follow up with a quote.
        Pricing is finalized by our admin team after reviewing your request.
      </p>

      <div className="mt-10">
        <QuoteForm destinations={destinations} cargoCategories={cargoCategories} />
      </div>
    </div>
  );
}
