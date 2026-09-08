"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { uploadCargoPhoto } from "@/lib/storage/cargo-photos";
import { completePickup } from "@/actions/pickups";

export function PickupCompleteForm({
  pickupId,
  shipmentId,
  onDone,
}: {
  pickupId: string;
  shipmentId: string;
  onDone: () => void;
}) {
  const [condition, setCondition] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const next = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...next].slice(0, 6));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!condition.trim()) {
      toast.error("Please describe the cargo condition.");
      return;
    }
    setSubmitting(true);

    const photoPaths: string[] = [];
    for (const { file } of photos) {
      const result = await uploadCargoPhoto(file, shipmentId, `pickup-${pickupId}`);
      if (!result.success) {
        toast.error(result.error);
        setSubmitting(false);
        return;
      }
      photoPaths.push(result.path);
    }

    const result = await completePickup({ pickupId, condition, notes, photoPaths });
    setSubmitting(false);

    if (result.success) {
      toast.success("Pickup completed.");
      onDone();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Cargo Condition" htmlFor="pu_condition" required hint="e.g. Good, boxes intact">
        <Input id="pu_condition" value={condition} onChange={(e) => setCondition(e.target.value)} autoFocus />
      </FormField>
      <FormField label="Notes" htmlFor="pu_notes">
        <Textarea id="pu_notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </FormField>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-800">Pickup Photos (optional, up to 6)</p>
        <div className="flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-md border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.preview} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {photos.length < 6 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-slate-300 text-slate-400 hover:border-primary hover:text-primary"
            >
              <Camera className="h-5 w-5" />
              <span className="text-[10px]">Add photo</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          multiple
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Confirm Cargo Picked Up
      </Button>
    </form>
  );
}
