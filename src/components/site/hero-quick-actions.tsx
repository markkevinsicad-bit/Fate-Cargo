"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus, MapPinned, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function HeroQuickActions() {
  const router = useRouter();
  const [trackId, setTrackId] = useState("");

  function handleTrack(e: FormEvent) {
    e.preventDefault();
    if (!trackId.trim()) return;
    router.push(`/track?id=${encodeURIComponent(trackId.trim())}`);
  }

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary-dark">
            <PackagePlus className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold text-slate-900">Book a Shipment</p>
            <p className="text-xs text-slate-500">Get a quote and schedule your cargo delivery.</p>
          </div>
        </div>
        <Button asChild className="mt-4 w-full justify-between rounded-full">
          <Link href="/login">
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="bg-primary p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-secondary">
            <MapPinned className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold text-white">Track Your Shipment</p>
            <p className="text-xs text-slate-300">Enter your FATE Cargo ID.</p>
          </div>
        </div>
        <form onSubmit={handleTrack} className="mt-4 flex gap-2">
          <Input
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            placeholder="FATE-2026-000123"
            className="border-white/20 bg-white/10 text-white placeholder:text-slate-300 focus-visible:ring-secondary"
          />
          <Button type="submit" variant="secondary" size="icon" aria-label="Track shipment" className="shrink-0 rounded-full">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
