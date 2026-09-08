import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SetNewPasswordForm } from "@/components/forms/set-new-password-form";

export const metadata: Metadata = { title: "Reset Password" };

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-14">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-dark text-white">
            <KeyRound className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Set a New Password</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <SetNewPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
