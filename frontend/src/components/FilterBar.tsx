import React from 'react';
import { TaskFilters, TaskStatus } from '../types/task.types';

interface FilterBarProps {
  filters: TaskFilters;
  onFiltersChange: (f: TaskFilters) => void;
  total: number;
}

const STATUS_OPTIONS: { value: TaskStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'created_at|DESC', label: 'Newest first' },
  { value: 'created_at|ASC',  label: 'Oldest first' },
  { value: 'due_date|ASC',    label: 'Due soon' },
  { value: 'due_date|DESC',   label: 'Due later' },
  { value: 'title|ASC',       label: 'Title A–Z' },
  { value: 'title|DESC',      label: 'Title Z–A' },
];

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFiltersChange, total }) => {
  const currentSort = `${filters.sortBy ?? 'created_at'}|${filters.sortOrder ?? 'DESC'}`;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as TaskStatus | '';
    onFiltersChange({ ...filters, status: val || undefined, page: 1 });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('|') as [
      TaskFilters['sortBy'], 'ASC' | 'DESC'
    ];
    onFiltersChange({ ...filters, sortBy, sortOrder, page: 1 });
  };

  const selectClass = `px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-sans 
                       text-slate-700 outline-none cursor-pointer
                       focus:ring-2 focus:ring-gold-400 focus:border-gold-400 
                       hover:border-slate-300 transition-all`;

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <p className="text-sm text-slate-500 font-sans">
        <span className="font-semibold text-crown-800">{total}</span>{' '}
        {total === 1 ? 'task' : 'tasks'}{' '}
        {filters.status ? `· ${filters.status}` : ''}
      </p>

      <div className="flex items-center gap-2">
        <select
          value={filters.status ?? ''}
          onChange={handleStatusChange}
          aria-label="Filter by status"
          className={selectClass}
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={currentSort}
          onChange={handleSortChange}
          aria-label="Sort tasks"
          className={selectClass}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
