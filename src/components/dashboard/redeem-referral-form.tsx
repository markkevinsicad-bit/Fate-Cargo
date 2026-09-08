"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { redeemReferralCode } from "@/actions/referrals";

export function RedeemReferralForm() {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);
    const result = await redeemReferralCode(code);
    setSubmitting(false);
    if (result.success) {
      setRedeemed(true);
      toast.success("Referral code applied!");
    } else {
      toast.error(result.error);
    }
  }

  if (redeemed) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-emerald-700">Referral code applied. Thanks for joining through a friend!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <FormField label="Have a referral code?" htmlFor="redeem_code" className="flex-1">
            <Input id="redeem_code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="FATE-REFER-ABC123" />
          </FormField>
          <Button type="submit" disabled={submitting}>
            Apply Code
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
