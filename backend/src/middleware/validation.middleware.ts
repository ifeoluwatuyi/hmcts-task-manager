import { body, param, query } from 'express-validator';

const VALID_STATUSES = ['pending', 'in-progress', 'completed', 'cancelled'];
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;

export const validateCreateTask = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),

  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  body('due_date')
    .notEmpty()
    .withMessage('Due date is required')
    .matches(ISO_DATE_REGEX)
    .withMessage('Due date must be a valid ISO 8601 datetime (e.g. 2026-12-31T23:59:00Z)')
    .custom((value: string) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) throw new Error('Due date is not a valid date');
      return true;
    }),
];

export const validateUpdateTask = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty if provided')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),

  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  body('due_date')
    .optional()
    .matches(ISO_DATE_REGEX)
    .withMessage('Due date must be a valid ISO 8601 datetime')
    .custom((value: string) => {
      if (!value) return true;
      const date = new Date(value);
      if (isNaN(date.getTime())) throw new Error('Due date is not a valid date');
      return true;
    }),
];

export const validateUpdateStatus = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
];

export const validateTaskId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer'),
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status filter must be one of: ${VALID_STATUSES.join(', ')}`),

  query('sortBy')
    .optional()
    .isIn(['due_date', 'created_at', 'title', 'status'])
    .withMessage('sortBy must be one of: due_date, created_at, title, status'),

  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('sortOrder must be ASC or DESC'),
];
