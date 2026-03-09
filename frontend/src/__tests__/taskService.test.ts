import { vi, describe, it, expect, beforeEach } from 'vitest';

// ─── Hoist mock functions so they exist before any imports execute ────────────
// vi.mock() is hoisted to the top of the file by Vitest's transformer, so any
// variables it closes over must themselves be hoisted via vi.hoisted().
const { mockGet, mockPost, mockPut, mockPatch, mockDelete, mockIsAxiosError } =
  vi.hoisted(() => ({
    mockGet:          vi.fn(),
    mockPost:         vi.fn(),
    mockPut:          vi.fn(),
    mockPatch:        vi.fn(),
    mockDelete:       vi.fn(),
    mockIsAxiosError: vi.fn(),
  }));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get:      mockGet,
      post:     mockPost,
      put:      mockPut,
      patch:    mockPatch,
      delete:   mockDelete,
      defaults: { headers: { common: {} } },
    })),
    isAxiosError: mockIsAxiosError,
  },
}));

// Import service AFTER the mock factory is declared
import { taskService } from '../services/taskService';

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const mockPaginatedResponse = {
  data: {
    success: true,
    data: {
      data: [{
        id: 1, title: 'Task 1', status: 'pending',
        due_date: '2026-12-31T00:00:00Z', description: null,
        created_at: '', updated_at: '',
      }],
      total: 1, page: 1, limit: 20, totalPages: 1,
    },
  },
};

const mockSingleResponse = {
  data: {
    success: true,
    data: {
      id: 1, title: 'Task 1', status: 'pending',
      due_date: '2026-12-31T00:00:00Z', description: null,
      created_at: '', updated_at: '',
    },
  },
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('taskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAxiosError.mockReturnValue(false);
  });

  describe('getAll()', () => {
    it('calls GET /tasks and returns paginated data', async () => {
      mockGet.mockResolvedValueOnce(mockPaginatedResponse);
      const result = await taskService.getAll();
      expect(mockGet).toHaveBeenCalledWith('/tasks', { params: {} });
      expect(result.success).toBe(true);
      expect(result.data?.data).toHaveLength(1);
    });

    it('passes status filter as query param', async () => {
      mockGet.mockResolvedValueOnce(mockPaginatedResponse);
      await taskService.getAll({ status: 'pending' });
      expect(mockGet).toHaveBeenCalledWith(
        '/tasks',
        { params: expect.objectContaining({ status: 'pending' }) },
      );
    });
  });

  describe('getById()', () => {
    it('calls GET /tasks/:id', async () => {
      mockGet.mockResolvedValueOnce(mockSingleResponse);
      const result = await taskService.getById(1);
      expect(mockGet).toHaveBeenCalledWith('/tasks/1');
      expect(result.data?.id).toBe(1);
    });
  });

  describe('create()', () => {
    it('calls POST /tasks with correct payload', async () => {
      mockPost.mockResolvedValueOnce(mockSingleResponse);
      await taskService.create({
        title: 'New Task', description: '', status: 'pending',
        due_date: '2026-12-31T00:00:00Z',
      });
      expect(mockPost).toHaveBeenCalledWith(
        '/tasks',
        expect.objectContaining({ title: 'New Task' }),
      );
    });

    it('omits empty description from payload', async () => {
      mockPost.mockResolvedValueOnce(mockSingleResponse);
      await taskService.create({
        title: 'Task', description: '', status: 'pending',
        due_date: '2026-12-31T00:00:00Z',
      });
      const payload = mockPost.mock.calls[0][1] as Record<string, unknown>;
      expect(payload.description).toBeUndefined();
    });
  });

  describe('update()', () => {
    it('calls PUT /tasks/:id', async () => {
      mockPut.mockResolvedValueOnce(mockSingleResponse);
      await taskService.update(1, { title: 'Updated' });
      expect(mockPut).toHaveBeenCalledWith('/tasks/1', { title: 'Updated' });
    });
  });

  describe('updateStatus()', () => {
    it('calls PATCH /tasks/:id/status', async () => {
      mockPatch.mockResolvedValueOnce(mockSingleResponse);
      await taskService.updateStatus(1, 'completed');
      expect(mockPatch).toHaveBeenCalledWith('/tasks/1/status', { status: 'completed' });
    });
  });

  describe('delete()', () => {
    it('calls DELETE /tasks/:id', async () => {
      mockDelete.mockResolvedValueOnce({ data: { success: true, message: 'Deleted' } });
      const result = await taskService.delete(1);
      expect(mockDelete).toHaveBeenCalledWith('/tasks/1');
      expect(result.success).toBe(true);
    });
  });
});
