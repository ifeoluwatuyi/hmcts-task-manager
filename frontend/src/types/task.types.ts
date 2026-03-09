export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  due_date: string;
}

export interface UpdateTaskFormData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  due_date?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  sortBy?: 'due_date' | 'created_at' | 'title' | 'status';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  'pending': 'bg-amber-100 text-amber-800 border-amber-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'completed': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'cancelled': 'bg-slate-100 text-slate-600 border-slate-200',
};
