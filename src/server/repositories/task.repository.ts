import "server-only";

import type { Task } from "@/types/task";

export interface TaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  insert(task: Task): Promise<Task>;
  update(task: Task): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}

const clone = (task: Task): Task => ({
  ...task,
  dataCriacao: new Date(task.dataCriacao),
});

export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks = new Map<string, Task>();

  async findAll() {
    return Array.from(this.tasks.values(), clone);
  }

  async findById(id: string) {
    const task = this.tasks.get(id);
    return task ? clone(task) : null;
  }

  async insert(task: Task) {
    this.tasks.set(task.id, clone(task));
    return clone(task);
  }

  async update(task: Task) {
    if (!this.tasks.has(task.id)) return null;
    this.tasks.set(task.id, clone(task));
    return clone(task);
  }

  async delete(id: string) {
    return this.tasks.delete(id);
  }

  async count() {
    return this.tasks.size;
  }
}

const globalForRepository = globalThis as unknown as {
  taskRepository?: TaskRepository;
};

export const taskRepository: TaskRepository =
  globalForRepository.taskRepository ?? new InMemoryTaskRepository();

globalForRepository.taskRepository = taskRepository;
