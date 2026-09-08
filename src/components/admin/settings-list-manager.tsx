"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGIONS } from "@/lib/constants";
import {
  createDestination,
  toggleDestinationActive,
  createService,
  toggleServiceActive,
  createCargoCategory,
  toggleCargoCategoryActive,
} from "@/actions/settings";

type SettingType = "service" | "destination" | "cargo_category";
type Item = { id: string; name: string; active: boolean };

export function SettingsListManager({
  title,
  type,
  items,
  needsRegion,
}: {
  title: string;
  type: SettingType;
  items: Item[];
  needsRegion?: boolean;
}) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState<"visayas" | "mindanao">("visayas");
  const [localItems, setLocalItems] = useState(items);
  const [isPending, startTransition] = useTransition();

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const result =
      type === "service"
        ? await createService(name)
        : type === "destination"
          ? await createDestination(name, region)
          : await createCargoCategory(name);

    if (result.success) {
      toast.success(`${title.slice(0, -1)} added.`);
      setName("");
    } else {
      toast.error(result.error);
    }
  }

  function handleToggle(id: string, nextActive: boolean) {
    setLocalItems((prev) => prev.map((i) => (i.id === id ? { ...i, active: nextActive } : i)));
    startTransition(async () => {
      const result =
        type === "service"
          ? await toggleServiceActive(id, nextActive)
          : type === "destination"
            ? await toggleDestinationActive(id, nextActive)
            : await toggleCargoCategoryActive(id, nextActive);
      if (!result.success) {
        toast.error(result.error);
        setLocalItems((prev) => prev.map((i) => (i.id === id ? { ...i, active: !nextActive } : i)));
      }
    });
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-slate-900">{title}</h2>
      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleAdd} className="mb-4 flex flex-wrap gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Add a new ${title.toLowerCase().replace(/s$/, "")}…`}
              className="flex-1"
            />
            {needsRegion && (
              <Select value={region} onValueChange={(v) => setRegion(v as "visayas" | "mindanao")}>
                <SelectTrigger className="w-32 capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button type="submit">Add</Button>
          </form>

          <div className="space-y-2">
            {localItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm">
                <span className={item.active ? "" : "text-slate-400 line-through"}>{item.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={item.active ? "success" : "secondary"}>{item.active ? "Active" : "Inactive"}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleToggle(item.id, !item.active)}
                  >
                    {item.active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
            {localItems.length === 0 && <p className="text-sm text-slate-400">None yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
