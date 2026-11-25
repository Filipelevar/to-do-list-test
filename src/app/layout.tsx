import { CheckSquare } from "lucide-react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Toaster } from "sonner";

import { TRPCReactProvider } from "@/trpc/client";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Task Manager", template: "%s · Task Manager" },
  description: "A simple task manager built with Next.js, tRPC and TypeScript.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <TRPCReactProvider>
          <div className="min-h-dvh">
            <header className="sticky top-0 z-10 border-b border-stone-200/70 bg-[#f5f5f3]/85 backdrop-blur">
              <div className="mx-auto flex h-14 max-w-3xl items-center px-4 sm:px-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-md text-sm font-semibold text-stone-900 focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:outline-none"
                >
                  <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                    <CheckSquare className="size-4" aria-hidden />
                  </span>
                  Task Manager
                </Link>
              </div>
            </header>
            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
              {children}
            </main>
          </div>
          <Toaster position="bottom-right" richColors closeButton />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
