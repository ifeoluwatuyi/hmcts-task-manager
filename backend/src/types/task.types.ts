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

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  due_date: string;
}

export interface UpdateTaskStatusDto {
  status: TaskStatus;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  due_date?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  sortBy?: 'due_date' | 'created_at' | 'title' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
