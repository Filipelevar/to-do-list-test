import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { FormattedDate } from "@/components/ui/formatted-date";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

type TaskCardProps = {
  task: Task;
  isDeleting: boolean;
  onDelete: (task: Task) => void;
};

export function TaskCard({ task, isDeleting, onDelete }: TaskCardProps) {
  return (
    <article
      aria-busy={isDeleting || undefined}
      className={cn(
        "group relative rounded-xl border border-stone-200/80 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition",
        "hover:border-stone-300 hover:shadow-[0_4px_16px_-6px_rgba(0,0,0,0.12)]",
        isDeleting && "pointer-events-none opacity-50",
      )}
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs text-stone-400">
            <CalendarDays className="size-3.5" aria-hidden />
            <span className="sr-only">Created </span>
            <FormattedDate date={task.dataCriacao} />
          </p>
          <h3 className="font-medium break-words text-stone-900">{task.titulo}</h3>
          {task.descricao ? (
            <p className="mt-1 line-clamp-3 text-sm break-words whitespace-pre-line text-stone-500">
              {task.descricao}
            </p>
          ) : (
            <p className="mt-1 text-sm text-stone-300 italic">No description</p>
          )}
        </div>

        <div className="flex items-center gap-1 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
          <Link
            href={`/tasks/${task.id}/edit`}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
            aria-label={`Edit "${task.titulo}"`}
            title="Edit"
          >
            <Pencil className="size-4" aria-hidden />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-red-50 hover:text-red-600"
            onClick={() => onDelete(task)}
            loading={isDeleting}
            aria-label={`Delete "${task.titulo}"`}
            title="Delete"
          >
            {!isDeleting && <Trash2 className="size-4" aria-hidden />}
          </Button>
        </div>
      </div>
    </article>
  );
}
