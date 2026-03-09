import React from 'react';
import { TaskStatus, STATUS_LABELS, STATUS_COLORS } from '../types/task.types';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md';
}

const STATUS_DOTS: Record<TaskStatus, string> = {
  'pending':    'bg-amber-500',
  'in-progress':'bg-blue-500',
  'completed':  'bg-emerald-500',
  'cancelled':  'bg-slate-400',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${STATUS_COLORS[status]} ${sizeClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
};
