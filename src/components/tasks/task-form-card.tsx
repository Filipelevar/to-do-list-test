import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function TaskFormCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 rounded-md text-sm text-stone-500 transition-colors hover:text-stone-900 focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to tasks
      </Link>
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight text-stone-900">{title}</h1>
        <p className="mt-1 mb-8 text-sm text-stone-500">{description}</p>
        {children}
      </div>
    </div>
  );
}
