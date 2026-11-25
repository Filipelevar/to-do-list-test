"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  taskFormSchema,
  type TaskFormValues,
} from "@/lib/validations/task.schema";
import { useTRPC } from "@/trpc/client";
import type { Task } from "@/types/task";

type TaskFormProps = { mode: "create" } | { mode: "edit"; task: Task };

export function TaskForm(props: TaskFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const isEdit = props.mode === "edit";

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      titulo: isEdit ? props.task.titulo : "",
      descricao: isEdit ? (props.task.descricao ?? "") : "",
    },
  });
  const { errors } = form.formState;
  const descriptionLength = form.watch("descricao")?.length ?? 0;

  const mutationCallbacks = {
    onSuccess: async (task: Task) => {
      await queryClient.invalidateQueries(trpc.task.list.pathFilter());
      queryClient.setQueryData(trpc.task.byId.queryKey({ id: task.id }), task);
      toast.success(isEdit ? "Task updated" : "Task created", {
        description: task.titulo,
      });
      router.push("/");
    },
    onError: (error: {
      message: string;
      data?: {
        code?: string;
        zodError?: { fieldErrors: Record<string, string[] | undefined> } | null;
      } | null;
    }) => {
      const fieldErrors = error.data?.zodError?.fieldErrors ?? {};
      for (const field of ["titulo", "descricao"] as const) {
        const message = fieldErrors[field]?.[0];
        if (message) form.setError(field, { message });
      }

      if (error.data?.code === "NOT_FOUND") {
        toast.error("This task no longer exists");
        router.push("/");
        return;
      }
      toast.error(isEdit ? "Could not update the task" : "Could not create the task", {
        description: error.message,
      });
    },
  };

  const createTask = useMutation(trpc.task.create.mutationOptions(mutationCallbacks));
  const updateTask = useMutation(trpc.task.update.mutationOptions(mutationCallbacks));
  const isSaving = createTask.isPending || updateTask.isPending;

  const onSubmit = form.handleSubmit((values) => {
    if (props.mode === "edit") updateTask.mutate({ id: props.task.id, ...values });
    else createTask.mutate(values);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="space-y-1.5">
        <label htmlFor="titulo" className="text-sm font-medium text-stone-800">
          Title{" "}
          <span className="text-red-500" aria-hidden>
            *
          </span>
        </label>
        <input
          id="titulo"
          autoFocus
          autoComplete="off"
          maxLength={TITLE_MAX_LENGTH}
          placeholder="e.g. Review project documentation"
          aria-invalid={!!errors.titulo}
          aria-describedby={errors.titulo ? "titulo-error" : undefined}
          className={cn(fieldClassName, errors.titulo && fieldErrorClassName)}
          {...form.register("titulo")}
        />
        {errors.titulo && (
          <p id="titulo-error" role="alert" className="text-sm text-red-600">
            {errors.titulo.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor="descricao" className="text-sm font-medium text-stone-800">
            Description <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <span
            className={cn(
              "text-xs tabular-nums",
              descriptionLength > DESCRIPTION_MAX_LENGTH
                ? "text-red-600"
                : "text-stone-400",
            )}
          >
            {descriptionLength}/{DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
        <textarea
          id="descricao"
          rows={5}
          placeholder="Add more details about this task…"
          aria-invalid={!!errors.descricao}
          aria-describedby={errors.descricao ? "descricao-error" : undefined}
          className={cn(
            fieldClassName,
            "resize-y py-2.5",
            errors.descricao && fieldErrorClassName,
          )}
          {...form.register("descricao")}
        />
        {errors.descricao && (
          <p id="descricao-error" role="alert" className="text-sm text-red-600">
            {errors.descricao.message}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-stone-100 pt-6 sm:flex-row sm:justify-end">
        <Link
          href="/"
          className={buttonVariants({ variant: "secondary" })}
          aria-disabled={isSaving}
        >
          Cancel
        </Link>
        <Button type="submit" loading={isSaving}>
          {isEdit ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}

const fieldClassName =
  "block w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-sm text-stone-900 shadow-sm " +
  "placeholder:text-stone-400 transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none";

const fieldErrorClassName = "border-red-400 focus:border-red-500 focus:ring-red-500/10";
