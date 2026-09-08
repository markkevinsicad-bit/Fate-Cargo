"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { uploadCargoPhoto } from "@/lib/storage/cargo-photos";
import { completeDelivery } from "@/actions/deliveries";

export function ProofOfDeliveryForm({
  deliveryId,
  shipmentId,
  defaultRecipientName,
  onDone,
}: {
  deliveryId: string;
  shipmentId: string;
  defaultRecipientName?: string;
  onDone: () => void;
}) {
  const [recipientName, setRecipientName] = useState(defaultRecipientName ?? "");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhoto({ file, preview: URL.createObjectURL(file) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientName.trim()) {
      toast.error("Recipient name is required.");
      return;
    }
    setSubmitting(true);

    let photoPath: string | undefined;
    if (photo) {
      const result = await uploadCargoPhoto(photo.file, shipmentId, `delivery-${deliveryId}`);
      if (!result.success) {
        toast.error(result.error);
        setSubmitting(false);
        return;
      }
      photoPath = result.path;
    }

    const result = await completeDelivery({ deliveryId, recipientName, photoPath, notes });
    setSubmitting(false);

    if (result.success) {
      toast.success("Delivery completed.");
      onDone();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Recipient Name" htmlFor="pod_recipient" required hint="Who received the cargo?">
        <Input id="pod_recipient" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} autoFocus />
      </FormField>
      <FormField label="Delivery Notes" htmlFor="pod_notes">
        <Textarea id="pod_notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </FormField>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-800">Delivery Photo (optional)</p>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.preview} alt="" className="h-32 w-32 rounded-md object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-slate-300 text-slate-400 hover:border-primary hover:text-primary"
          >
            <Camera className="h-6 w-6" />
            <span className="text-xs">Add photo</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Complete Delivery
      </Button>
    </form>
  );
}
