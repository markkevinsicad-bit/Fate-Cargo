import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export function ComingSoonModule({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <Badge variant="secondary">Phase 2</Badge>
      </div>
      <EmptyState icon={<Icon className="h-8 w-8" />} title="This module isn't built yet." description={description} />
    </div>
  );
}
