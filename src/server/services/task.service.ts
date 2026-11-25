import "server-only";

import type {
  CreateTaskInput,
  ListTasksInput,
  UpdateTaskInput,
} from "@/lib/validations/task.schema";
import {
  taskRepository,
  type TaskRepository,
} from "@/server/repositories/task.repository";
import type { Task, TaskPage } from "@/types/task";

export class TaskNotFoundError extends Error {
  constructor(public readonly taskId: string) {
    super(`Task "${taskId}" was not found`);
    this.name = "TaskNotFoundError";
  }
}

const compareNewestFirst = (a: Task, b: Task) =>
  b.dataCriacao.getTime() - a.dataCriacao.getTime() || b.id.localeCompare(a.id);

// The cursor is "<createdAt>_<id>" of the last task on the page. Unlike an
// offset, it does not skip or repeat tasks when others are created or deleted.
const encodeCursor = (task: Task) => `${task.dataCriacao.getTime()}_${task.id}`;

const decodeCursor = (cursor: string): Task | null => {
  const separator = cursor.indexOf("_");
  const time = Number(cursor.slice(0, separator));
  const id = cursor.slice(separator + 1);
  if (separator < 1 || !Number.isFinite(time) || !id) return null;
  return { id, titulo: "", dataCriacao: new Date(time) };
};

const normalizeDescription = (descricao?: string) => descricao || undefined;

export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  async list({ limit, cursor }: ListTasksInput): Promise<TaskPage> {
    const sorted = (await this.repository.findAll()).sort(compareNewestFirst);
    const anchor = cursor ? decodeCursor(cursor) : null;
    const remaining = anchor
      ? sorted.filter((task) => compareNewestFirst(anchor, task) < 0)
      : sorted;

    const items = remaining.slice(0, limit);
    const hasMore = remaining.length > limit;

    return {
      items,
      nextCursor: hasMore ? encodeCursor(items[items.length - 1]) : null,
      total: sorted.length,
    };
  }

  async getById(id: string): Promise<Task> {
    const task = await this.repository.findById(id);
    if (!task) throw new TaskNotFoundError(id);
    return task;
  }

  async create(input: CreateTaskInput): Promise<Task> {
    return this.repository.insert({
      id: crypto.randomUUID(),
      titulo: input.titulo,
      descricao: normalizeDescription(input.descricao),
      dataCriacao: new Date(),
    });
  }

  async update({ id, ...changes }: UpdateTaskInput): Promise<Task> {
    const current = await this.getById(id);
    const updated = await this.repository.update({
      ...current,
      titulo: changes.titulo,
      descricao: normalizeDescription(changes.descricao),
    });
    if (!updated) throw new TaskNotFoundError(id);
    return updated;
  }

  async delete(id: string): Promise<{ id: string }> {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new TaskNotFoundError(id);
    return { id };
  }
}

export const taskService = new TaskService(taskRepository);
