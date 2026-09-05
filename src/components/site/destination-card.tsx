import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DestinationCard({ name, region }: { name: string; region: "visayas" | "mindanao" }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[--color-secondary]/10 text-[--color-secondary-dark]">
          <MapPin className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{name}</p>
          <Badge variant="outline" className="mt-1 capitalize">{region}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
