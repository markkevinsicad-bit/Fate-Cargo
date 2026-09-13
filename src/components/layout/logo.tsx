import Image from "next/image";
import { cn } from "@/lib/utils";
import { COMPANY } from "@/lib/constants";

/*
  LOGO IMAGE — drop your icon/badge file at:
    public/images/logo-icon.png
  (transparent-background PNG or SVG recommended, roughly square,
  at least 128x128px, so it looks sharp on retina screens. Any of
  .png / .svg / .webp / .jpg works — just update the filename below
  to match.)

  This renders your image INSIDE the circular badge, next to the
  "CARGO 360" text - matching the layout in the reference design.

  If your logo file is a full lockup that ALREADY includes the words
  "CARGO 360" baked into the image (not just an icon), skip the badge
  circle entirely and replace this whole component's return with:

    return (
      <Image src="/images/logo-full.png" alt={COMPANY.name} width={180} height={48} className={className} />
    );
*/
export function Logo({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-secondary/40">
        <Image src="/images/logo-icon.png" alt={`${COMPANY.name} logo`} fill className="object-contain p-1.5" />
      </span>
      <span className="leading-none">
        <span className="flex items-baseline gap-1">
          <span className={cn("text-lg font-extrabold tracking-tight", dark ? "text-white" : "text-primary")}>
            FATE
          </span>
          <span className="text-lg font-extrabold tracking-tight text-secondary">CARGO</span>
        </span>
        <span
          className={cn(
            "mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.14em]",
            dark ? "text-slate-300" : "text-slate-500",
          )}
        >
          {COMPANY.name} Delivery Services
        </span>
      </span>
    </div>
  );
}
