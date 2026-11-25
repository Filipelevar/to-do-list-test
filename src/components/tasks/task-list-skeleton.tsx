export function TaskCardSkeleton() {
  return (
    <div className="rounded-xl border border-stone-200/80 bg-white px-5 py-4">
      <div className="h-3 w-24 animate-pulse rounded bg-stone-100" />
      <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-stone-200/70" />
      <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-stone-100" />
    </div>
  );
}

export function TaskListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading tasks">
      {Array.from({ length: count }, (_, index) => (
        <TaskCardSkeleton key={index} />
      ))}
    </div>
  );
}
