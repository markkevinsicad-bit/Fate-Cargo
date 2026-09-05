import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { AdminQuoteRow } from "@/components/admin/admin-quote-row";
import type { Database } from "@/lib/supabase/database.types";

export default async function AdminQuotesPage() {
  const supabase = await createClient();
  const { data: quotesRaw } = await supabase
    .from("quote_requests")
    .select("*, destinations(name), cargo_categories(name)")
    .order("created_at", { ascending: false })
    .limit(100);
  const quotes = quotesRaw as unknown as Array<
    Database["public"]["Tables"]["quote_requests"]["Row"] & {
      destinations: { name: string } | null;
      cargo_categories: { name: string } | null;
    }
  > | null;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Quote Requests</h1>
      <p className="mb-6 text-slate-500">Review requests and provide a quote or update their status.</p>

      {quotes && quotes.length > 0 ? (
        <div className="space-y-3">
          {quotes.map((q) => (
            <AdminQuoteRow key={q.id} quote={q} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ClipboardList className="h-8 w-8" />}
          title="No quote requests yet."
          description="Submitted quote requests from the public website will appear here."
        />
      )}
    </div>
  );
}
