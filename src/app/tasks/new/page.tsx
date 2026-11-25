import type { Metadata } from "next";

import { TaskForm } from "@/components/tasks/task-form";
import { TaskFormCard } from "@/components/tasks/task-form-card";

export const metadata: Metadata = { title: "New task" };

export default function NewTaskPage() {
  return (
    <TaskFormCard
      title="New task"
      description="Give your task a clear title and, if needed, some details."
    >
      <TaskForm mode="create" />
    </TaskFormCard>
  );
}
