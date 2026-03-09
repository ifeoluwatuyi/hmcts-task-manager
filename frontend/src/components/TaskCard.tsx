import React, { useState } from 'react';
import { format, isAfter, parseISO } from 'date-fns';
import { Task, TaskStatus } from '../types/task.types';
import { StatusBadge } from './StatusBadge';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (id: number, status: TaskStatus) => Promise<void>;
  index: number;
}

const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const STATUSES: TaskStatus[] = ['pending', 'in-progress', 'completed', 'cancelled'];

export const TaskCard: React.FC<TaskCardProps> = ({
  task, onEdit, onDelete, onStatusChange, index,
}) => {
  const [statusChanging, setStatusChanging] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const dueDate = parseISO(task.due_date);
  const isOverdue = isAfter(new Date(), dueDate) && task.status !== 'completed' && task.status !== 'cancelled';
  const formattedDate = format(dueDate, "d MMM yyyy, HH:mm");

  const handleStatusSelect = async (status: TaskStatus) => {
    if (status === task.status) { setShowStatusMenu(false); return; }
    setStatusChanging(true);
    setShowStatusMenu(false);
    try {
      await onStatusChange(task.id, status);
    } finally {
      setStatusChanging(false);
    }
  };

  return (
    <div
      className="group bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover 
                 transition-all duration-200 hover:-translate-y-0.5 animate-slide-up overflow-hidden"
      style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
    >
      {/* Status accent stripe */}
      <div className={`h-1 w-full ${
        task.status === 'pending' ? 'bg-amber-400' :
        task.status === 'in-progress' ? 'bg-blue-500' :
        task.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-300'
      }`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-crown-800 text-base leading-snug line-clamp-2 mb-1.5">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-slate-500 line-clamp-2 font-body leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-crown-700 hover:bg-crown-50 transition-colors"
              title="Edit task"
            >
              <EditIcon />
            </button>
            <button
              onClick={() => onDelete(task)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete task"
            >
              <TrashIcon />
            </button>
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
          {/* Due date */}
          <span className={`flex items-center gap-1.5 text-xs font-sans ${
            isOverdue ? 'text-red-600 font-medium' : 'text-slate-400'
          }`}>
            <CalendarIcon />
            {isOverdue ? 'Overdue · ' : ''}{formattedDate}
          </span>

          {/* Status selector */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              disabled={statusChanging}
              className="flex items-center gap-1 transition-transform hover:scale-105"
              title="Change status"
            >
              <StatusBadge status={task.status} size="sm" />
              {statusChanging && (
                <span className="ml-1">
                  <svg className="w-3 h-3 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </span>
              )}
            </button>

            {showStatusMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
                <div className="absolute bottom-full right-0 mb-2 z-20 bg-white rounded-xl shadow-modal 
                               border border-slate-200 py-1.5 min-w-[160px] animate-scale-in">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => void handleStatusSelect(s)}
                      className={`w-full text-left px-3 py-2 text-sm font-sans flex items-center gap-2
                        hover:bg-slate-50 transition-colors ${s === task.status ? 'opacity-40 cursor-default' : ''}`}
                    >
                      <StatusBadge status={s} size="sm" />
                      {s === task.status && (
                        <svg className="w-3 h-3 ml-auto text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Task ID */}
        <div className="mt-2 text-right">
          <span className="text-xs text-slate-300 font-mono">#{task.id}</span>
        </div>
      </div>
    </div>
  );
};
