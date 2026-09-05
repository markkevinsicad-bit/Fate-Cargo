import type { Metadata } from "next";
import { PackageSearch, Phone } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = { title: "Track Shipment" };

export default function TrackPage() {
  return (
    <div className="container-page max-w-2xl py-14">
      <h1 className="text-3xl font-bold text-slate-900">Track Your Cargo</h1>
      <p className="mt-2 text-slate-500">
        Once your shipment is booked, you&apos;ll receive a FATE Cargo ID and QR code you can use to
        follow its journey here.
      </p>

      <EmptyState
        className="mt-10"
        icon={<PackageSearch className="h-8 w-8" />}
        title="Shipment tracking is not live yet."
        description="Booking, FATE Cargo IDs and QR tracking are part of the next phase of FATE CARGO 360. In the meantime, our team can check the status of your cargo by phone."
        action={
          <Button asChild variant="outline">
            <a href={`tel:${COMPANY.phones[0]}`}>
              <Phone className="h-4 w-4" /> Call {COMPANY.phones[0]}
            </a>
          </Button>
        }
      />
    </div>
  );
}
