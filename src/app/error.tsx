"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-2xl border border-red-100 bg-white px-6 py-16 text-center"
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50">
        <TriangleAlert className="size-6 text-red-600" aria-hidden />
      </div>
      <h1 className="font-semibold text-stone-900">Something went wrong</h1>
      <p className="mt-1 text-sm text-stone-500">
        An unexpected error happened while loading this page.
      </p>
      <Button variant="secondary" className="mt-6" onClick={reset}>
        <RotateCcw className="size-4" aria-hidden />
        Try again
      </Button>
    </div>
  );
}
