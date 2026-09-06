import type { ComponentType } from "react";
import { AlertTriangle, HeartPulse, Weight, Maximize2, Star, ShieldAlert, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SPECIAL_HANDLING_LABELS, type SpecialHandling } from "@/lib/constants";

const ICONS: Record<SpecialHandling, ComponentType<{ className?: string }>> = {
  fragile: AlertTriangle,
  medical: HeartPulse,
  heavy: Weight,
  oversized: Maximize2,
  high_value: Star,
  special_protection: ShieldAlert,
  other: Info,
};

const VARIANTS: Record<SpecialHandling, "destructive" | "warning" | "default"> = {
  fragile: "warning",
  medical: "destructive",
  heavy: "warning",
  oversized: "warning",
  high_value: "default",
  special_protection: "destructive",
  other: "default",
};

export function SpecialHandlingBadges({ items, className }: { items: readonly string[]; className?: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div className={className ? className : "flex flex-wrap gap-1.5"}>
      {items.map((item) => {
        const key = item as SpecialHandling;
        const Icon = ICONS[key] ?? Info;
        return (
          <Badge key={item} variant={VARIANTS[key] ?? "default"} className="uppercase">
            <Icon className="h-3 w-3" />
            {SPECIAL_HANDLING_LABELS[key] ?? item}
          </Badge>
        );
      })}
    </div>
  );
}
