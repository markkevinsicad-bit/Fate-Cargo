import { Ship } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMPANY } from "@/lib/constants";

export function Logo({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-sm ring-2 ring-secondary/40">
        <Ship className="h-5 w-5 text-secondary" strokeWidth={2.2} />
      </span>
      <span className="leading-none">
        <span className="flex items-baseline gap-1">
          <span className={cn("text-lg font-extrabold tracking-tight", dark ? "text-white" : "text-primary")}>
            CARGO
          </span>
          <span className="text-lg font-extrabold tracking-tight text-secondary">360</span>
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
