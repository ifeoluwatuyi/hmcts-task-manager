import { Request, Response, NextFunction } from 'express';
import { taskModel } from '../models/task.model';
import { AppError } from '../middleware/error.middleware';
import {
  CreateTaskDto,
  UpdateTaskStatusDto,
  UpdateTaskDto,
  ApiResponse,
  PaginationParams,
  TaskStatus,
} from '../types/task.types';

/**
 * POST /api/tasks
 * Create a new task.
 */
export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dto: CreateTaskDto = {
      title: req.body.title as string,
      description: req.body.description as string | undefined,
      status: req.body.status as TaskStatus | undefined,
      due_date: req.body.due_date as string,
    };

    const task = taskModel.create(dto);

    const response: ApiResponse<typeof task> = {
      success: true,
      data: task,
      message: 'Task created successfully',
    };

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tasks/:id
 * Retrieve a task by ID.
 */
export async function getTaskById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const task = taskModel.findById(id);

    if (!task) {
      throw new AppError(404, `Task with ID ${id} not found`);
    }

    const response: ApiResponse<typeof task> = {
      success: true,
      data: task,
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tasks
 * Retrieve all tasks (with optional filtering and pagination).
 */
export async function getAllTasks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params: PaginationParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      status: req.query.status as TaskStatus | undefined,
      sortBy: req.query.sortBy as PaginationParams['sortBy'],
      sortOrder: req.query.sortOrder as 'ASC' | 'DESC' | undefined,
    };

    const result = taskModel.findAll(params);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/tasks/:id/status
 * Update only the status of a task.
 */
export async function updateTaskStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const dto: UpdateTaskStatusDto = { status: req.body.status as TaskStatus };

    const existing = taskModel.findById(id);
    if (!existing) {
      throw new AppError(404, `Task with ID ${id} not found`);
    }

    const task = taskModel.updateStatus(id, dto);

    const response: ApiResponse<typeof task> = {
      success: true,
      data: task,
      message: 'Task status updated successfully',
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/tasks/:id
 * Update any fields of a task.
 */
export async function updateTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = taskModel.findById(id);
    if (!existing) {
      throw new AppError(404, `Task with ID ${id} not found`);
    }

    const dto: UpdateTaskDto = {};
    if (req.body.title !== undefined) dto.title = req.body.title as string;
    if (req.body.description !== undefined) dto.description = req.body.description as string;
    if (req.body.status !== undefined) dto.status = req.body.status as TaskStatus;
    if (req.body.due_date !== undefined) dto.due_date = req.body.due_date as string;

    const task = taskModel.update(id, dto);

    const response: ApiResponse<typeof task> = {
      success: true,
      data: task,
      message: 'Task updated successfully',
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/tasks/:id
 * Delete a task by ID.
 */
export async function deleteTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = taskModel.delete(id);

    if (!deleted) {
      throw new AppError(404, `Task with ID ${id} not found`);
    }

    const response: ApiResponse<null> = {
      success: true,
      message: `Task ${id} deleted successfully`,
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
