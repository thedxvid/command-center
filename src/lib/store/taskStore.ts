import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: number;
}

interface TaskStore {
  tasks: Task[];
  addTask: (title: string, description?: string) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  updateTask: (id: string, updates: Partial<Pick<Task, "title" | "description">>) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (title, description = "") =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: crypto.randomUUID(),
              title,
              description,
              status: "todo",
              createdAt: Date.now(),
            },
          ],
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      moveTask: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
    }),
    { name: "command-center-tasks" }
  )
);
