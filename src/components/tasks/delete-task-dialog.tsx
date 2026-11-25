"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import type { Task } from "@/types/task";

type DeleteTaskDialogProps = {
  task: Task | null;
  onCancel: () => void;
  onConfirm: (task: Task) => void;
};

export function DeleteTaskDialog({ task, onCancel, onConfirm }: DeleteTaskDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (task && !dialog.open) dialog.showModal();
    if (!task && dialog.open) dialog.close();
  }, [task]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
      aria-labelledby="delete-task-title"
      aria-describedby="delete-task-description"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-stone-200 bg-white p-0 shadow-2xl backdrop:bg-stone-900/30 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-6">
        <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-red-50">
          <TriangleAlert className="size-5 text-red-600" aria-hidden />
        </div>
        <h2 id="delete-task-title" className="text-lg font-semibold text-stone-900">
          Delete task?
        </h2>
        <p id="delete-task-description" className="mt-1.5 text-sm text-stone-500">
          <span className="font-medium break-words text-stone-700">
            &ldquo;{task?.titulo}&rdquo;
          </span>{" "}
          will be permanently removed. This action cannot be undone.
        </p>
      </div>
      <div className="flex justify-end gap-2 border-t border-stone-100 bg-stone-50/70 px-6 py-4">
        <Button variant="secondary" onClick={onCancel} autoFocus>
          Cancel
        </Button>
        <Button variant="danger" onClick={() => task && onConfirm(task)}>
          Delete task
        </Button>
      </div>
    </dialog>
  );
}
