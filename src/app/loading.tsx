import { TaskListSkeleton } from "@/components/tasks/task-list-skeleton";

export default function Loading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between border-b border-stone-200/80 pb-6">
        <div className="h-8 w-36 animate-pulse rounded-lg bg-stone-200/70" />
        <div className="h-10 w-28 animate-pulse rounded-lg bg-stone-200/70" />
      </div>
      <TaskListSkeleton />
    </div>
  );
}
