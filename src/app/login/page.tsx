import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { OtpLoginForm } from "@/components/forms/otp-login-form";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = { title: "Customer Login" };

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-14">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
            <Package className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Customer Login</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to {COMPANY.name} 360 using your phone number - no password needed.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Suspense fallback={<div className="h-40" />}>
              <OtpLoginForm />
            </Suspense>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/" className="hover:text-primary">
            ← Back to home
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          FATE Cargo staff?{" "}
          <Link href="/staff-login" className="text-slate-500 hover:text-primary">
            Staff login
          </Link>
        </p>
      </div>
    </div>
  );
}
