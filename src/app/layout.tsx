import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Toaster } from "sonner";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: `${COMPANY.productName} | ${COMPANY.name}`,
    template: `%s | ${COMPANY.productName}`,
  },
  description: COMPANY.tagline,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-white text-slate-900">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
