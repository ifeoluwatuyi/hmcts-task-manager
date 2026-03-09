import axios, { AxiosError } from 'axios';
import {
  Task,
  CreateTaskFormData,
  UpdateTaskFormData,
  ApiResponse,
  PaginatedData,
  TaskFilters,
} from '../types/task.types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// Normalise Axios errors into a consistent shape
function handleAxiosError(err: unknown): never {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<ApiResponse<unknown>>;
    const serverMessage =
      axiosErr.response?.data?.message ?? axiosErr.message;
    const serverErrors = axiosErr.response?.data?.errors;

    const error = new Error(serverMessage) as Error & {
      statusCode?: number;
      validationErrors?: ApiResponse<unknown>['errors'];
    };
    error.statusCode = axiosErr.response?.status;
    error.validationErrors = serverErrors;
    throw error;
  }
  throw err;
}

export const taskService = {
  /**
   * Fetch all tasks with optional filters.
   */
  async getAll(filters: TaskFilters = {}): Promise<ApiResponse<PaginatedData<Task>>> {
    try {
      const params: Record<string, string | number> = {};
      if (filters.status)    params.status    = filters.status;
      if (filters.sortBy)    params.sortBy    = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;
      if (filters.page)      params.page      = filters.page;
      if (filters.limit)     params.limit     = filters.limit;

      const { data } = await apiClient.get<ApiResponse<PaginatedData<Task>>>('/tasks', { params });
      return data;
    } catch (err) {
      handleAxiosError(err);
    }
  },

  /**
   * Fetch a single task by ID.
   */
  async getById(id: number): Promise<ApiResponse<Task>> {
    try {
      const { data } = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
      return data;
    } catch (err) {
      handleAxiosError(err);
    }
  },

  /**
   * Create a new task.
   */
  async create(formData: CreateTaskFormData): Promise<ApiResponse<Task>> {
    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        due_date: formData.due_date,
      };
      const { data } = await apiClient.post<ApiResponse<Task>>('/tasks', payload);
      return data;
    } catch (err) {
      handleAxiosError(err);
    }
  },

  /**
   * Update a task.
   */
  async update(id: number, updates: UpdateTaskFormData): Promise<ApiResponse<Task>> {
    try {
      const { data } = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, updates);
      return data;
    } catch (err) {
      handleAxiosError(err);
    }
  },

  /**
   * Update only the status of a task.
   */
  async updateStatus(id: number, status: Task['status']): Promise<ApiResponse<Task>> {
    try {
      const { data } = await apiClient.patch<ApiResponse<Task>>(
        `/tasks/${id}/status`,
        { status }
      );
      return data;
    } catch (err) {
      handleAxiosError(err);
    }
  },

  /**
   * Delete a task.
   */
  async delete(id: number): Promise<ApiResponse<null>> {
    try {
      const { data } = await apiClient.delete<ApiResponse<null>>(`/tasks/${id}`);
      return data;
    } catch (err) {
      handleAxiosError(err);
    }
  },
};
