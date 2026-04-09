# HMCTS Task Manager

A full-stack task management system for HMCTS caseworkers, built as part of the DTS Developer Technical Test.

---

## Tech Stack

| Layer     | Technology                                         |
|-----------|-----------------------------------------------------|
| Backend   | Node.js · Express · TypeScript · SQLite3             |
| Frontend  | React 18 · TypeScript · Vite · Tailwind CSS v3       |
| Testing   | Jest · Supertest (API) · Vitest · React Testing Library |
| Docs      | Swagger UI / OpenAPI 3.0                             |

---

## Project Structure

```
hmcts-task-manager/
├── backend/
│   ├── src/
│   │   ├── app.ts                  # Express entry point
│   │   ├── controllers/
│   │   │   └── task.controller.ts  # Route handlers
│   │   ├── database/
│   │   │   └── database.ts         # SQLite3 setup & schema
│   │   ├── docs/
│   │   │   └── openapi.yaml        # OpenAPI 3.0 spec
│   │   ├── middleware/
│   │   │   ├── error.middleware.ts # Error handling & 404
│   │   │   └── validation.middleware.ts
│   │   ├── models/
│   │   │   └── task.model.ts       # Data access layer
│   │   ├── routes/
│   │   │   └── task.routes.ts      # Route definitions
│   │   └── types/
│   │       └── task.types.ts       # TypeScript interfaces
│   ├── tests/
│   │   ├── tasks.test.ts           # Integration tests
│   │   └── taskModel.test.ts       # Unit tests
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                 # Root component
│   │   ├── index.tsx               # React entry point
│   │   ├── index.css               # Tailwind + global styles
│   │   ├── __tests__/
│   │   │   ├── components.test.tsx # Component tests
│   │   │   └── taskService.test.ts # API service tests
│   │   ├── components/
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── TaskCard.tsx
│   │   ├── hooks/
│   │   │   └── useTasks.ts         # Custom hook for task state
│   │   ├── services/
│   │   │   └── taskService.ts      # Axios API client
│   │   └── types/
│   │       └── task.types.ts       # Shared TypeScript types
│   ├── public/
│   │   └── index.html
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── README.md
```

---

## Prerequisites

