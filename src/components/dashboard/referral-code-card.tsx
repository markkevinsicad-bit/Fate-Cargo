"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Share2, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getMyReferralCode } from "@/actions/referrals";
import { COMPANY } from "@/lib/constants";

export function ReferralCodeCard() {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReferralCode().then((result) => {
      setLoading(false);
      if ("code" in result) setCode(result.code);
      else toast.error(result.error);
    });
  }, []);

  const shareText = code
    ? `Ship with ${COMPANY.name}! Use my referral code ${code} when you sign up: ${COMPANY.productName}.`
    : "";

  async function handleCopy() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    toast.success("Referral code copied.");
  }

  async function handleShare() {
    if (!code) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: COMPANY.name, text: shareText });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Referral message copied to clipboard.");
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <Gift className="h-4 w-4 text-primary" /> Your Referral Code
        </h2>
        {loading ? (
          <div className="flex items-center gap-2 text-slate-500">
            <Spinner /> Loading…
          </div>
        ) : code ? (
          <>
            <p className="rounded-lg bg-slate-50 px-4 py-3 text-center font-mono text-lg font-bold text-primary">
              {code}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500">Could not load your referral code.</p>
        )}
      </CardContent>
    </Card>
  );
}
