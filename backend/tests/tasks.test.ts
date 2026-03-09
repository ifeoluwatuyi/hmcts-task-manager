import request from 'supertest';
import app from '../src/app';
import { resetDatabase, closeDatabase } from '../src/database/database';

// Run tests against a fresh in-memory-equivalent DB each time
beforeEach(() => {
  process.env.NODE_ENV = 'test';
  resetDatabase();
});

afterAll(() => {
  closeDatabase();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function createTestTask(overrides: Record<string, unknown> = {}) {
  return request(app)
    .post('/api/tasks')
    .send({
      title: 'Test Task',
      due_date: '2026-12-31T23:59:00Z',
      ...overrides,
    });
}

// ─── Health Check ─────────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('returns 200 with health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('HMCTS');
  });
});

// ─── POST /api/tasks ─────────────────────────────────────────────────────────
describe('POST /api/tasks', () => {
  it('creates a task with required fields only', async () => {
    const res = await createTestTask();
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      title: 'Test Task',
      status: 'pending',
      due_date: '2026-12-31T23:59:00Z',
      description: null,
    });
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.created_at).toBeDefined();
  });

  it('creates a task with all fields', async () => {
    const res = await createTestTask({
      title: 'Full Task',
      description: 'A comprehensive description',
      status: 'in-progress',
      due_date: '2026-06-15T09:00:00Z',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.description).toBe('A comprehensive description');
    expect(res.body.data.status).toBe('in-progress');
  });

  it('returns 422 when title is missing', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ due_date: '2026-12-31T23:59:00Z' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'title' }),
      ])
    );
  });

  it('returns 422 when due_date is missing', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'No Date Task' });
    expect(res.status).toBe(422);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'due_date' }),
      ])
    );
  });

  it('returns 422 for an invalid status', async () => {
    const res = await createTestTask({ status: 'unknown-status' });
    expect(res.status).toBe(422);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'status' }),
      ])
    );
  });

  it('returns 422 for an invalid due_date format', async () => {
    const res = await createTestTask({ due_date: 'not-a-date' });
    expect(res.status).toBe(422);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'due_date' }),
      ])
    );
  });

  it('trims whitespace from title', async () => {
    const res = await createTestTask({ title: '  Trimmed Title  ' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Trimmed Title');
  });

  it('returns 422 when title exceeds 200 characters', async () => {
    const res = await createTestTask({ title: 'a'.repeat(201) });
    expect(res.status).toBe(422);
  });
});

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
describe('GET /api/tasks', () => {
  it('returns an empty paginated response initially', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(0);
    expect(res.body.data.total).toBe(0);
    expect(res.body.data.page).toBe(1);
  });

  it('returns all created tasks', async () => {
    await createTestTask({ title: 'Task A' });
    await createTestTask({ title: 'Task B' });
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(2);
  });

  it('filters tasks by status', async () => {
    await createTestTask({ status: 'pending' });
    await createTestTask({ status: 'completed' });
    const res = await request(app).get('/api/tasks?status=completed');
    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(1);
    expect(res.body.data.data[0].status).toBe('completed');
  });

  it('paginates results', async () => {
    for (let i = 0; i < 5; i++) {
      await createTestTask({ title: `Task ${i}` });
    }
    const res = await request(app).get('/api/tasks?limit=2&page=2');
    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(2);
    expect(res.body.data.page).toBe(2);
    expect(res.body.data.totalPages).toBe(3);
  });

  it('returns 422 for invalid pagination params', async () => {
    const res = await request(app).get('/api/tasks?page=0');
    expect(res.status).toBe(422);
  });
});

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────────
describe('GET /api/tasks/:id', () => {
  it('returns a task by ID', async () => {
    const create = await createTestTask({ title: 'Find Me' });
    const id = create.body.data.id as number;

    const res = await request(app).get(`/api/tasks/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Find Me');
  });

  it('returns 404 for a non-existent ID', async () => {
    const res = await request(app).get('/api/tasks/99999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 422 for a non-integer ID', async () => {
    const res = await request(app).get('/api/tasks/abc');
    expect(res.status).toBe(422);
  });
});

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
describe('PUT /api/tasks/:id', () => {
  it('updates a task title', async () => {
    const create = await createTestTask();
    const id = create.body.data.id as number;

    const res = await request(app)
      .put(`/api/tasks/${id}`)
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title');
  });

  it('updates multiple fields at once', async () => {
    const create = await createTestTask();
    const id = create.body.data.id as number;

    const res = await request(app)
      .put(`/api/tasks/${id}`)
      .send({
        title: 'New Title',
        description: 'New desc',
        status: 'in-progress',
        due_date: '2027-01-01T00:00:00Z',
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      title: 'New Title',
      description: 'New desc',
      status: 'in-progress',
    });
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app)
      .put('/api/tasks/99999')
      .send({ title: 'Ghost' });
    expect(res.status).toBe(404);
  });

  it('returns 422 when title is empty string', async () => {
    const create = await createTestTask();
    const id = create.body.data.id as number;
    const res = await request(app)
      .put(`/api/tasks/${id}`)
      .send({ title: '' });
    expect(res.status).toBe(422);
  });
});

// ─── PATCH /api/tasks/:id/status ─────────────────────────────────────────────
describe('PATCH /api/tasks/:id/status', () => {
  it('updates the task status', async () => {
    const create = await createTestTask();
    const id = create.body.data.id as number;

    const res = await request(app)
      .patch(`/api/tasks/${id}/status`)
      .send({ status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('completed');
  });

  it('returns 422 for invalid status', async () => {
    const create = await createTestTask();
    const id = create.body.data.id as number;

    const res = await request(app)
      .patch(`/api/tasks/${id}/status`)
      .send({ status: 'invalid' });
    expect(res.status).toBe(422);
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app)
      .patch('/api/tasks/99999/status')
      .send({ status: 'completed' });
    expect(res.status).toBe(404);
  });

  it('accepts all valid statuses', async () => {
    const statuses = ['pending', 'in-progress', 'completed', 'cancelled'];
    for (const status of statuses) {
      const create = await createTestTask();
      const id = create.body.data.id as number;
      const res = await request(app)
        .patch(`/api/tasks/${id}/status`)
        .send({ status });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(status);
    }
  });
});

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
describe('DELETE /api/tasks/:id', () => {
  it('deletes a task successfully', async () => {
    const create = await createTestTask();
    const id = create.body.data.id as number;

    const res = await request(app).delete(`/api/tasks/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it's gone
    const get = await request(app).get(`/api/tasks/${id}`);
    expect(get.status).toBe(404);
  });

  it('returns 404 for a non-existent task', async () => {
    const res = await request(app).delete('/api/tasks/99999');
    expect(res.status).toBe(404);
  });

  it('returns 422 for non-integer ID', async () => {
    const res = await request(app).delete('/api/tasks/abc');
    expect(res.status).toBe(422);
  });
});

// ─── 404 for unknown routes ───────────────────────────────────────────────────
describe('Unknown routes', () => {
  it('returns 404 for GET /api/unknown', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
