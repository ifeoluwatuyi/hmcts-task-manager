import { Router } from 'express';
import {
  createTask,
  getTaskById,
  getAllTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';
import {
  validateCreateTask,
  validateUpdateTask,
  validateUpdateStatus,
  validateTaskId,
  validatePagination,
} from '../middleware/validation.middleware';
import { handleValidationErrors } from '../middleware/error.middleware';

const router = Router();

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Public
 */
router.post(
  '/',
  validateCreateTask,
  handleValidationErrors,
  createTask
);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks (supports ?page, ?limit, ?status, ?sortBy, ?sortOrder)
 * @access  Public
 */
router.get(
  '/',
  validatePagination,
  handleValidationErrors,
  getAllTasks
);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a task by ID
 * @access  Public
 */
router.get(
  '/:id',
  validateTaskId,
  handleValidationErrors,
  getTaskById
);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task (title, description, status, due_date)
 * @access  Public
 */
router.put(
  '/:id',
  validateUpdateTask,
  handleValidationErrors,
  updateTask
);

/**
 * @route   PATCH /api/tasks/:id/status
 * @desc    Update only the status of a task
 * @access  Public
 */
router.patch(
  '/:id/status',
  validateUpdateStatus,
  handleValidationErrors,
  updateTaskStatus
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Public
 */
router.delete(
  '/:id',
  validateTaskId,
  handleValidationErrors,
  deleteTask
);

export default router;
