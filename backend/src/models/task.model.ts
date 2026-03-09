import { getDatabase } from '../database/database';
import {
  Task,
  CreateTaskDto,
  UpdateTaskStatusDto,
  UpdateTaskDto,
  PaginationParams,
  PaginatedResponse,
} from '../types/task.types';

export class TaskModel {
  /**
   * Create a new task.
   */
  create(dto: CreateTaskDto): Task {
    const db = getDatabase();

    const stmt = db.prepare<[string, string | null, string, string]>(`
      INSERT INTO tasks (title, description, status, due_date)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `);

    const task = stmt.get(
      dto.title.trim(),
      dto.description ? dto.description.trim() : null,
      dto.status ?? 'pending',
      dto.due_date
    ) as Task;

    return task;
  }

  /**
   * Retrieve a single task by its ID.
   */
  findById(id: number): Task | undefined {
    const db = getDatabase();
    const stmt = db.prepare<[number]>('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id) as Task | undefined;
  }

  /**
   * Retrieve all tasks with optional filtering, sorting, and pagination.
   */
  findAll(params: PaginationParams = {}): PaginatedResponse<Task> {
    const db = getDatabase();

    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = params;

    const allowedSortColumns = ['due_date', 'created_at', 'title', 'status'];
    const safeSort = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const conditions: string[] = [];
    const bindings: (string | number)[] = [];

    if (status) {
      conditions.push('status = ?');
      bindings.push(status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const countStmt = db.prepare<(string | number)[]>(
      `SELECT COUNT(*) as total FROM tasks ${where}`
    );
    const { total } = countStmt.get(...bindings) as { total: number };

    const dataStmt = db.prepare<(string | number)[]>(
      `SELECT * FROM tasks ${where} ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`
    );
    const tasks = dataStmt.all(...bindings, limit, offset) as Task[];

    return {
      data: tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update the status of a task.
   */
  updateStatus(id: number, dto: UpdateTaskStatusDto): Task | undefined {
    const db = getDatabase();
    const stmt = db.prepare<[string, number]>(
      'UPDATE tasks SET status = ? WHERE id = ? RETURNING *'
    );
    return stmt.get(dto.status, id) as Task | undefined;
  }

  /**
   * Update any fields of a task.
   */
  update(id: number, dto: UpdateTaskDto): Task | undefined {
    const db = getDatabase();

    const fields: string[] = [];
    const bindings: (string | number | null)[] = [];

    if (dto.title !== undefined) {
      fields.push('title = ?');
      bindings.push(dto.title.trim());
    }
    if (dto.description !== undefined) {
      fields.push('description = ?');
      bindings.push(dto.description ? dto.description.trim() : null);
    }
    if (dto.status !== undefined) {
      fields.push('status = ?');
      bindings.push(dto.status);
    }
    if (dto.due_date !== undefined) {
      fields.push('due_date = ?');
      bindings.push(dto.due_date);
    }

    if (fields.length === 0) return this.findById(id);

    bindings.push(id);

    const stmt = db.prepare<(string | number | null)[]>(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? RETURNING *`
    );
    return stmt.get(...bindings) as Task | undefined;
  }

  /**
   * Delete a task by ID.
   */
  delete(id: number): boolean {
    const db = getDatabase();
    const stmt = db.prepare<[number]>('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const taskModel = new TaskModel();
