import { SearchX } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-stone-100">
        <SearchX className="size-6 text-stone-500" aria-hidden />
      </div>
      <h1 className="font-semibold text-stone-900">Task not found</h1>
      <p className="mt-1 max-w-xs text-sm text-stone-500">
        It may have been deleted, or the link is incorrect.
      </p>
      <Link
        href="/"
        className={buttonVariants({ variant: "secondary", className: "mt-6" })}
      >
        Back to tasks
      </Link>
    </div>
  );
}
