"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/lib/store/taskStore";
import { useTaskStore } from "@/lib/store/taskStore";

export default function KanbanCard({ task }: { task: Task }) {
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group relative rounded-lg border border-zinc-700 bg-zinc-800 p-3 shadow-sm transition-colors hover:border-zinc-500 cursor-grab active:cursor-grabbing"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteTask(task.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 hidden rounded p-1 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300 group-hover:block"
        aria-label="Deletar task"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <h3 className="text-sm font-medium text-zinc-100 pr-6">{task.title}</h3>
      {task.description && (
        <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{task.description}</p>
      )}
    </div>
  );
}
