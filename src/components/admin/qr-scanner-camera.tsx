"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import jsQR from "jsqr";
import { Camera, CameraOff, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CameraState = "idle" | "requesting" | "active" | "denied" | "unavailable" | "error";

export function QrScannerCamera({ onScan }: { onScan: (token: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastScanRef = useRef<string | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [manualMode, setManualMode] = useState(false);
  const [manualValue, setManualValue] = useState("");

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const tickRef = useRef<() => void>(() => {});

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        if (code && code.data && code.data !== lastScanRef.current) {
          lastScanRef.current = code.data;
          onScan(code.data);
          return; // stop scanning loop until parent resets
        }
      }
    }
    rafRef.current = requestAnimationFrame(() => tickRef.current());
  }, [onScan]);

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unavailable");
      return;
    }
    setCameraState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("active");
      lastScanRef.current = null;
      rafRef.current = requestAnimationFrame(() => tickRef.current());
    } catch (err) {
      const name = (err as DOMException)?.name;
      setCameraState(name === "NotAllowedError" ? "denied" : "error");
    }
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (manualValue.trim()) {
      onScan(manualValue.trim());
      setManualValue("");
    }
  }

  if (manualMode) {
    return (
      <div className="space-y-4">
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <Label htmlFor="manual_fate_id">FATE Cargo ID or QR Token</Label>
          <Input
            id="manual_fate_id"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            placeholder="e.g. FATE-2026-001294"
            autoFocus
          />
          <Button type="submit" className="w-full">
            Look Up Shipment
          </Button>
        </form>
        <Button variant="ghost" size="sm" onClick={() => setManualMode(false)}>
          <Camera className="h-4 w-4" /> Use camera instead
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-900">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        {cameraState !== "active" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
            {cameraState === "idle" && (
              <>
                <Camera className="h-10 w-10 opacity-70" />
                <p className="text-sm">Tap below to enable your camera and scan a shipment QR code.</p>
                <Button onClick={startCamera}>
                  <Camera className="h-4 w-4" /> Start Camera
                </Button>
              </>
            )}
            {cameraState === "requesting" && <p className="text-sm">Requesting camera access…</p>}
            {cameraState === "denied" && (
              <>
                <CameraOff className="h-10 w-10 opacity-70" />
                <p className="text-sm">
                  Camera access was denied. Enable camera permissions in your browser settings, or enter
                  the FATE Cargo ID manually below.
                </p>
              </>
            )}
            {(cameraState === "unavailable" || cameraState === "error") && (
              <>
                <CameraOff className="h-10 w-10 opacity-70" />
                <p className="text-sm">
                  Camera scanning isn&apos;t available on this device/browser. Please enter the FATE
                  Cargo ID manually below.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <Button variant="outline" className="w-full" onClick={() => setManualMode(true)}>
        <Keyboard className="h-4 w-4" /> Enter FATE Cargo ID manually instead
      </Button>
    </div>
  );
}
