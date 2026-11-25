import { z } from "zod";

export const TITLE_MAX_LENGTH = 120;
export const DESCRIPTION_MAX_LENGTH = 1000;
export const TASKS_PAGE_SIZE = 10;

const tituloSchema = z
  .string({ required_error: "Title is required" })
  .trim()
  .min(1, "Title is required")
  .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters`);

const descricaoSchema = z
  .string()
  .trim()
  .max(
    DESCRIPTION_MAX_LENGTH,
    `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`,
  );

const idSchema = z.string().trim().min(1, "Task id is required");

export const taskFormSchema = z.object({
  titulo: tituloSchema,
  descricao: descricaoSchema,
});
export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const createTaskSchema = z.object({
  titulo: tituloSchema,
  descricao: descricaoSchema.optional(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.extend({ id: idSchema });
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const taskIdSchema = z.object({ id: idSchema });
export type TaskIdInput = z.infer<typeof taskIdSchema>;

export const listTasksSchema = z.object({
  limit: z.number().int().min(1).max(50).default(TASKS_PAGE_SIZE),
  cursor: z.string().nullish(),
});
export type ListTasksInput = z.infer<typeof listTasksSchema>;
