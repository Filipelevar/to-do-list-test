"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { ClipboardList, Loader2, Plus, RotateCcw, WifiOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskListSkeleton } from "@/components/tasks/task-list-skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { taskListInput, taskListPagination } from "@/lib/task-queries";
import { pluralize } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import type { Task, TaskPage } from "@/types/task";

export function TaskDashboard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const tasksQuery = useInfiniteQuery(
    trpc.task.list.infiniteQueryOptions(taskListInput, taskListPagination),
  );

  const deleteTask = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: ({ id }) => {
        queryClient.setQueryData<InfiniteData<TaskPage>>(
          trpc.task.list.infiniteQueryKey(taskListInput),
          (data) =>
            data && {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items.filter((task) => task.id !== id),
                total: Math.max(0, page.total - 1),
              })),
            },
        );
        queryClient.removeQueries({ queryKey: trpc.task.byId.queryKey({ id }) });
        toast.success("Task deleted");
      },
      onError: (error) => {
        toast.error("Could not delete the task", { description: error.message });
      },
      onSettled: () => queryClient.invalidateQueries(trpc.task.list.pathFilter()),
    }),
  );

  const tasks = tasksQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const total = tasksQuery.data?.pages.at(-1)?.total ?? 0;
  const deletingId = deleteTask.isPending ? deleteTask.variables?.id : undefined;

  return (
    <section aria-labelledby="tasks-heading">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div className="flex items-center gap-3">
          <h1
            id="tasks-heading"
            className="text-2xl font-semibold tracking-tight text-stone-900"
          >
            My tasks
          </h1>
          {tasksQuery.isSuccess && (
            <span
              className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-xs font-medium text-stone-500"
              aria-live="polite"
            >
              {pluralize(total, "task")}
            </span>
          )}
        </div>
        <Link href="/tasks/new" className={buttonVariants()}>
          <Plus className="size-4" aria-hidden />
          New task
        </Link>
      </header>

      {tasksQuery.isPending ? (
        <TaskListSkeleton />
      ) : tasksQuery.isError && tasks.length === 0 ? (
        <ErrorState
          message={tasksQuery.error.message}
          onRetry={() => tasksQuery.refetch()}
          isRetrying={tasksQuery.isRefetching}
        />
      ) : tasks.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.id}>
                <TaskCard
                  task={task}
                  isDeleting={deletingId === task.id}
                  onDelete={setTaskToDelete}
                />
              </li>
            ))}
          </ul>
          <LoadMore
            hasNextPage={tasksQuery.hasNextPage}
            isFetchingNextPage={tasksQuery.isFetchingNextPage}
            isError={tasksQuery.isFetchNextPageError}
            onLoadMore={() => tasksQuery.fetchNextPage()}
          />
        </>
      )}

      <DeleteTaskDialog
        task={taskToDelete}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={(task) => {
          setTaskToDelete(null);
          deleteTask.mutate({ id: task.id });
        }}
      />
    </section>
  );
}

function LoadMore({
  hasNextPage,
  isFetchingNextPage,
  isError,
  onLoadMore,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  onLoadMore: () => void;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage || isError) return;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && onLoadMoreRef.current(),
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isError]);

  if (!hasNextPage) {
    return (
      <p className="py-8 text-center text-xs text-stone-400">
        You&rsquo;re all caught up
      </p>
    );
  }

  return (
    <div ref={sentinelRef} className="flex justify-center py-6">
      {isFetchingNextPage ? (
        <span className="flex items-center gap-2 text-sm text-stone-400" role="status">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading more tasks…
        </span>
      ) : (
        <Button variant="secondary" size="sm" onClick={onLoadMore}>
          {isError ? "Failed to load. Try again" : "Load more"}
        </Button>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-indigo-50">
        <ClipboardList className="size-6 text-indigo-600" aria-hidden />
      </div>
      <h2 className="font-semibold text-stone-900">No tasks yet</h2>
      <p className="mt-1 max-w-xs text-sm text-stone-500">
        Create your first task to start organizing what needs to get done.
      </p>
      <Link href="/tasks/new" className={buttonVariants({ className: "mt-6" })}>
        <Plus className="size-4" aria-hidden />
        Create a task
      </Link>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-2xl border border-red-100 bg-red-50/50 px-6 py-16 text-center"
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
        <WifiOff className="size-6 text-red-600" aria-hidden />
      </div>
      <h2 className="font-semibold text-stone-900">Could not load your tasks</h2>
      <p className="mt-1 max-w-sm text-sm text-stone-500">{message}</p>
      <Button variant="secondary" className="mt-6" onClick={onRetry} loading={isRetrying}>
        {!isRetrying && <RotateCcw className="size-4" aria-hidden />}
        Try again
      </Button>
    </div>
  );
}
