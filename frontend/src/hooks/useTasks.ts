import { useState, useCallback, useEffect, useRef } from 'react';
import { taskService } from '../services/taskService';
import {
  Task,
  CreateTaskFormData,
  UpdateTaskFormData,
  TaskFilters,
  PaginatedData,
} from '../types/task.types';

interface UseTasksReturn {
  tasks: Task[];
  paginationMeta: Omit<PaginatedData<Task>, 'data'> | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTask: (data: CreateTaskFormData) => Promise<Task>;
  updateTask: (id: number, data: UpdateTaskFormData) => Promise<Task>;
  updateTaskStatus: (id: number, status: Task['status']) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
}

export function useTasks(filters: TaskFilters = {}): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<Omit<PaginatedData<Task>, 'data'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use a ref so fetchTasks always reads the latest filters without being
  // recreated on every render (avoiding infinite effect loops).
  const filtersRef = useRef<TaskFilters>(filters);
  filtersRef.current = filters;

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await taskService.getAll(filtersRef.current);
      if (res.success && res.data) {
        setTasks(res.data.data);
        const { data: _data, ...meta } = res.data;
        setPaginationMeta(meta);
      }
    } catch (err) {
      setError((err as Error).message ?? 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  // fetchTasks is intentionally stable; it reads current filters via ref.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch whenever the serialised filter values actually change.
  // JSON.stringify gives a stable string comparison so object identity
  // differences (new object, same values) don't cause spurious re-fetches.
  const filtersKey = JSON.stringify(filters);
  useEffect(() => {
    void fetchTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  const createTask = useCallback(async (formData: CreateTaskFormData): Promise<Task> => {
    const res = await taskService.create(formData);
    if (!res.success || !res.data) throw new Error(res.message ?? 'Failed to create task');
    await fetchTasks();
    return res.data;
  }, [fetchTasks]);

  const updateTask = useCallback(async (id: number, updates: UpdateTaskFormData): Promise<Task> => {
    const res = await taskService.update(id, updates);
    if (!res.success || !res.data) throw new Error(res.message ?? 'Failed to update task');
    setTasks(prev => prev.map(t => t.id === id ? res.data! : t));
    return res.data;
  }, []);

  const updateTaskStatus = useCallback(async (id: number, status: Task['status']): Promise<Task> => {
    const res = await taskService.updateStatus(id, status);
    if (!res.success || !res.data) throw new Error(res.message ?? 'Failed to update status');
    setTasks(prev => prev.map(t => t.id === id ? res.data! : t));
    return res.data;
  }, []);

  const deleteTask = useCallback(async (id: number): Promise<void> => {
    const res = await taskService.delete(id);
    if (!res.success) throw new Error(res.message ?? 'Failed to delete task');
    setTasks(prev => prev.filter(t => t.id !== id));
    setPaginationMeta(prev => prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev);
  }, []);

  return {
    tasks,
    paginationMeta,
    isLoading,
    error,
    refresh: fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  };
}

