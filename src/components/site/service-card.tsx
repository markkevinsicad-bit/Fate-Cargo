import type { ComponentType } from "react";
import { Truck, Package, Home, Building2, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
}: {
  name: string;
  description: string | null;
  icon: string | null;
}) {
  const Icon = (icon && ICONS[icon]) || Package;
  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle>{name}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent />
    </Card>
  );
}
