import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StaffLoginForm } from "@/components/forms/staff-login-form";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = { title: "Staff Login" };

export default function StaffLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-14">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-dark text-white">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Staff Login</h1>
          <p className="mt-1 text-sm text-slate-500">
            For {COMPANY.name} admin, staff, warehouse, and driver accounts.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Suspense fallback={<div className="h-40" />}>
              <StaffLoginForm />
            </Suspense>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          Not a staff member?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Customer login
          </Link>
        </p>
      </div>
    </div>
  );
}
