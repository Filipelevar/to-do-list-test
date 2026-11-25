import { TaskDashboard } from "@/components/tasks/task-list";
import { taskListInput, taskListPagination } from "@/lib/task-queries";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await getQueryClient().prefetchInfiniteQuery(
    trpc.task.list.infiniteQueryOptions(taskListInput, taskListPagination),
  );

  return (
    <HydrateClient>
      <TaskDashboard />
    </HydrateClient>
  );
}
