import type { ComponentType } from "react";
import Link from "next/link";
import { Truck, Package, Home, Building2, Building, ArrowRight } from "lucide-react";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  truck: Truck,
  package: Package,
  home: Home,
  "building-2": Building2,
  building: Building,
};

export function ServiceCard({
  name,
  description,
  icon,
  slug,
}: {
  name: string;
  description: string | null;
  icon: string | null;
  slug?: string;
}) {
  const Icon = (icon && ICONS[icon]) || Package;
  return (
    <div className="group flex h-full flex-col items-start rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        <Icon className="h-7 w-7" />
      </div>
      <p className="font-bold text-slate-900">{name}</p>
      {description && <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>}
      <Link
        href={slug ? `/services#${slug}` : "/services"}
        aria-label={`Learn more about ${name}`}
        className="mt-4 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors group-hover:border-secondary group-hover:bg-secondary group-hover:text-white"
      >
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
