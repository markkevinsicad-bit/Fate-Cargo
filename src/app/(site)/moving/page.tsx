import type { Metadata } from "next";
import { MovingForm } from "@/components/forms/moving-form";

export const metadata: Metadata = { title: "Lipat Bahay / Moving Services" };

export default function MovingPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="text-3xl font-bold text-slate-900">Lipat Bahay, Office & Condo Moving</h1>
      <p className="mt-2 text-slate-500">
        Whether it&apos;s a house, office, or condo move, tell us the details and we&apos;ll prepare a
        tailored moving plan and quote.
      </p>

      <div className="mt-10">
        <MovingForm />
      </div>
    </div>
  );
}
