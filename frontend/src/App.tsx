import React, { useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useTasks } from './hooks/useTasks';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { Modal } from './components/Modal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { FilterBar } from './components/FilterBar';
import { EmptyState, LoadingGrid } from './components/EmptyState';
import { Task, CreateTaskFormData, TaskStatus, TaskFilters } from './types/task.types';

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const RefreshIcon = ({ spinning }: { spinning: boolean }) => (
  <svg className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// ─── Stats bar ────────────────────────────────────────────────────────────────
interface StatProps { label: string; count: number; color: string }

const Stat: React.FC<StatProps> = ({ label, count, color }) => (
  <div className="flex flex-col items-center px-4 py-2">
    <span className={`text-2xl font-display font-bold ${color}`}>{count}</span>
    <span className="text-xs font-sans text-slate-500 mt-0.5">{label}</span>
  </div>
);

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [filters, setFilters] = useState<TaskFilters>({ sortBy: 'created_at', sortOrder: 'DESC' });

  const {
    tasks, paginationMeta, isLoading, error,
    refresh, createTask, updateTask, updateTaskStatus, deleteTask,
  } = useTasks(filters);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Counts by status (from current visible tasks — server counts would need extra call)
  const counts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {} as Record<TaskStatus, number>);

  const handleCreate = useCallback(async (data: CreateTaskFormData) => {
    setIsSubmitting(true);
    try {
      await createTask(data);
      setShowCreateModal(false);
      toast.success('Task created successfully');
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  }, [createTask]);

  const handleEdit = useCallback(async (data: CreateTaskFormData) => {
    if (!editTask) return;
    setIsSubmitting(true);
    try {
      await updateTask(editTask.id, data);
      setEditTask(null);
      toast.success('Task updated');
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  }, [editTask, updateTask]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteTask(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Task deleted');
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, deleteTask]);

  const handleStatusChange = useCallback(async (id: number, status: TaskStatus) => {
    try {
      await updateTaskStatus(id, status);
      toast.success('Status updated');
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to update status');
    }
  }, [updateTaskStatus]);

  const handleFiltersChange = (f: TaskFilters) => {
    setFilters(f);
  };

  const hasFilters = Boolean(filters.status);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px -8px rgba(13,29,90,0.25)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="bg-crown-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Crown bar */}
          <div className="flex items-center justify-between py-3 border-b border-crown-700">
            <div className="flex items-center gap-3">
              {/* Crown logo */}
              <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-crown-900">
                  <path d="M2 19h20v2H2v-2zM12 2L8 8l-6-2 4 11h12L22 6l-6 2L12 2z"/>
                </svg>
              </div>
              <div>
                <p className="text-gold-400 text-xs font-sans font-medium tracking-widest uppercase">
                  HMCTS DTS
                </p>
                <h1 className="text-white font-display font-bold text-xl leading-tight">
                  Task Manager
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => void refresh()}
                disabled={isLoading}
                className="p-2 rounded-lg text-crown-200 hover:text-white hover:bg-crown-700 
                           transition-colors"
                title="Refresh tasks"
              >
                <RefreshIcon spinning={isLoading} />
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg 
                           bg-gold-500 hover:bg-gold-400 text-crown-900 
                           text-sm font-semibold font-sans transition-all shadow-sm"
              >
                <PlusIcon />
                New Task
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center divide-x divide-crown-700 py-1">
            <Stat label="Total" count={paginationMeta?.total ?? tasks.length} color="text-white" />
            <Stat label="Pending" count={counts['pending'] ?? 0} color="text-amber-300" />
            <Stat label="In Progress" count={counts['in-progress'] ?? 0} color="text-blue-300" />
            <Stat label="Completed" count={counts['completed'] ?? 0} color="text-emerald-300" />
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Filter bar */}
        {!isLoading && !error && (
          <div className="mb-6 animate-fade-in">
            <FilterBar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              total={paginationMeta?.total ?? tasks.length}
            />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-crown-800 text-xl mb-2">Unable to load tasks</h3>
            <p className="text-slate-500 font-sans text-sm mb-6 max-w-sm">{error}</p>
            <button
              onClick={() => void refresh()}
              className="px-5 py-2 rounded-lg text-sm font-semibold font-sans bg-crown-800 text-white hover:bg-crown-700 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && <LoadingGrid />}

        {/* Task grid */}
        {!isLoading && !error && tasks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                onEdit={setEditTask}
                onDelete={setDeleteTarget}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && tasks.length === 0 && (
          <EmptyState
            hasFilters={hasFilters}
            onCreateClick={() => setShowCreateModal(true)}
          />
        )}

        {/* Pagination */}
        {!isLoading && paginationMeta && paginationMeta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              disabled={paginationMeta.page <= 1}
              onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) - 1 }))}
              className="px-3 py-1.5 rounded-lg text-sm font-sans font-medium text-slate-600 
                         bg-white border border-slate-200 hover:border-slate-300 
                         disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>
            <span className="text-sm font-sans text-slate-500 px-2">
              Page {paginationMeta.page} of {paginationMeta.totalPages}
            </span>
            <button
              disabled={paginationMeta.page >= paginationMeta.totalPages}
              onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) + 1 }))}
              className="px-3 py-1.5 rounded-lg text-sm font-sans font-medium text-slate-600 
                         bg-white border border-slate-200 hover:border-slate-300 
                         disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create new task"
        maxWidth="md"
      >
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={Boolean(editTask)}
        onClose={() => setEditTask(null)}
        title="Edit task"
        maxWidth="md"
      >
        <TaskForm
          task={editTask}
          onSubmit={handleEdit}
          onCancel={() => setEditTask(null)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete task"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
        danger
      />
    </div>
  );
}

export default App;
