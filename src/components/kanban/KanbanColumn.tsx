"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Task, TaskStatus } from "@/lib/store/taskStore";
import KanbanCard from "./KanbanCard";

const COLUMN_CONFIG: Record<TaskStatus, { label: string; accent: string }> = {
  todo: { label: "A Fazer", accent: "bg-blue-500" },
  doing: { label: "Fazendo", accent: "bg-yellow-500" },
  done: { label: "Feito", accent: "bg-green-500" },
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
}

export default function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = COLUMN_CONFIG[status];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-1 flex-col rounded-xl border bg-zinc-900 transition-colors ${
        isOver ? "border-zinc-500 bg-zinc-800/50" : "border-zinc-800"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
        <span className={`h-2.5 w-2.5 rounded-full ${config.accent}`} />
        <h2 className="text-sm font-semibold text-zinc-200">{config.label}</h2>
        <span className="ml-auto rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <p className="py-8 text-center text-xs text-zinc-600">
            Arraste tasks para cá
          </p>
        )}
      </div>
    </div>
  );
}
