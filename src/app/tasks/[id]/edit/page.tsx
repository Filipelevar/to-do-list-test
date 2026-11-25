import { TRPCError } from "@trpc/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TaskForm } from "@/components/tasks/task-form";
import { TaskFormCard } from "@/components/tasks/task-form-card";
import { serverCaller } from "@/trpc/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit task" };

type EditTaskPageProps = { params: Promise<{ id: string }> };

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params;

  const caller = await serverCaller();
  const task = await caller.task.byId({ id }).catch((error: unknown) => {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") notFound();
    throw error;
  });

  return (
    <TaskFormCard
      title="Edit task"
      description="Update the title or description of this task."
    >
      <TaskForm mode="edit" task={task} />
    </TaskFormCard>
  );
}
