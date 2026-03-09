import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Task, CreateTaskFormData, TaskStatus } from '../types/task.types';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: CreateTaskFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'pending',     label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed',  label: 'Completed' },
  { value: 'cancelled',  label: 'Cancelled' },
];

function toLocalDateTimeValue(isoString: string): string {
  try {
    const d = new Date(isoString);
    return format(d, "yyyy-MM-dd'T'HH:mm");
  } catch {
    return '';
  }
}

function toISOString(localDT: string): string {
  return new Date(localDT).toISOString();
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task, onSubmit, onCancel, isSubmitting,
}) => {
  const isEdit = Boolean(task);

  const [formData, setFormData] = useState<CreateTaskFormData>({
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? 'pending',
    due_date: task ? toLocalDateTimeValue(task.due_date) : '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateTaskFormData, string>>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        due_date: toLocalDateTimeValue(task.due_date),
      });
    }
  }, [task]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be 200 characters or fewer';
    }
    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must be 2000 characters or fewer';
    }
    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof CreateTaskFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...formData,
      due_date: toISOString(formData.due_date),
    });
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-5">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold font-sans text-crown-800 mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Review case file CAS-2026-001"
          maxLength={200}
          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-sans text-slate-800 
                     bg-white transition-all outline-none
                     placeholder:text-slate-300
                     focus:ring-2 focus:ring-gold-400 focus:border-gold-400
                     ${errors.title ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400'}`}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600 font-sans">{errors.title}</p>
        )}
        <p className="mt-1 text-xs text-slate-400 font-sans text-right">
          {formData.title.length}/200
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold font-sans text-crown-800 mb-1.5">
          Description <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add further context or instructions for this task..."
          rows={3}
          maxLength={2000}
          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-sans text-slate-800
                     bg-white transition-all outline-none resize-none
                     placeholder:text-slate-300
                     focus:ring-2 focus:ring-gold-400 focus:border-gold-400
                     ${errors.description ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400'}`}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600 font-sans">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-slate-400 font-sans text-right">
          {(formData.description ?? '').length}/2000
        </p>
      </div>

      {/* Status & Due Date row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-semibold font-sans text-crown-800 mb-1.5">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 hover:border-slate-400
                       text-sm font-sans text-slate-800 bg-white outline-none
                       focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all cursor-pointer"
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="due_date" className="block text-sm font-semibold font-sans text-crown-800 mb-1.5">
            Due date <span className="text-red-500">*</span>
          </label>
          <input
            id="due_date"
            name="due_date"
            type="datetime-local"
            value={formData.due_date}
            onChange={handleChange}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-sans text-slate-800
                       bg-white outline-none transition-all
                       focus:ring-2 focus:ring-gold-400 focus:border-gold-400
                       ${errors.due_date ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400'}`}
          />
          {errors.due_date && (
            <p className="mt-1 text-xs text-red-600 font-sans">{errors.due_date}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg text-sm font-semibold font-sans text-slate-600
                     bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 rounded-lg text-sm font-semibold font-sans text-crown-900
                     bg-gold-500 hover:bg-gold-400 transition-all 
                     disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {isSubmitting && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isEdit ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  );
};
