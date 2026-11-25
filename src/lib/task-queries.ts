import { TASKS_PAGE_SIZE } from "@/lib/validations/task.schema";
import type { TaskPage } from "@/types/task";

export const taskListInput = { limit: TASKS_PAGE_SIZE };

export const taskListPagination = {
  getNextPageParam: (lastPage: TaskPage) => lastPage.nextCursor,
};
