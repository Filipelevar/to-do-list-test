import {
  createTaskSchema,
  listTasksSchema,
  taskIdSchema,
  updateTaskSchema,
} from "@/lib/validations/task.schema";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { taskService } from "@/server/services/task.service";

export const taskRouter = createTRPCRouter({
  list: publicProcedure
    .input(listTasksSchema)
    .query(({ input }) => taskService.list(input)),

  byId: publicProcedure
    .input(taskIdSchema)
    .query(({ input }) => taskService.getById(input.id)),

  create: publicProcedure
    .input(createTaskSchema)
    .mutation(({ input }) => taskService.create(input)),

  update: publicProcedure
    .input(updateTaskSchema)
    .mutation(({ input }) => taskService.update(input)),

  delete: publicProcedure
    .input(taskIdSchema)
    .mutation(({ input }) => taskService.delete(input.id)),
});
