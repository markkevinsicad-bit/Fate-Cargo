"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MapPinned, ArrowRight, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TrackCoverageBanner() {
  const router = useRouter();
  const [trackId, setTrackId] = useState("");

  function handleTrack(e: FormEvent) {
    e.preventDefault();
    if (!trackId.trim()) return;
    router.push(`/track?id=${encodeURIComponent(trackId.trim())}`);
  }

  return (
    <section className="bg-primary-dark py-14">
      <div className="container-page grid gap-10 lg:grid-cols-2">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-secondary">
            <MapPinned className="h-6 w-6" />
          </span>
          <div className="w-full">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">Track Your Shipment</p>
            <h2 className="mt-1 text-2xl font-extrabold text-white">Know Where Your Cargo Is</h2>
            <p className="mt-2 text-sm text-slate-300">
              Enter your FATE Cargo ID to get the latest updates on your shipment.
            </p>
            <form onSubmit={handleTrack} className="mt-4 flex max-w-md gap-2">
              <Input
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="Enter FATE Cargo ID"
                className="border-white/20 bg-white/10 text-white placeholder:text-slate-300 focus-visible:ring-secondary"
              />
              <Button type="submit" className="shrink-0 gap-1.5 rounded-full">
                Track <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="flex items-start gap-4 lg:border-l lg:border-white/10 lg:pl-10">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-secondary">
            <Globe2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">Service Coverage</p>
            <h2 className="mt-1 text-2xl font-extrabold text-white">We Ship Across Visayas & Mindanao</h2>
            <p className="mt-2 text-sm text-slate-300">
              Weekly scheduled loading, local pickups, and door-to-door delivery across our full destination
              network.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
