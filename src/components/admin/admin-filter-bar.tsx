"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Option = { value: string; label: string };

export function AdminFilterBar({
  searchPlaceholder = "Search…",
  statusOptions,
  destinationOptions,
  driverOptions,
}: {
  searchPlaceholder?: string;
  statusOptions?: Option[];
  destinationOptions?: Option[];
  driverOptions?: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", q || null);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} />
        <Button type="submit" size="icon" variant="outline" aria-label="Search">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {statusOptions && (
        <Select
          value={searchParams.get("status") ?? "__all__"}
          onValueChange={(v) => updateParam("status", v === "__all__" ? null : v)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            {statusOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {destinationOptions && (
        <Select
          value={searchParams.get("destination") ?? "__all__"}
          onValueChange={(v) => updateParam("destination", v === "__all__" ? null : v)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All destinations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All destinations</SelectItem>
            {destinationOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {driverOptions && (
        <Select
          value={searchParams.get("driver") ?? "__all__"}
          onValueChange={(v) => updateParam("driver", v === "__all__" ? null : v)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All drivers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All drivers</SelectItem>
            {driverOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
