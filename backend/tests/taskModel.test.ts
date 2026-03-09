import { TaskModel } from '../src/models/task.model';
import { resetDatabase, closeDatabase } from '../src/database/database';

beforeEach(() => {
  process.env.NODE_ENV = 'test';
  resetDatabase();
});

afterAll(() => {
  closeDatabase();
});

describe('TaskModel', () => {
  let model: TaskModel;

  beforeEach(() => {
    model = new TaskModel();
  });

  // ─── create ────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('creates a task with required fields', () => {
      const task = model.create({ title: 'Task 1', due_date: '2026-12-31T00:00:00Z' });
      expect(task.id).toBeGreaterThan(0);
      expect(task.title).toBe('Task 1');
      expect(task.status).toBe('pending');
      expect(task.description).toBeNull();
    });

    it('creates a task with all fields', () => {
      const task = model.create({
        title: 'Full Task',
        description: 'Details here',
        status: 'in-progress',
        due_date: '2026-06-01T12:00:00Z',
      });
      expect(task.description).toBe('Details here');
      expect(task.status).toBe('in-progress');
    });

    it('auto-increments IDs', () => {
      const t1 = model.create({ title: 'T1', due_date: '2026-01-01T00:00:00Z' });
      const t2 = model.create({ title: 'T2', due_date: '2026-01-01T00:00:00Z' });
      expect(t2.id).toBeGreaterThan(t1.id);
    });
  });

  // ─── findById ──────────────────────────────────────────────────────────────
  describe('findById()', () => {
    it('finds an existing task', () => {
      const created = model.create({ title: 'Find Me', due_date: '2026-12-31T00:00:00Z' });
      const found = model.findById(created.id);
      expect(found).toBeDefined();
      expect(found?.title).toBe('Find Me');
    });

    it('returns undefined for non-existent ID', () => {
      expect(model.findById(99999)).toBeUndefined();
    });
  });

  // ─── findAll ───────────────────────────────────────────────────────────────
  describe('findAll()', () => {
    beforeEach(() => {
      model.create({ title: 'A', due_date: '2026-01-01T00:00:00Z', status: 'pending' });
      model.create({ title: 'B', due_date: '2026-02-01T00:00:00Z', status: 'completed' });
      model.create({ title: 'C', due_date: '2026-03-01T00:00:00Z', status: 'pending' });
    });

    it('returns all tasks', () => {
      const result = model.findAll();
      expect(result.total).toBe(3);
      expect(result.data).toHaveLength(3);
    });

    it('filters by status', () => {
      const result = model.findAll({ status: 'completed' });
      expect(result.total).toBe(1);
      expect(result.data[0].status).toBe('completed');
    });

    it('paginates correctly', () => {
      const page1 = model.findAll({ page: 1, limit: 2 });
      expect(page1.data).toHaveLength(2);
      expect(page1.totalPages).toBe(2);

      const page2 = model.findAll({ page: 2, limit: 2 });
      expect(page2.data).toHaveLength(1);
    });
  });

  // ─── updateStatus ──────────────────────────────────────────────────────────
  describe('updateStatus()', () => {
    it('updates the status', () => {
      const task = model.create({ title: 'Status Test', due_date: '2026-12-31T00:00:00Z' });
      const updated = model.updateStatus(task.id, { status: 'completed' });
      expect(updated?.status).toBe('completed');
    });

    it('returns undefined for non-existent task', () => {
      const result = model.updateStatus(99999, { status: 'completed' });
      expect(result).toBeUndefined();
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('updates multiple fields', () => {
      const task = model.create({ title: 'Original', due_date: '2026-12-31T00:00:00Z' });
      const updated = model.update(task.id, {
        title: 'Modified',
        description: 'Now with desc',
        status: 'in-progress',
      });
      expect(updated?.title).toBe('Modified');
      expect(updated?.description).toBe('Now with desc');
      expect(updated?.status).toBe('in-progress');
    });

    it('returns current task when no changes provided', () => {
      const task = model.create({ title: 'No Change', due_date: '2026-12-31T00:00:00Z' });
      const result = model.update(task.id, {});
      expect(result?.title).toBe('No Change');
    });
  });

  // ─── delete ────────────────────────────────────────────────────────────────
  describe('delete()', () => {
    it('deletes an existing task and returns true', () => {
      const task = model.create({ title: 'Delete Me', due_date: '2026-12-31T00:00:00Z' });
      expect(model.delete(task.id)).toBe(true);
      expect(model.findById(task.id)).toBeUndefined();
    });

    it('returns false for a non-existent task', () => {
      expect(model.delete(99999)).toBe(false);
    });
  });
});
