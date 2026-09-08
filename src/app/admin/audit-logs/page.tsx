import { ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAuditLogs } from "@/lib/data/growth";
import { formatDate } from "@/lib/utils";

const ENTITY_TYPES = ["shipment", "pickup", "delivery", "profile"];

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  const { entity } = await searchParams;
  const logs = await getAuditLogs(entity);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Audit Logs</h1>
      <p className="mb-6 text-slate-500">Operational action history across the system (most recent 100).</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <a href="/admin/audit-logs" className={`rounded-full px-3 py-1 text-xs font-medium ${!entity ? "bg-primary text-white" : "bg-slate-100 text-slate-600"}`}>
          All
        </a>
        {ENTITY_TYPES.map((e) => (
          <a
            key={e}
            href={`/admin/audit-logs?entity=${e}`}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${entity === e ? "bg-primary text-white" : "bg-slate-100 text-slate-600"}`}
          >
            {e}
          </a>
        ))}
      </div>

      {logs.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                  <div>
                    <span className="font-medium text-slate-900">{log.action.replace(/_/g, " ")}</span>
                    <span className="ml-2 text-slate-500">
                      {log.entity_type}
                      {log.entity_id ? ` #${log.entity_id.slice(0, 8)}` : ""}
                    </span>
                    <span className="ml-2 text-xs text-slate-400">by {log.profiles?.full_name ?? "System"}</span>
                    {log.actor_role && (
                      <Badge variant="outline" className="ml-2 text-[10px] capitalize">
                        {log.actor_role}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(log.created_at)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState icon={<ShieldCheck className="h-8 w-8" />} title="No audit log entries yet." />
      )}
    </div>
  );
}
