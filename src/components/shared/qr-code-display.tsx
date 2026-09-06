"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function QrCodeDisplay({
  token,
  fateCargoId,
  size = 240,
}: {
  token: string;
  fateCargoId: string;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(token, {
      width: size,
      margin: 1,
      color: { dark: "#0b3d68", light: "#ffffff" },
    }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [token, size]);

  useEffect(() => {
    if (!dataUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx?.drawImage(img, 0, 0, size, size);
    };
    img.src = dataUrl;
  }, [dataUrl, size]);

  function handleDownload() {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${fateCargoId}-qr.png`;
    link.click();
  }

  async function handleShare() {
    if (!dataUrl) return;
    try {
      if (navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `${fateCargoId}-qr.png`, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `FATE Cargo ${fateCargoId}`,
            text: `Track my FATE Cargo shipment: ${fateCargoId}`,
            files: [file],
          });
          return;
        }
        await navigator.share({
          title: `FATE Cargo ${fateCargoId}`,
          text: `Track my FATE Cargo shipment: ${fateCargoId}`,
        });
        return;
      }
      await navigator.clipboard.writeText(fateCargoId);
      toast.success("FATE Cargo ID copied to clipboard.");
    } catch {
      // User cancelled the share sheet - not an error worth surfacing.
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {dataUrl ? (
          <canvas ref={canvasRef} width={size} height={size} className="block" />
        ) : (
          <div style={{ width: size, height: size }} className="animate-pulse rounded-lg bg-slate-100" />
        )}
      </div>
      <p className="text-center font-mono text-sm font-semibold tracking-wide text-slate-700">{fateCargoId}</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={!dataUrl}>
          <Download className="h-4 w-4" /> Download
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare} disabled={!dataUrl}>
          <Share2 className="h-4 w-4" /> Share
        </Button>
      </div>
    </div>
  );
}