- **Node.js** v18 or later — [download here](https://nodejs.org/)
- **npm** v9+
- Windows (PowerShell / Command Prompt) or any terminal

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/MY_USERNAME/hmcts-task-manager.git
cd hmcts-task-manager
```

---

### 2. Backend setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment config
copy .env.example .env       # Windows
# or: cp .env.example .env   # Mac/Linux

# Start development server (auto-restarts on changes)
npm run dev
```

The API will be available at:
- **API base:** `http://localhost:3001/api`
- **Swagger docs:** `http://localhost:3001/api/docs`
- **Health check:** `http://localhost:3001/api/health`

> The SQLite database file is created automatically at `backend/data/tasks.db` on first run.

---

### 3. Frontend setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Copy environment config
copy .env.example .env       # Windows
# or: cp .env.example .env   # Mac/Linux

# Start development server
npm run dev
```

The app will open automatically at **`http://localhost:3000`**

> **Note:** Vite environment variables must be prefixed with `VITE_` (e.g. `VITE_API_URL`).

---

## Running Tests

### Backend tests

```bash
cd backend
npm test                # Run all tests with coverage
npm run test:watch      # Watch mode
```

Expected output:
- `tests/tasks.test.ts` — ~30 integration tests covering all API endpoints
- `tests/taskModel.test.ts` — ~15 unit tests for the data model

### Frontend tests

```bash
cd frontend
npm test                # Run all tests with coverage (Vitest)
npm run test:watch      # Interactive watch mode
```

Expected output:
- `src/__tests__/components.test.tsx` — Component tests
- `src/__tests__/taskService.test.ts` — Service layer tests

---

## API Reference

Full interactive docs are available via Swagger UI at `http://localhost:3001/api/docs`

### Endpoints

| Method | Path                      | Description                |
|--------|---------------------------|----------------------------|
| POST   | `/api/tasks`              | Create a new task          |
| GET    | `/api/tasks`              | Get all tasks (paginated)  |
| GET    | `/api/tasks/:id`          | Get a task by ID           |
| PUT    | `/api/tasks/:id`          | Update a task              |
| PATCH  | `/api/tasks/:id/status`   | Update task status only    |
| DELETE | `/api/tasks/:id`          | Delete a task              |
| GET    | `/api/health`             | Health check               |

### Task object

```json
{
  "id": 1,
  "title": "Review case file CAS-2026-001",
  "description": "Review and summarise the evidence bundle.",
  "status": "pending",
  "due_date": "2026-12-31T17:00:00Z",
  "created_at": "2026-03-08T10:00:00Z",
  "updated_at": "2026-03-08T10:00:00Z"
}
```

### Valid status values

| Value        | Meaning                  |
|--------------|--------------------------|
| `pending`    | Not yet started          |
| `in-progress`| Actively being worked on |
| `completed`  | Done                     |
| `cancelled`  | No longer required       |

### Query parameters for GET /api/tasks

| Param      | Type    | Default      | Description                              |
|------------|---------|--------------|------------------------------------------|
| `page`     | integer | `1`          | Page number                              |
| `limit`    | integer | `20`         | Results per page (max 100)               |
| `status`   | string  | _(none)_     | Filter by status                         |
| `sortBy`   | string  | `created_at` | `due_date`, `created_at`, `title`, `status` |
| `sortOrder`| string  | `DESC`       | `ASC` or `DESC`                          |

### Example requests (PowerShell)

```powershell
# Create a task
Invoke-RestMethod -Uri "http://localhost:3001/api/tasks" -Method POST `
  -ContentType "application/json" `
  -Body '{"title":"Review hearing bundle","due_date":"2026-06-30T17:00:00Z"}'

# Get all tasks
Invoke-RestMethod -Uri "http://localhost:3001/api/tasks"

# Update status
Invoke-RestMethod -Uri "http://localhost:3001/api/tasks/1/status" -Method PATCH `
  -ContentType "application/json" `
  -Body '{"status":"completed"}'

# Delete a task
Invoke-RestMethod -Uri "http://localhost:3001/api/tasks/1" -Method DELETE
```

---

## Build for Production

### Backend

```bash
cd backend
npm run build       # Compiles TypeScript to dist/
npm start           # Runs compiled output
```

### Frontend

```bash
cd frontend
npm run build       # Creates optimised build in build/
```

---

## Features

### Backend
-  Full CRUD API with RESTful conventions
-  Input validation with `express-validator` (title, status enum, ISO 8601 dates)
-  Structured JSON error responses with field-level validation errors
-  Global error handler + 404 handler
-  SQLite3 with WAL mode for performance
-  DB trigger for automatic `updated_at` timestamps
-  Filtering, sorting, and pagination
-  Swagger UI / OpenAPI 3.0 documentation
-  Morgan HTTP request logging
-  CORS configured for frontend origin

### Frontend
-  Create, read, update, delete tasks
-  Inline status change from task card (dropdown)
-  Filter by status, sort by multiple columns
-  Pagination controls
-  Overdue task detection (red date styling)
-  Loading skeleton UI
-  Empty state with call-to-action
-  Toast notifications for all operations
-  Keyboard-accessible modal with Escape key close
-  Confirm dialog for destructive actions
-  Client-side form validation with character counters
-  Responsive layout (mobile → desktop)
-  Animated transitions and hover effects

---

## Design Decisions

1. **better-sqlite3 over `sqlite3`** - Synchronous, faster, simpler, no callback hell.
2. **`RETURNING *` clauses** - Avoids a second SELECT after mutating operations.
3. **Separate `PATCH /status` endpoint** - Follows REST convention for partial updates and aligns with the spec requirement.
4. **`useTasks` custom hook** - Centralises all API state, loading, and error handling out of the component layer.
5. **Optimistic UI for status changes** - Local state updated immediately; API called in background for snappy UX.

---

## License

Built for the HMCTS DTS . Not for production use.
