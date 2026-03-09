import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusBadge } from '../components/StatusBadge';
import { TaskForm } from '../components/TaskForm';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FilterBar } from '../components/FilterBar';
import { EmptyState } from '../components/EmptyState';
import { Task, TaskStatus } from '../types/task.types';

// ─── Mock task fixture ────────────────────────────────────────────────────────
const mockTask: Task = {
  id: 1,
  title: 'Review case file CAS-2026-001',
  description: 'Review and summarise the evidence bundle.',
  status: 'pending',
  due_date: '2026-12-31T17:00:00Z',
  created_at: '2026-03-08T10:00:00Z',
  updated_at: '2026-03-08T10:00:00Z',
};

// ─── StatusBadge ─────────────────────────────────────────────────────────────
describe('<StatusBadge />', () => {
  const statuses: TaskStatus[] = ['pending', 'in-progress', 'completed', 'cancelled'];

  statuses.forEach(status => {
    it(`renders "${status}" badge correctly`, () => {
      render(<StatusBadge status={status} />);
      const labels: Record<TaskStatus, string> = {
        pending: 'Pending',
        'in-progress': 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
      };
      expect(screen.getByText(labels[status])).toBeInTheDocument();
    });
  });
});

// ─── Modal ────────────────────────────────────────────────────────────────────
describe('<Modal />', () => {
  it('renders when open', () => {
    render(
      <Modal isOpen title="Test Modal" onClose={vi.fn()}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} title="Hidden Modal" onClose={vi.fn()}>
        <p>Should not appear</p>
      </Modal>
    );
    expect(screen.queryByText('Hidden Modal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen title="Closeable" onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen title="Esc Test" onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});

// ─── TaskForm ─────────────────────────────────────────────────────────────────
describe('<TaskForm />', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(
      <TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
    );
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('shows validation error when title is empty', async () => {
    render(
      <TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
    );
    fireEvent.click(screen.getByText('Create task'));
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when due date is missing', async () => {
    render(
      <TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
    );
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Task' } });
    fireEvent.click(screen.getByText('Create task'));
    await waitFor(() => {
      expect(screen.getByText('Due date is required')).toBeInTheDocument();
    });
  });

  it('calls onSubmit with correct data when form is valid', async () => {
    render(
      <TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
    );
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New Task' }
    });
    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: '2026-12-31T17:00' }
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Create task'));
    });
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Task' })
      );
    });
  });

  it('pre-fills form when editing a task', () => {
    render(
      <TaskForm
        task={mockTask}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={false}
      />
    );
    expect(screen.getByDisplayValue('Review case file CAS-2026-001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Review and summarise the evidence bundle.')).toBeInTheDocument();
    expect(screen.getByText('Save changes')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', () => {
    render(
      <TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables submit button while submitting', () => {
    render(
      <TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={true} />
    );
    expect(screen.getByText(/create task/i).closest('button')).toBeDisabled();
  });
});

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
describe('<ConfirmDialog />', () => {
  it('renders when open', () => {
    render(
      <ConfirmDialog
        isOpen
        title="Delete task"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('Delete task')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="Hidden"
        message="Not visible"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <ConfirmDialog
        isOpen
        title="Confirm"
        message="Proceed?"
        confirmLabel="Yes"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );
    await act(async () => {
      fireEvent.click(screen.getByText('Yes'));
    });
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen
        title="Confirm"
        message="Proceed?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});

// ─── FilterBar ────────────────────────────────────────────────────────────────
describe('<FilterBar />', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => { vi.clearAllMocks(); });

  it('renders with correct task count', () => {
    render(
      <FilterBar
        filters={{}}
        onFiltersChange={mockOnChange}
        total={5}
      />
    );
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText(/tasks/)).toBeInTheDocument();
  });

  it('calls onFiltersChange when status filter changes', () => {
    render(
      <FilterBar
        filters={{}}
        onFiltersChange={mockOnChange}
        total={3}
      />
    );
    fireEvent.change(screen.getByLabelText('Filter by status'), {
      target: { value: 'completed' }
    });
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'completed', page: 1 })
    );
  });

  it('calls onFiltersChange when sort changes', () => {
    render(
      <FilterBar
        filters={{}}
        onFiltersChange={mockOnChange}
        total={3}
      />
    );
    fireEvent.change(screen.getByLabelText('Sort tasks'), {
      target: { value: 'due_date|ASC' }
    });
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'due_date', sortOrder: 'ASC' })
    );
  });
});

// ─── EmptyState ───────────────────────────────────────────────────────────────
describe('<EmptyState />', () => {
  it('renders no-tasks message when no filters applied', () => {
    render(<EmptyState hasFilters={false} onCreateClick={vi.fn()} />);
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    expect(screen.getByText('Create first task')).toBeInTheDocument();
  });

  it('renders filtered message when filters are active', () => {
    render(<EmptyState hasFilters={true} onCreateClick={vi.fn()} />);
    expect(screen.getByText('No tasks match your filters')).toBeInTheDocument();
  });

  it('calls onCreateClick when button is clicked', () => {
    const onCreateClick = vi.fn();
    render(<EmptyState hasFilters={false} onCreateClick={onCreateClick} />);
    fireEvent.click(screen.getByText('Create first task'));
    expect(onCreateClick).toHaveBeenCalled();
  });
});
