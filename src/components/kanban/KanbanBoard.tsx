"use client";

import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useTaskStore, type TaskStatus, type Task } from "@/lib/store/taskStore";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import AddTaskModal from "./AddTaskModal";

const COLUMNS: TaskStatus[] = ["todo", "doing", "done"];

export default function KanbanBoard() {
  const tasks = useTaskStore((s) => s.tasks);
  const moveTask = useTaskStore((s) => s.moveTask);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const overId = over.id as TaskStatus;
    if (COLUMNS.includes(overId)) {
      moveTask(active.id as string, overId);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <h1 className="text-xl font-bold text-zinc-100">Command Center</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          + Nova Task
        </button>
      </header>

      <main className="flex flex-1 gap-4 overflow-x-auto p-6">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasks.filter((t) => t.status === status)}
            />
          ))}
          <DragOverlay>
            {activeTask ? <KanbanCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </main>

      <AddTaskModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
